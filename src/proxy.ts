import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/coming-soon(.*)",
  "/waiting(.*)",
  "/api/corsair/oauth/callback(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  // Logged-in users hitting marketing page → redirect to dashboard
  if (userId && req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Logged-out users hitting protected routes → redirect to sign-in
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  // Logged-in users on protected routes: check access_allowed
  if (userId && !isPublicRoute(req)) {
    const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
    const accessAllowed = meta.access_allowed === true;

    if (!accessAllowed && req.nextUrl.pathname !== "/waiting") {
      return NextResponse.redirect(new URL("/waiting", req.url));
    }
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
