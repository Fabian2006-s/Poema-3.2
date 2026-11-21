import { exigirSesion } from '@/lib/auth/sesion';
import { cambiarEstadoRecurso, registrarOperacion } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  responderOk,
} from '@/lib/http/respuestas';
import {
  esquemaEstadoRecurso,
  esquemaOperacion,
} from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaOperacion);
  return responderOk(await registrarOperacion(datos), 201);
});

export const PATCH = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaEstadoRecurso);
  await cambiarEstadoRecurso(datos);
  return responderOk({ actualizado: true });
});
