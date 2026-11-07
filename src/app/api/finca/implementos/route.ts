import { exigirSesion } from '@/lib/auth/sesion';
import { crearImplemento, listarImplementos } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  leerParametros,
  responderOk,
} from '@/lib/http/respuestas';
import {
  esquemaFiltros,
  esquemaImplemento,
} from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaFiltrosImplemento = esquemaFiltros.pick({
  incluirInactivos: true,
  soloBajos: true,
  categoria: true,
  estadoElemento: true,
});

export const GET = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const filtros = leerParametros(request, esquemaFiltrosImplemento);
  return responderOk(await listarImplementos(filtros));
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaImplemento);
  return responderOk(await crearImplemento(datos), 201);
});
