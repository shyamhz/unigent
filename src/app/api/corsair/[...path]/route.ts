import { managementHandler } from 'corsair';
import { corsair } from '@/utils/corsair';
import { NextRequest } from 'next/server';

const handler = managementHandler(corsair, { basePath: '/api/corsair' });

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
