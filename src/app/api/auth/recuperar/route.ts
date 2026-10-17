import { NextResponse } from 'next/server';
import { z } from 'zod';
import { enviarCorreo } from '@/lib/correo';
import {
  buscarUsuarioPorEmail,
  crearTokenRestablecimiento,
  invalidarTokensPendientes,
  registrarSolicitudSiPermitida,
} from '@/lib/dataService';
import { plantillaRecuperacion } from '@/lib/plantillasCorreo';
import { calcularHashToken, generarToken } from '@/lib/tokenRecuperacion';
import { obtenerUrlBase } from '@/lib/urlBase';

const esquemaSolicitud = z.object({ email: z.email() });
const mensajeGenerico = 'Si el correo está registrado, recibirás un enlace para restablecer la contraseña.';

export async function POST(request: Request): Promise<Response> {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'La solicitud no es válida.' }, { status: 400 });
  }

  const validacion = esquemaSolicitud.safeParse(cuerpo);
  if (!validacion.success) {
    return NextResponse.json({ error: 'Escribe un correo electrónico válido.' }, { status: 400 });
  }

  try {
    const usuario = await buscarUsuarioPorEmail(validacion.data.email);
    if (!usuario) return NextResponse.json({ mensaje: mensajeGenerico });

    if (!(await registrarSolicitudSiPermitida(usuario.id))) {
      return NextResponse.json({ mensaje: mensajeGenerico });
    }

    await invalidarTokensPendientes(usuario.id);
    const token = generarToken();
    await crearTokenRestablecimiento(
      usuario.id,
      calcularHashToken(token),
      new Date(Date.now() + 30 * 60 * 1000),
    );

    const enlace = `${obtenerUrlBase()}/restablecer-contrasena?token=${token}`;
    const resultadoCorreo = await enviarCorreo({
      para: usuario.email,
      asunto: 'Restablecer contraseña',
      html: plantillaRecuperacion(enlace),
    });
    if (!resultadoCorreo.ok) {
      console.error('Falló el envío del correo de recuperación:', resultadoCorreo.error);
    }
  } catch {
    console.error('No se pudo procesar la solicitud de recuperación.');
    return NextResponse.json({ mensaje: mensajeGenerico });
  }

  return NextResponse.json({ mensaje: mensajeGenerico });
}