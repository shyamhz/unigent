'use server';

import { auth } from '@clerk/nextjs/server';
import { isHostedAvailable, getOrCreateTenant, getConnectLink } from '@/server/services/corsair-hosted';

export async function getConnectUrl(): Promise<string | null> {
  if (!isHostedAvailable()) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const link = await getConnectLink(userId, ['gmail', 'googlecalendar']);
  return link?.url ?? null;
}

export async function provisionCorsairTenant(): Promise<{ tenantId: string; connectUrl: string | null }> {
  if (!isHostedAvailable()) {
    return { tenantId: '', connectUrl: null };
  }

  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');

  const tenantId = await getOrCreateTenant(userId);
  const connectUrl = await getConnectUrl();

  return { tenantId, connectUrl };
}
