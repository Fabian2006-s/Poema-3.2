import { NextResponse } from 'next/server';
import { getAuthenticatedEmail } from '@/lib/auth/session';

export async function GET(): Promise<Response> {
  const email = await getAuthenticatedEmail();
  if (!email) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
  return NextResponse.json({ email });
}