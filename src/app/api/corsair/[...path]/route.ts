import { managementHandler } from 'corsair';
import { corsair } from '@/utils/corsair';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

const handler = managementHandler(corsair, { basePath: '/api/corsair' });

// Allow OAuth callback without auth, but require auth for all other Corsair endpoints
async function requireAuth(request: NextRequest) {
  // OAuth callback routes are public (Google redirects here)
  if (request.nextUrl.pathname.includes('/oauth/callback')) {
    return null; // No auth required for OAuth callback
  }

  // All other Corsair endpoints require authentication
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized: Authentication required' },
      { status: 401 }
    );
  }
  return null; // Auth passed
}

export async function GET(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  return handler(request);
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;
  return handler(request);
}
