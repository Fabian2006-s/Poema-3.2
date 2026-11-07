import { NextResponse } from 'next/server';
import { ZodError, type ZodType } from 'zod';
import { ErrorDeNegocio, type CodigoError, ESTADO_HTTP, MENSAJES } from '@/lib/reglas/errores';

const encabezadosSinCache = { 'Cache-Control': 'no-store' };

export function responderOk<T>(datos: T, estado = 200): Response {
  return NextResponse.json({ ok: true, datos }, { status: estado, headers: encabezadosSinCache });
}

export function responderError(error: unknown): Response {
  if (error instanceof ErrorDeNegocio) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: error.codigo,
          mensaje: error.message,
          ...(error.detalles === undefined ? {} : { detalles: error.detalles }),
        },
      },
      { status: ESTADO_HTTP[error.codigo], headers: encabezadosSinCache },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          codigo: 'DATOS_INVALIDOS',
          mensaje: MENSAJES.DATOS_INVALIDOS,
          detalles: error.flatten(),
        },
      },
      { status: ESTADO_HTTP.DATOS_INVALIDOS, headers: encabezadosSinCache },
    );
  }

  if (esErrorPostgres(error)) {
    const codigo = traducirErrorPostgres(error);
    if (codigo) {
      return NextResponse.json(
        {
          ok: false,
          error: { codigo, mensaje: MENSAJES[codigo] },
        },
        { status: ESTADO_HTTP[codigo], headers: encabezadosSinCache },
      );
    }
  }

  console.error('Error interno en la API de finca:', error);
  return NextResponse.json(
    {
      ok: false,
      error: { codigo: 'ERROR_INTERNO', mensaje: MENSAJES.ERROR_INTERNO },
    },
    { status: ESTADO_HTTP.ERROR_INTERNO, headers: encabezadosSinCache },
  );
}

export function conManejoDeErrores<Args extends unknown[]>(
  manejador: (...args: Args) => Promise<Response>,
): (...args: Args) => Promise<Response> {
  return async (...args) => {
    try {
      return await manejador(...args);
    } catch (error) {
      return responderError(error);
    }
  };
}

export async function leerCuerpo<T>(request: Request, esquema: ZodType<T>): Promise<T> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  return esquema.parse(cuerpo);
}

function esErrorPostgres(error: unknown): error is { code: string; constraint?: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

function traducirErrorPostgres(error: { code: string; constraint?: string }): CodigoError | null {
  if (error.code === '23505') {
    switch (error.constraint) {
      case 'ux_trab_documento':
        return 'DOCUMENTO_DUPLICADO';
      case 'ux_impl_nombre':
        return 'IMPLEMENTO_DUPLICADO';
      case 'ux_quim_nombre':
        return 'QUIMICO_DUPLICADO';
      default:
        return 'DATOS_INVALIDOS';
    }
  }
  if (error.code === '23503') return 'TIENE_DEPENDENCIAS';
  if (error.code === '23514') return 'DATOS_INVALIDOS';
  return null;
}
