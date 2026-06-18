'use server';

import { auth } from '@clerk/nextjs/server';
import { generateOAuthUrl } from 'corsair/oauth';
import { corsair } from '@/utils/corsair';

export async function getGoogleOAuthUrl(plugin: 'gmail' | 'googlecalendar' = 'gmail'): Promise<{ url?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { error: 'Not authenticated' };

    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const redirectUri = `${baseUrl}/api/corsair/oauth/callback`;

    const result = await generateOAuthUrl(corsair, plugin, {
      tenantId: userId,
      redirectUri,
    });

    return { url: result.url };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate OAuth URL' };
  }
}
