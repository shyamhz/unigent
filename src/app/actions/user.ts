'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { sendEmail } from '@/lib/email';
import { getAccessGrantedEmail } from '@/emails/access-granted';

export type UserMetadata = {
  access_allowed?: boolean;
  onboarded?: boolean;
  tier?: 'free' | 'pro';
  connections?: {
    gmail?: boolean;
    calendar?: boolean;
  };
};

export async function getUserMetadata(): Promise<UserMetadata> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const meta = (user.publicMetadata || {}) as UserMetadata;

  return {
    access_allowed: meta.access_allowed ?? false,
    onboarded: meta.onboarded ?? false,
    tier: meta.tier ?? 'free',
    connections: {
      gmail: meta.connections?.gmail ?? false,
      calendar: meta.connections?.calendar ?? false,
    },
  };
}

export async function isAccessAllowed(): Promise<boolean> {
  const meta = await getUserMetadata();
  return meta.access_allowed === true;
}

export async function isOnboarded(): Promise<boolean> {
  const meta = await getUserMetadata();
  return meta.onboarded === true;
}

export async function markOnboarded(): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata || {}) as UserMetadata;

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...existing,
      onboarded: true,
      connections: {
        gmail: true,
        calendar: true,
      },
    },
  });
}

export async function grantAccess(userId: string): Promise<void> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata || {}) as UserMetadata;
  const email = user.emailAddresses?.[0]?.emailAddress;
  const firstName = user.firstName || '';

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...existing,
      access_allowed: true,
      tier: existing.tier || 'free',
    },
  });

  if (email) {
    await sendEmail({
      to: email,
      subject: 'Welcome to Unigent — Your account is ready',
      html: getAccessGrantedEmail(firstName),
    });
  }
}

export async function updateConnections(connections: {
  gmail?: boolean;
  calendar?: boolean;
}): Promise<void> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const existing = (user.publicMetadata || {}) as UserMetadata;

  await client.users.updateUser(userId, {
    publicMetadata: {
      ...existing,
      connections: {
        ...existing.connections,
        ...connections,
      },
    },
  });
}
