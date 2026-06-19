import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const DEV_KEY = process.env.CORSAIR_DEV_KEY!;

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

    // Verify tenant has credentials by listing plugins for this tenant
    // The connect link already stored tokens — we just confirm and update Clerk metadata
    const tokenRes = await fetch(
      `https://api.corsair.dev/instances/${INSTANCE_ID}/tenants/${userId}/plugins`,
      {
        headers: {
          Authorization: `Bearer ${DEV_KEY}`,
        },
      },
    );

    let gmailConnected = false;
    let calendarConnected = false;

    if (tokenRes.ok) {
      const data = await tokenRes.json() as { plugins: Array<{ pluginId: string; hasCredentials: boolean }> };
      for (const p of data.plugins || []) {
        if (p.pluginId === "gmail" && p.hasCredentials) gmailConnected = true;
        if (p.pluginId === "googlecalendar" && p.hasCredentials) calendarConnected = true;
      }
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
