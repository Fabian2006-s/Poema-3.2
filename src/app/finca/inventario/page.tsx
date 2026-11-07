import { ReporteInventario } from '@/components/finca/ReporteInventario';
import { listarImplementos, listarQuimicos } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

export default async function ReporteInventarioPage() {
  const [implementos, quimicos] = await Promise.all([
    listarImplementos({ incluirInactivos: true }),
    listarQuimicos({ incluirInactivos: true }),
  ]);

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold text-primario">Existencias consolidadas</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">
          Reporte de inventario
        </h1>
        <p className="mt-2 text-texto-suave">
          Consulta o descarga las cantidades, estados y alertas actuales.
        </p>
      </header>
      <ReporteInventario implementos={implementos} quimicos={quimicos} />
    </div>
  );
}
