import Link from 'next/link';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { buscarTrabajadorPorId, implementosDeTrabajador } from '@/lib/dataService';
import { InsigniaEstado } from '@/components/finca/InsigniaEstado';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { formatearFecha } from '@/lib/formato';

export const dynamic = 'force-dynamic';

export default async function TrabajadorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) notFound();
  const trabajador = await buscarTrabajadorPorId(id);
  if (!trabajador) notFound();

  const implementos = await implementosDeTrabajador(id);
  return (
    <div className="grid gap-6">
      <Link
        className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
        href="/finca/trabajadores"
      >
        Volver a trabajadores
      </Link>
      <header className="rounded-lg border border-borde bg-superficie p-5">
        <p className="text-sm font-semibold text-primario">Detalle del trabajador</p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-texto">{trabajador.nombre}</h1>
          <InsigniaEstado estado={trabajador.estado} />
        </div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-texto-suave">Documento</dt><dd>{trabajador.documento}</dd></div>
          <div><dt className="text-texto-suave">Cargo</dt><dd>{trabajador.cargo}</dd></div>
          <div><dt className="text-texto-suave">Teléfono</dt><dd>{trabajador.telefono || '—'}</dd></div>
        </dl>
      </header>
      <section className="grid gap-3">
        <h2 className="text-xl font-bold text-texto">Implementos entregados</h2>
        {implementos.length === 0 ? (
          <EstadoVacio
            descripcion="Las asignaciones activas de este trabajador aparecerán aquí."
            titulo="No tiene implementos entregados"
          />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-borde bg-superficie">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-primario-suave text-texto">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">Implemento</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Categoría</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Cantidad</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Entregado el</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {implementos.map((implemento) => (
                  <tr key={implemento.asignacionId}>
                    <td className="px-4 py-3 font-medium">{implemento.nombre}</td>
                    <td className="px-4 py-3">{implemento.categoria}</td>
                    <td className="px-4 py-3">{implemento.cantidad}</td>
                    <td className="px-4 py-3">{formatearFecha(implemento.fecha)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
