'use client';

import Link from 'next/link';
import type { Implemento } from '@/lib/dataService';
import { Boton } from '@/components/ui/Boton';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { InsigniaAlerta } from './InsigniaAlerta';
import { InsigniaEstado } from './InsigniaEstado';

export function TablaImplementos({
  implementos,
  soloBajos,
}: {
  implementos: Implemento[];
  soloBajos: boolean;
}) {
  return (
    <div className="grid gap-4">
      <form action="/finca/implementos" className="flex flex-wrap items-end gap-3" method="get">
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
        <Boton type="submit" variante="secundario">Aplicar filtro</Boton>
      </form>
      {implementos.length === 0 ? (
        <EstadoVacio
          descripcion={soloBajos ? 'No hay implementos por debajo del mínimo.' : 'Registra el primer implemento para comenzar.'}
          titulo={soloBajos ? 'Sin alertas de inventario bajo' : 'No hay implementos'}
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
                  <th className="px-4 py-3 font-semibold" scope="col">Estado</th>
                  <th className="px-4 py-3 font-semibold" scope="col">Alerta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {implementos.map((implemento) => (
                  <tr key={implemento.id}>
                    <td className="px-4 py-3 font-medium text-texto">{implemento.nombre}</td>
                    <td className="px-4 py-3 text-texto">{implemento.categoria}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-texto">{implemento.disponible}</td>
                    <td className="px-4 py-3 font-mono tabular-nums text-texto">{implemento.minima}</td>
                    <td className="px-4 py-3"><InsigniaEstado estado={implemento.estado} /></td>
                    <td className="px-4 py-3">{implemento.inventarioBajo && <InsigniaAlerta tipo="inventarioBajo" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="grid gap-3 sm:hidden">
            {implementos.map((implemento) => (
              <li className="rounded-lg border border-borde bg-superficie p-4" key={implemento.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-texto">{implemento.nombre}</h2>
                    <p className="mt-1 text-sm text-texto-suave">{implemento.categoria}</p>
                  </div>
                  <InsigniaEstado estado={implemento.estado} />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-texto-suave">Disponible</dt><dd className="font-mono tabular-nums text-texto">{implemento.disponible}</dd></div>
                  <div><dt className="text-texto-suave">Mínima</dt><dd className="font-mono tabular-nums text-texto">{implemento.minima}</dd></div>
                </dl>
                {implemento.inventarioBajo && <div className="mt-3"><InsigniaAlerta tipo="inventarioBajo" /></div>}
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
