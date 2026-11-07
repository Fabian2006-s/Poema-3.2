import { exigirSesion } from '@/lib/auth/sesion';
import { asignarImplemento, listarAsignaciones } from '@/lib/dataService';
import {
  conManejoDeErrores,
  leerCuerpo,
  responderOk,
} from '@/lib/http/respuestas';
import { esquemaAsignacion } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const GET = conManejoDeErrores(async () => {
  await exigirSesion();
  return responderOk(await listarAsignaciones());
});

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaAsignacion);
  return responderOk(await asignarImplemento(datos), 201);
});
