import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkMiddlewareKeys } from "@/lib/clerk-env";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/corsair(.*)",
  "/coming-soon",
]);

const isLandingPage = createRouteMatcher(["/"]);
const isComingSoonPage = createRouteMatcher(["/coming-soon"]);
const isOnboardingPage = createRouteMatcher(["/onboarding"]);

export const proxy = clerkMiddleware(async (auth, request) => {
  const { userId, sessionClaims } = await auth();

  // ── Not logged in ──────────────────────────────────────────────
  if (!userId) {
    if (isPublicRoute(request) || isLandingPage(request)) return;
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // ── Read metadata from session JWT (no API call) ──────────────
  const meta = (sessionClaims?.public_metadata ?? {}) as Record<
    string,
    unknown
  >;
  const accessAllowed = meta.access_allowed === true;
  let onboarded = meta.onboarded === true;

  // ── Not allowed → coming soon ─────────────────────────────────
  if (!accessAllowed) {
    if (isComingSoonPage(request) || isPublicRoute(request)) return;
    return NextResponse.redirect(new URL("/coming-soon", request.url));
  }

  // ── Allowed but not onboarded → onboarding ────────────────────
  if (!onboarded) {
    // JWT may be stale — double-check Clerk directly for dashboard/onboarding
    if (!isOnboardingPage(request) && !isPublicRoute(request)) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        const freshMeta = (user.publicMetadata ?? {}) as Record<string, unknown>;
        if (freshMeta.onboarded === true) {
          onboarded = true;
        }
      } catch {
        // If we can't reach Clerk, fall through with stale JWT value
      }
    }

    if (!onboarded) {
      if (isOnboardingPage(request) || isPublicRoute(request)) return;
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // ── Allowed and onboarded — landing page → dashboard ──────────
  if (isLandingPage(request)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}, clerkMiddlewareKeys);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
