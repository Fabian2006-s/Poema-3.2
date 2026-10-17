import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  buscarTokenVigentePorHash,
  cambiarContrasenaUsuario,
  invalidarTokensPendientes,
  liberarReservaToken,
  marcarTokenComoUsado,
  reservarTokenVigente,
} from '@/lib/dataService';
import { calcularHashToken } from '@/lib/tokenRecuperacion';

const esquemaSolicitud = z
  .object({
    token: z.string().regex(/^[a-f\d]{64}$/i),
    contrasena: z.string().min(8),
    confirmacion: z.string(),
  })
  .refine((datos) => datos.contrasena === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'Las contraseñas no coinciden.',
  });

const mensajeEnlaceInvalido = 'El enlace no es válido o ya venció.';

export async function POST(request: Request): Promise<Response> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }

  const validacion = esquemaSolicitud.safeParse(cuerpo);
  if (!validacion.success) {
    return NextResponse.json(
      { error: validacion.error.issues[0]?.message ?? 'Los datos no son válidos.' },
      { status: 400 },
    );
  }

  let idReservado: string | undefined;
  let contrasenaActualizada = false;
  try {
    const registro = await buscarTokenVigentePorHash(calcularHashToken(validacion.data.token));
    if (!registro) return NextResponse.json({ error: mensajeEnlaceInvalido }, { status: 400 });
    if (!(await reservarTokenVigente(registro.id))) {
      return NextResponse.json({ error: mensajeEnlaceInvalido }, { status: 400 });
    }
    idReservado = registro.id;

    const actualizado = await cambiarContrasenaUsuario(registro.usuarioId, validacion.data.contrasena);
    if (!actualizado) {
      await liberarReservaToken(registro.id);
      return NextResponse.json({ error: mensajeEnlaceInvalido }, { status: 400 });
    }
    contrasenaActualizada = true;

    await marcarTokenComoUsado(registro.id);
    await invalidarTokensPendientes(registro.usuarioId);
    return NextResponse.json({ mensaje: 'La contraseña se actualizó. Ya puedes iniciar sesión.' });
  } catch {
    if (idReservado && !contrasenaActualizada) {
      await liberarReservaToken(idReservado).catch(() => undefined);
    }
    return NextResponse.json({ error: 'No se pudo restablecer la contraseña. Inténtalo de nuevo.' }, { status: 500 });
  }
}