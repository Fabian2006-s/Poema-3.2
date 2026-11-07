import Link from 'next/link';
import { listarQuimicos } from '@/lib/dataService';
import { TablaQuimicos } from '@/components/finca/TablaQuimicos';

export const dynamic = 'force-dynamic';

export default async function QuimicosPage({
  searchParams,
}: {
  searchParams: Promise<{ soloBajos?: string; soloPorVencer?: string }>;
}) {
  const parametros = await searchParams;
  const soloBajos = parametros.soloBajos === 'true';
  const soloPorVencer = parametros.soloPorVencer === 'true';
  const quimicos = await listarQuimicos({ soloBajos, soloPorVencer });

  return (
    <div className="grid gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primario">Productos y existencias</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Químicos</h1>
          <p className="mt-2 text-texto-suave">{quimicos.length} registros en esta vista.</p>
        </div>
        <Link
          className="inline-flex min-h-11 items-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-primario/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
          href="/finca/quimicos/nuevo"
        >
          Nuevo químico
        </Link>
      </header>
      <TablaQuimicos
        quimicos={quimicos}
        soloBajos={soloBajos}
        soloPorVencer={soloPorVencer}
      />
    </div>
  );
}
