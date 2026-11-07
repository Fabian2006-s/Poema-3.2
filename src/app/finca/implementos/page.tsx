import Link from 'next/link';
import { listarImplementos } from '@/lib/dataService';
import { TablaImplementos } from '@/components/finca/TablaImplementos';

export const dynamic = 'force-dynamic';

export default async function ImplementosPage({
  searchParams,
}: {
  searchParams: Promise<{ soloBajos?: string }>;
}) {
  const parametros = await searchParams;
  const soloBajos = parametros.soloBajos === 'true';
  const implementos = await listarImplementos({ soloBajos });

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primario">Herramientas y equipos</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Implementos</h1>
          <p className="mt-2 text-texto-suave">{implementos.length} registros en esta vista.</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-primario/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          href="/finca/implementos/nuevo"
        >
          Nuevo implemento
        </Link>
      </header>
      <TablaImplementos implementos={implementos} soloBajos={soloBajos} />
    </div>
  );
}
