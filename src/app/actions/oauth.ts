'use server';

import { auth } from '@clerk/nextjs/server';
import { generateOAuthUrl } from 'corsair/oauth';
import { setupCorsair } from 'corsair';
import { corsair } from '@/utils/corsair';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function ensureIntegration() {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET environment variables');
  }
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

    console.log('[OAuth] GOOGLE_CLIENT_ID env:', GOOGLE_CLIENT_ID ? `${GOOGLE_CLIENT_ID.slice(0, 12)}...` : 'MISSING');
    console.log('[OAuth] NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL);
    console.log('[OAuth] redirectUri:', redirectUri);
    console.log('[OAuth] plugin:', plugin, 'tenantId:', userId);

    const result = await generateOAuthUrl(corsair, plugin, {
      tenantId: userId,
      redirectUri,
    });

    console.log('[OAuth] generated URL:', result.url);
    return { url: result.url };
  } catch (err) {
    console.error('[OAuth] error:', err);
    return { error: err instanceof Error ? err.message : 'Failed to generate OAuth URL' };
  }
}
