import { NextResponse } from 'next/server';

export async function GET() {
  // Temporary diagnostic endpoint - will be removed after setup
  const vars: Record<string, string> = {};
  const keys = [
    'DATABASE_URL',
    'magic_POSTGRES_URL',
    'magic_POSTGRES_PRISMA_URL',
    'magic_POSTGRES_URL_NON_POOLING',
    'magic_POSTGRES_HOST',
    'magic_POSTGRES_DATABASE',
    'magic_POSTGRES_USER',
    'magic_POSTGRES_PASSWORD',
    'magic_SUPABASE_URL',
  ];
  for (const key of keys) {
    const val = process.env[key];
    if (val) {
      // Mask password for security but show enough to verify
      vars[key] = val.replace(/:([^@]{2})[^@]+@/, ':$1****@');
    }
  }
  return NextResponse.json(vars);
}
