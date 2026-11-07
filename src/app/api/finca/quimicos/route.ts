import { exigirSesion } from '@/lib/auth/sesion';
import { crearQuimico, listarQuimicos } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  leerParametros,
  responderOk,
} from '@/lib/http/respuestas';
import { esquemaFiltros, esquemaQuimico } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaFiltrosQuimico = esquemaFiltros.pick({
  incluirInactivos: true,
  soloBajos: true,
  soloPorVencer: true,
  categoria: true,
  estadoElemento: true,
});

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const filtros = leerParametros(request, esquemaFiltrosQuimico);
  return responderOk(await listarQuimicos(filtros));
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaQuimico);
  return responderOk(await crearQuimico(datos), 201);
});
