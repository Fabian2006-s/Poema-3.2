import { NextResponse, type NextRequest } from 'next/server';

const nombreCookieSesion = 'poema_session';

export function proxy(request: NextRequest): Response {
  if (request.cookies.has(nombreCookieSesion)) return NextResponse.next();

  if (request.nextUrl.pathname.startsWith('/api/finca/')) {
    return NextResponse.json(
      {
        ok: false,
        error: { codigo: 'NO_AUTORIZADO', mensaje: 'Debe iniciar sesión.' },
      },
      { status: 401, headers: { 'Cache-Control': 'no-store' } },
    );
  }

  const destino = request.nextUrl.clone();
  destino.pathname = '/login';
  destino.search = '';
  return NextResponse.redirect(destino);
}

export const config = {
  matcher: ['/finca/:path*', '/api/finca/:path*'],
};
