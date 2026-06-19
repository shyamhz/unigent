import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const DEV_KEY = process.env.CORSAIR_DEV_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  if (error) {
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=missing_params", baseUrl)
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
    }

    // Forward the OAuth code to the hosted Corsair API to store tokens
    const tokenRes = await fetch(
      `https://api.corsair.dev/instances/${INSTANCE_ID}/oauth-callback`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${DEV_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          state,
          tenant_id: userId,
          redirect_uri: `${baseUrl}/api/corsair/oauth/callback`,
        }),
      },
    );

    if (!tokenRes.ok) {
      console.error("Corsair token exchange failed:", await tokenRes.text());
    }

    // Update Clerk metadata
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;

    const existing = (meta.connections ?? {}) as Record<string, unknown>;
    const wasGmailConnected = existing.gmail === true;
    const wasCalendarConnected = existing.calendar === true;

    const connections: Record<string, boolean> = {
      gmail: wasGmailConnected || (!wasGmailConnected && !wasCalendarConnected),
      calendar: wasCalendarConnected || (wasGmailConnected && !wasCalendarConnected),
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
        new URL("/onboarding?connected=true", baseUrl)
      );
    }

    return NextResponse.redirect(
      new URL("/onboarding?step=connect-calendar", baseUrl)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/onboarding?error=oauth_failed", baseUrl)
    );
  }
}
