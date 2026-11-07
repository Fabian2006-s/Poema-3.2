import { FormularioMovimiento } from '@/components/finca/FormularioMovimiento';
import { listarImplementos, listarQuimicos } from '@/lib/dataService';
import { hoyBogota } from '@/lib/reglas/fechas';

export const dynamic = 'force-dynamic';

export default async function NuevoMovimientoPage() {
  const [implementos, quimicos] = await Promise.all([
    listarImplementos(),
    listarQuimicos(),
  ]);

  return (
    <div className="mx-auto grid w-full max-w-3xl gap-6">
      <header>
        <p className="text-sm font-semibold text-primario">Control de existencias</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">
          Registrar movimiento
        </h1>
        <p className="mt-2 text-texto-suave">
          Registra entradas y salidas para mantener actualizado el inventario.
        </p>
      </header>
      <FormularioMovimiento
        fechaInicial={hoyBogota()}
        implementos={implementos}
        quimicos={quimicos}
      />
    </div>
  );
}
