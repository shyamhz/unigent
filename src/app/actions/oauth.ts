'use server';

import { auth } from '@clerk/nextjs/server';
import { generateOAuthUrl } from 'corsair/oauth';
import { setupCorsair } from 'corsair';
import { corsair } from '@/utils/corsair';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function ensureIntegration() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
  const redirectUrl = `${appUrl}/api/corsair/oauth/callback`;

  await setupCorsair(corsair, {
    credentials: {
      gmail: {
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_url: redirectUrl,
      },
      googlecalendar: {
        client_id: GOOGLE_CLIENT_ID!,
        client_secret: GOOGLE_CLIENT_SECRET!,
        redirect_url: redirectUrl,
      },
    },
  });
}

export async function getGoogleOAuthUrl(plugin: 'gmail' | 'googlecalendar' = 'gmail'): Promise<{ url?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Not authenticated' };

    // Ensure OAuth credentials are configured in the database.
    // setupCorsair is idempotent — skips existing rows.
    await ensureIntegration();

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const redirectUri = `${appUrl}/api/corsair/oauth/callback`;

    const result = await generateOAuthUrl(corsair, plugin, {
      tenantId: userId,
      redirectUri,
    });

    return { url: result.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate OAuth URL' };
  }
}
