import { exigirSesion } from '@/lib/auth/sesion';
import { createUser } from '@/lib/auth/users';
import { conManejoDeErrores, leerCuerpo, responderOk } from '@/lib/http/respuestas';
import { esquemaCrearUsuario } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

export const POST = conManejoDeErrores(async (request: Request) => {
  await exigirSesion();
  const datos = await leerCuerpo(request, esquemaCrearUsuario);
  return responderOk(await createUser(datos.email, datos.password), 201);
});
