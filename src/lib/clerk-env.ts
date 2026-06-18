function readEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

/** Clerk publishable key (client ID) for browser sign-in / sign-up. */
export function getClerkPublishableKey(): string {
  const key = readEnv(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_PUBLISHABLE_KEY",
    "CLERK_CLIENT_ID",
  );

  if (!key) {
    throw new Error(
      "Missing Clerk publishable key. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY or CLERK_CLIENT_ID.",
    );
  }

  return key;
}

/** Clerk secret key (client secret) for server-side auth. Never expose to the client. */
export function getClerkSecretKey(): string {
  const key = readEnv("CLERK_SECRET_KEY", "CLERK_CLIENT_SECRET");

  if (!key) {
    throw new Error(
      "Missing Clerk secret key. Set CLERK_SECRET_KEY or CLERK_CLIENT_SECRET.",
    );
  }

  return key;
}

export const clerkAuthUrls = {
  signIn: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in",
  signUp: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up",
  signInFallbackRedirect:
    process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL ?? "/dashboard",
  signUpFallbackRedirect:
    process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL ?? "/dashboard",
} as const;

export const clerkMiddlewareKeys = {
  publishableKey: getClerkPublishableKey(),
  secretKey: getClerkSecretKey(),
} as const;
