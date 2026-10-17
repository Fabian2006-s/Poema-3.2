import { NextResponse } from 'next/server';

export async function POST(): Promise<Response> {
  const response = NextResponse.json({ message: 'Sesión cerrada.' });
  response.cookies.delete('poema_session');
  return response;
}