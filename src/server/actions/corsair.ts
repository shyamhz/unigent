'use server';

import { auth } from '@clerk/nextjs/server';
import { isHostedAvailable, getOrCreateTenant } from '@/server/services/corsair-hosted';

const INSTANCE_ID = process.env.CORSAIR_INSTANCE_ID!;
const DEV_KEY = process.env.CORSAIR_DEV_KEY!;

export async function getConnectUrl(): Promise<string | null> {
  if (!isHostedAvailable()) return null;

  const { userId } = await auth();
  if (!userId) return null;

  const tenantId = await getOrCreateTenant(userId);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const redirectUri = `${appUrl}/api/corsair/oauth/callback`;

  const res = await fetch(
    `https://api.corsair.dev/instances/${INSTANCE_ID}/tenants/${tenantId}/connect-link`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${DEV_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plugins: ['gmail', 'googlecalendar'],
        redirect_uri: redirectUri,
      }),
    },
  );

  if (!res.ok) return null;
  const data = await res.json();
  return data.url || null;
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
