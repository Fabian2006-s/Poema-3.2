import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth/session';
import { createRegisteredUser } from '@/lib/auth/users';
import { mostrarRegistroPublico } from '@/lib/auth/registro';
import { conManejoDeErrores, leerCuerpo } from '@/lib/http/respuestas';
import { esquemaCrearUsuario } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const POST = conManejoDeErrores(async (request: Request): Promise<Response> => {
  if (!(await mostrarRegistroPublico())) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: 'REGISTRO_NO_DISPONIBLE',
          mensaje: 'La cuenta inicial ya existe. Solicita una cuenta al encargado.',
        },
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const datos = await leerCuerpo(request, esquemaCrearUsuario);
  const usuario = await createRegisteredUser(datos.email, datos.password);
  if (!usuario) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: 'REGISTRO_NO_DISPONIBLE',
          mensaje: 'La cuenta inicial ya existe. Solicita una cuenta al encargado.',
        },
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const respuestaConCookie = NextResponse.json(
    { ok: true, datos: usuario },
    { status: 201, headers: { 'Cache-Control': 'no-store' } },
  );
  respuestaConCookie.cookies.set('poema_session', createSessionToken(usuario.email), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return respuestaConCookie;
});
