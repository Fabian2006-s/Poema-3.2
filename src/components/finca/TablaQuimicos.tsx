'use client';

import Link from 'next/link';
import type { Quimico } from '@/lib/dataService';
import { formatearCantidadQuimico, formatearFecha } from '@/lib/formato';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { InsigniaAlerta } from './InsigniaAlerta';
import { InsigniaEstado } from './InsigniaEstado';

export function TablaQuimicos({
  quimicos,
  soloBajos,
  soloPorVencer,
}: {
  quimicos: Quimico[];
  soloBajos: boolean;
  soloPorVencer: boolean;
}) {
  return (
    <div className="grid gap-4">
      <form action="/finca/quimicos" className="flex flex-wrap items-end gap-4" method="get">
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-texto">
          <input
            className="size-4 accent-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            defaultChecked={soloBajos}
            name="soloBajos"
            type="checkbox"
            value="true"
          />
          Solo inventario bajo
        </label>
        <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-texto">
          <input
            className="size-4 accent-primario focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            defaultChecked={soloPorVencer}
            name="soloPorVencer"
            type="checkbox"
            value="true"
          />
          Próximos a vencer
        </label>
        <Boton type="submit" variante="secundario">Aplicar filtros</Boton>
      </form>
      {quimicos.length === 0 ? (
        <EstadoVacio
          descripcion="Cambia los filtros o registra un producto químico."
          titulo="No hay químicos para mostrar"
        />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border border-borde bg-superficie sm:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-primario-suave text-texto">
                <tr>
                  <th className="px-4 py-3 font-semibold" scope="col">Nombre</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Categoría</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Disponible</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Mínima</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Vencimiento</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Estado y alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {quimicos.map((quimico) => (
                  <tr key={quimico.id}>
                    <td className="px-4 py-3 font-medium text-texto">{quimico.nombre}</td>
                    <td className="px-4 py-3 text-texto">{quimico.categoria}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-texto">
                      {formatearCantidadQuimico(quimico.disponible, quimico.unidad)}
                    </td>
                    <td className="px-4 py-3 font-mono tabular-nums text-texto">
                      {formatearCantidadQuimico(quimico.minima, quimico.unidad)}
                    </td>
                    <td className="px-4 py-3 text-texto">{formatearFecha(quimico.fechaVencimiento)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <InsigniaEstado estado={quimico.estado} />
                        {quimico.inventarioBajo && <InsigniaAlerta tipo="inventarioBajo" />}
                        {quimico.nivelVencimiento === 'proximo' && <InsigniaAlerta tipo="porVencer" />}
                        {quimico.nivelVencimiento === 'vencido' && <InsigniaAlerta tipo="vencido" />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:hidden">
            {quimicos.map((quimico) => (
              <li className="rounded-lg border border-borde bg-superficie p-4" key={quimico.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-texto">{quimico.nombre}</h2>
                    <p className="mt-1 text-sm text-texto-suave">{quimico.categoria}</p>
                  </div>
                  <InsigniaEstado estado={quimico.estado} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-texto-suave">Disponible</dt>
                    <dd className="font-mono tabular-nums text-texto">{formatearCantidadQuimico(quimico.disponible, quimico.unidad)}</dd>
                  </div>
                  <div>
                    <dt className="text-texto-suave">Mínima</dt>
                    <dd className="font-mono tabular-nums text-texto">{formatearCantidadQuimico(quimico.minima, quimico.unidad)}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-texto-suave">Vencimiento</dt>
                    <dd className="text-texto">{formatearFecha(quimico.fechaVencimiento)}</dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap gap-2">
                  {quimico.inventarioBajo && <InsigniaAlerta tipo="inventarioBajo" />}
                  {quimico.nivelVencimiento === 'proximo' && <InsigniaAlerta tipo="porVencer" />}
                  {quimico.nivelVencimiento === 'vencido' && <InsigniaAlerta tipo="vencido" />}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <Link
        className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
        href="/finca/movimientos/nuevo"
      >
        Registrar entrada o salida
      </Link>
    </div>
  );
}
