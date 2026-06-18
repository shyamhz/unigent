import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { SignOutLink } from '@/components/sign-out-link';

export const dynamic = 'force-dynamic';

export default async function ComingSoonPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-primary"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span className="text-sm font-semibold text-primary">Unigent</span>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8">
          <h1 className="mb-3 text-2xl font-semibold text-foreground">
            Access coming soon
          </h1>
          <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
            You&apos;ve signed up successfully. We&apos;re rolling out access
            gradually — you&apos;ll receive an email when your account is ready.
          </p>

          <div className="mb-6 rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Expected wait: <span className="font-medium text-foreground">1–2 business days</span>
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Email notification</p>
                <p className="text-xs text-muted-foreground">
                  We&apos;ll notify you when access is granted
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Early access</p>
                <p className="text-xs text-muted-foreground">
                  Priority access to new features
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <SignOutLink />
        <p className="mt-4 text-xs text-muted-foreground">
          unigent.in &middot; AI Agents at the Speed of Thought
        </p>
      </div>
    </div>
  );
}
