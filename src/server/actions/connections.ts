'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/server/db';
import { corsairAccounts, corsairIntegrations } from '@/server/db/schema';
import { eq, and } from 'drizzle-orm';

export type PluginName = 'gmail' | 'googlecalendar';

const INTEGRATION_NAMES: Record<PluginName, string> = {
  gmail: 'gmail',
  googlecalendar: 'googlecalendar',
};

async function hasAccount(userId: string, integrationName: string): Promise<boolean> {
  const result = await db
    .select({ id: corsairAccounts.id })
    .from(corsairAccounts)
    .innerJoin(corsairIntegrations, eq(corsairAccounts.integrationId, corsairIntegrations.id))
    .where(
      and(
        eq(corsairAccounts.tenantId, userId),
        eq(corsairIntegrations.name, integrationName),
      ),
    )
    .limit(1);
  return result.length > 0;
}

export async function checkConnections(): Promise<Record<PluginName, boolean>> {
  const { userId } = await auth();
  if (!userId) return { gmail: false, googlecalendar: false };

  try {
    const [gmail, googlecalendar] = await Promise.all([
      hasAccount(userId, INTEGRATION_NAMES.gmail),
      hasAccount(userId, INTEGRATION_NAMES.googlecalendar),
    ]);
    return { gmail, googlecalendar };
  } catch {
    return { gmail: false, googlecalendar: false };
  }
}
