import { z } from 'zod';
import { exigirSesion } from '@/lib/auth/sesion';
import { registrarDevolucion } from '@/lib/dataService';
import { conManejoDeErrores, responderOk } from '@/lib/http/respuestas';

export const dynamic = 'force-dynamic';

export const POST = conManejoDeErrores(
  async (_request: Request, contexto: { params: Promise<{ id: string }> }) => {
    await exigirSesion();
    const { id } = await contexto.params;
    return responderOk(await registrarDevolucion(z.uuid().parse(id)));
  },
);
