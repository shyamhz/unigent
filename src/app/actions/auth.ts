'use server';

import { auth } from '@clerk/nextjs/server';

export async function getCurrentUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized: No user session found');
  }
  return userId;
}

export async function isAuthenticated(): Promise<boolean> {
  const { userId } = await auth();
  return userId !== null;
}
