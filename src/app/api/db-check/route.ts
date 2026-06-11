import { NextResponse } from 'next/server';

export async function GET() {
  const vars: Record<string, string> = {};
  const keys = [
    'magic_SUPABASE_URL',
    'magic_SUPABASE_SERVICE_ROLE_KEY',
    'magic_SUPABASE_ANON_KEY',
  ];
  for (const key of keys) {
    const val = process.env[key];
    if (val) {
      vars[key] = val;
    }
  }
  return NextResponse.json(vars);
}
