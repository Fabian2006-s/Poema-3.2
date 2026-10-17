import { NextResponse } from 'next/server';
import { getAuthenticatedEmail } from '@/lib/auth/session';
import { findUserByEmail, updateUserPassword, verifyPassword } from '@/lib/auth/users';

export async function POST(request: Request): Promise<Response> {
  const email = await getAuthenticatedEmail();
  if (!email) return NextResponse.json({ error: 'Inicia sesión para continuar.' }, { status: 401 });

  let body: { currentPassword?: unknown; newPassword?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 });
  }

  if (typeof body.currentPassword !== 'string' || typeof body.newPassword !== 'string') {
    return NextResponse.json({ error: 'Completa ambas contraseñas.' }, { status: 400 });
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres.' }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(body.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 400 });
  }
  if (body.currentPassword === body.newPassword) {
    return NextResponse.json({ error: 'La nueva contraseña debe ser diferente.' }, { status: 400 });
  }

  await updateUserPassword(email, body.newPassword);
  return NextResponse.json({ message: 'La contraseña se actualizó correctamente.' });
}