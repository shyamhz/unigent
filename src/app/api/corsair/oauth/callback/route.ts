import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { processOAuthCallback } from "corsair/oauth";
import { corsair } from "@/utils/corsair";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(
      new URL(`/onboarding?error=${encodeURIComponent(error)}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/onboarding?error=missing_params", request.url)
    );
  }

  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/corsair/oauth/callback`;

    await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });

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

    await client.users.updateUser(userId, {
      publicMetadata: {
        ...meta,
        onboarded: bothConnected,
        connections,
      },
    });

    if (bothConnected) {
      return NextResponse.redirect(
        new URL("/onboarding?connected=true", request.url)
      );
    }

    return NextResponse.redirect(
      new URL("/onboarding?step=connect-calendar", request.url)
    );
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      new URL("/onboarding?error=oauth_failed", request.url)
    );
  }
}
