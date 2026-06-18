'use client';

import { SignOutButton } from '@clerk/nextjs';

export function SignOutLink() {
  return (
    <SignOutButton>
      <button className="mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">
        Sign out
      </button>
    </SignOutButton>
  );
}
