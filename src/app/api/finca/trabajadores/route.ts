import { exigirSesion } from '@/lib/auth/sesion';
import { crearTrabajador, listarTrabajadores } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  leerParametros,
  responderOk,
} from '@/lib/http/respuestas';
import {
  esquemaFiltros,
  esquemaTrabajador,
} from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaFiltrosTrabajador = esquemaFiltros.pick({
  estado: true,
  incluirInactivos: true,
  cargo: true,
});

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const filtros = leerParametros(request, esquemaFiltrosTrabajador);
  const datos = await listarTrabajadores(filtros);
  return responderOk(datos);
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaTrabajador);
  return responderOk(await crearTrabajador(datos), 201);
});
