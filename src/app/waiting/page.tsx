import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { SignOutLink } from "@/client/components/sign-out-link";

export default async function WaitingPage() {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const meta = (sessionClaims?.publicMetadata ?? {}) as Record<string, unknown>;
  if (meta.access_allowed === true) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-semibold text-foreground">You&apos;re on the waitlist</h1>
        <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
          Your account is pending approval. We&apos;ll send you an email once
          you&apos;re granted access. This usually takes less than 24 hours.
        </p>
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-xs text-muted-foreground">
            Check your inbox for an activation email from Unigent.
          </p>
          <SignOutLink />
        </div>
      </div>
    </div>
  );
}
