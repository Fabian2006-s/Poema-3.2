import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth/session';
import { findUserByEmail, verifyPassword } from '@/lib/auth/users';

export async function POST(request: Request): Promise<Response> {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (typeof body.email !== 'string' || typeof body.password !== 'string') {
    return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(body.email.trim().toLowerCase());
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: 'Correo o contraseña incorrectos.' }, { status: 401 });
    }

    const response = NextResponse.json({ email: user.email });
    response.cookies.set('poema_session', createSessionToken(user.email), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error('No se pudo completar el login:', error);
    return NextResponse.json(
      { error: 'El acceso no está configurado correctamente en el servidor.' },
      { status: 503 },
    );
  }
}