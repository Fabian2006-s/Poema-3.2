import { exigirSesion } from '@/lib/auth/sesion';
import { listarMovimientos, registrarMovimiento } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  leerParametros,
  responderOk,
} from '@/lib/http/respuestas';
import { esquemaFiltros, esquemaMovimiento } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaFiltrosMovimiento = esquemaFiltros.pick({
  tipoElemento: true,
  elementoId: true,
  desde: true,
  hasta: true,
});

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const filtros = leerParametros(request, esquemaFiltrosMovimiento);
  return responderOk(await listarMovimientos(filtros));
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaMovimiento);
  return responderOk(await registrarMovimiento(datos), 201);
});
