import { NextResponse } from 'next/server';
import { createSessionToken } from '@/lib/auth/session';
import { createUser } from '@/lib/auth/users';
import { registroPublicoHabilitado } from '@/lib/auth/registro';
import { conManejoDeErrores, leerCuerpo } from '@/lib/http/respuestas';
import { esquemaCrearUsuario } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export async function POST(request: Request): Promise<Response> {
  if (!registroPublicoHabilitado()) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: 'REGISTRO_NO_DISPONIBLE',
          mensaje: 'El registro público está deshabilitado. Solicita una cuenta al encargado.',
        },
      },
      { status: 403, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  return conManejoDeErrores(async (solicitud: Request) => {
    const datos = await leerCuerpo(solicitud, esquemaCrearUsuario);
    const usuario = await createUser(datos.email, datos.password);
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
  })(request);
}
