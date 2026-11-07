import Link from 'next/link';
import { listarTrabajadores } from '@/lib/dataService';
import { TablaTrabajadores } from '@/components/finca/TablaTrabajadores';

type EstadoFiltro = 'activo' | 'inactivo' | 'todos';

export const dynamic = 'force-dynamic';

export default async function TrabajadoresPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string }>;
}) {
  const parametros = await searchParams;
  const filtro: EstadoFiltro =
    parametros.estado === 'inactivo' || parametros.estado === 'todos'
      ? parametros.estado
      : 'activo';
  const trabajadores = await listarTrabajadores(
    filtro === 'todos' ? { incluirInactivos: true } : { estado: filtro },
  );

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primario">Personal de la finca</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Trabajadores</h1>
          <p className="mt-2 text-texto-suave">{trabajadores.length} registros en esta vista.</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-primario/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          href="/finca/trabajadores/nuevo"
        >
          Nuevo trabajador
        </Link>
      </header>
      <TablaTrabajadores filtro={filtro} trabajadores={trabajadores} />
    </div>
  );
}
