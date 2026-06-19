import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { corsairAccounts, corsairIntegrations } from "@/server/db/schema";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";

const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const DEV_KEY = process.env.CORSAIR_DEV_KEY!;

async function ensureCorsairIntegration(pluginId: string): Promise<string> {
  const existing = await db
    .select()
    .from(corsairIntegrations)
    .where(eq(corsairIntegrations.id, pluginId))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  await db.insert(corsairIntegrations).values({
    id: pluginId,
    name: pluginId,
    config: {},
  });
  return pluginId;
}

async function createCorsairAccountIfMissing(userId: string, pluginId: string) {
  const accountId = `${userId}:${pluginId}`;
  const existing = await db
    .select()
    .from(corsairAccounts)
    .where(eq(corsairAccounts.id, accountId))
    .limit(1);

  if (existing.length > 0) return;

  const integrationId = await ensureCorsairIntegration(pluginId);
  await db.insert(corsairAccounts).values({
    id: accountId,
    tenantId: userId,
    integrationId,
    config: {},
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const error = searchParams.get("error");

  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  if (error) {
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, baseUrl)
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", baseUrl));
    }

    // Verify tenant has credentials by checking plugins
    let gmailConnected = false;
    let calendarConnected = false;

    try {
      const tokenRes = await fetch(
        `https://api.corsair.dev/instances/${INSTANCE_ID}/plugins/gmail/credentials?tenantId=${userId}`,
        { headers: { Authorization: `Bearer ${DEV_KEY}` } },
      );
      if (tokenRes.ok) {
        const data = await tokenRes.json() as { fields: Array<{ field: string; scope: string; set: boolean }> };
        gmailConnected = data.fields.some((f) => f.scope === "account" && f.set);
      }
    } catch {}

    try {
      const tokenRes = await fetch(
        `https://api.corsair.dev/instances/${INSTANCE_ID}/plugins/googlecalendar/credentials?tenantId=${userId}`,
        { headers: { Authorization: `Bearer ${DEV_KEY}` } },
      );
      if (tokenRes.ok) {
        const data = await tokenRes.json() as { fields: Array<{ field: string; scope: string; set: boolean }> };
        calendarConnected = data.fields.some((f) => f.scope === "account" && f.set);
      }
    } catch {}

    // Create Corsair accounts in DB for connected plugins
    if (gmailConnected) {
      await createCorsairAccountIfMissing(userId, "gmail");
    }
    if (calendarConnected) {
      await createCorsairAccountIfMissing(userId, "googlecalendar");
    }

    // Update Clerk metadata
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const meta = (user.publicMetadata ?? {}) as Record<string, unknown>;
    const existing = (meta.connections ?? {}) as Record<string, unknown>;

    const wasGmailConnected = existing.gmail === true;
    const wasCalendarConnected = existing.calendar === true;

    const connections: Record<string, boolean> = {
      gmail: wasGmailConnected || gmailConnected,
      calendar: wasCalendarConnected || calendarConnected,
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
