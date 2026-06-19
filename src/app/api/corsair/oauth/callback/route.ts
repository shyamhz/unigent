import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI = "https://unigent.in/api/corsair/oauth/callback";

const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const DEV_KEY = process.env.CORSAIR_DEV_KEY!;
const BASE = `https://api.corsair.dev/instances/${INSTANCE_ID}`;

async function corsairApi(path: string, method: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${DEV_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function ensureTenant(tenantId: string) {
  const { tenants } = (await corsairApi("/tenants", "GET")) as {
    tenants: Array<{ id: string }>;
  };
  const existing = tenants.find((t) => t.id === tenantId);
  if (existing) return existing.id;
  const created = (await corsairApi("/tenants", "POST", { tenantId })) as {
    id: string;
  };
  return created.id;
}

async function storeTokensInCorsair(
  tenantId: string,
  pluginId: string,
  tokens: {
    access_token: string;
    refresh_token?: string;
    expires_at: string;
    scope: string;
  },
) {
  await ensureTenant(tenantId);

  const fields = [
    { field: "access_token", value: tokens.access_token },
    { field: "scope", value: tokens.scope },
    { field: "expires_at", value: tokens.expires_at },
  ];
  if (tokens.refresh_token) {
    fields.push({ field: "refresh_token", value: tokens.refresh_token });
  }

  for (const f of fields) {
    await corsairApi(
      `/tenants/${tenantId}/plugins/${pluginId}/credentials/${f.field}`,
      "PUT",
      { value: f.value },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = "https://unigent.in";

  if (error) {
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, baseUrl),
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=missing_params", baseUrl),
    );
  }

  try {
    const stateData = JSON.parse(
      Buffer.from(state, "base64url").toString(),
    );
    const userId = stateData.userId;

    if (!userId) {
      return NextResponse.redirect(
        new URL("/onboarding?error=invalid_state", baseUrl),
      );
    }

    // Exchange authorization code for tokens with Google
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      console.error("Google token exchange failed:", err);
      return NextResponse.redirect(
        new URL("/onboarding?error=token_exchange_failed", baseUrl),
      );
    }

    const tokenData = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      scope: string;
    };

    const expiresAt = new Date(
      Date.now() + tokenData.expires_in * 1000,
    ).toISOString();

    // Determine which plugins the scopes cover
    const scopes = tokenData.scope.split(" ");
    const hasGmail = scopes.some((s) =>
      s.startsWith("https://www.googleapis.com/auth/gmail"),
    );
    const hasCalendar = scopes.some((s) =>
      s.startsWith("https://www.googleapis.com/auth/calendar"),
    );

    // Store tokens in Corsair — that's it. No DB writes needed.
    const tokenPayload = {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope,
    };

    if (hasGmail) {
      await storeTokensInCorsair(userId, "gmail", tokenPayload);
    }
    if (hasCalendar) {
      await storeTokensInCorsair(userId, "googlecalendar", tokenPayload);
    }

    // Update Clerk metadata so the dashboard knows which accounts are connected
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const existing = (meta.connections ?? {}) as Record<string, unknown>;

    const wasGmail = existing.gmail === true;
    const wasCalendar = existing.calendar === true;

    const connections: Record<string, boolean> = {
      gmail: wasGmail || hasGmail,
      calendar: wasCalendar || hasCalendar,
    };

    const bothConnected = connections.gmail && connections.calendar;

    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        ...meta,
        onboarded: bothConnected,
        connections,
      },
    });

    if (bothConnected) {
      return NextResponse.redirect(
        new URL("/onboarding?connected=true", baseUrl),
      );
    }

    return NextResponse.redirect(
      new URL("/onboarding?step=connect-calendar", baseUrl),
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/onboarding?error=oauth_failed", baseUrl),
    );
  }
}
