import { z } from 'zod';
import { exigirSesion } from '@/lib/auth/sesion';
import { actualizarImplemento } from '@/lib/dataService';
import { conManejoDeErrores, leerCuerpo, responderOk } from '@/lib/http/respuestas';
import { esquemaImplemento } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaCambios = esquemaImplemento
  .partial()
  .extend({ inactivo: z.boolean().optional() })
  .refine((cambios) => Object.keys(cambios).length > 0, 'Indique al menos un cambio.');

export const PATCH = conManejoDeErrores(
  async (request: Request, contexto: { params: Promise<{ id: string }> }) => {
    await exigirSesion();
    const { id } = await contexto.params;
    const cambios = await leerCuerpo(request, esquemaCambios);
    await actualizarImplemento(id, cambios);
    return responderOk({ actualizado: true });
  },
);
