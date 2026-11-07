import Link from 'next/link';
import { formatearCantidadQuimico, formatearFecha } from '@/lib/formato';
import type { listarAlertas } from '@/lib/dataService';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Tarjeta } from '@/components/ui/Tarjeta';
import { InsigniaAlerta } from './InsigniaAlerta';

type Alertas = Awaited<ReturnType<typeof listarAlertas>>;

export function PanelAlertas({ alertas }: { alertas: Alertas }) {
  const bajo = alertas.inventarioBajo;
  const porVencer = alertas.porVencer;
  const vencidos = alertas.vencidos;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Tarjeta className="h-full" titulo={`Inventario bajo (${bajo.length})`}>
        {bajo.length ? (
          <ul className="grid gap-3">
            {bajo.map((elemento) => {
              const cantidad =
                elemento.tipoElemento === 'quimico'
                  ? formatearCantidadQuimico(elemento.disponible, elemento.unidad)
                  : `${elemento.disponible} unidades`;
              const minima =
                elemento.tipoElemento === 'quimico'
                  ? formatearCantidadQuimico(elemento.minima, elemento.unidad)
                  : `${elemento.minima} unidades`;
              return (
                <li className="border-b border-borde pb-3 last:border-0 last:pb-0" key={`${elemento.tipoElemento}-${elemento.id}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="font-semibold text-texto">{elemento.nombre}</span>
                    <InsigniaAlerta tipo="inventarioBajo" />
                  </div>
                  <p className="mt-1 text-sm text-texto-suave">
                    Quedan {cantidad} (mínimo {minima}).
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <EstadoVacio descripcion="No hay elementos por debajo del mínimo." titulo="Inventario suficiente" />
        )}
      </Tarjeta>

      <Tarjeta className="h-full" titulo={`Próximos a vencer (${porVencer.length})`}>
        {porVencer.length ? (
          <ul className="grid gap-3">
            {porVencer.map((quimico) => (
              <li className="border-b border-borde pb-3 last:border-0 last:pb-0" key={quimico.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-texto">{quimico.nombre}</span>
                  <InsigniaAlerta tipo="porVencer" />
                </div>
                <p className="mt-1 text-sm text-texto-suave">
                  Vence el {formatearFecha(quimico.fechaVencimiento)}.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EstadoVacio descripcion="No hay químicos próximos a vencer." titulo="Sin vencimientos próximos" />
        )}
      </Tarjeta>

      <Tarjeta className="h-full" titulo={`Vencidos (${vencidos.length})`}>
        {vencidos.length ? (
          <ul className="grid gap-3">
            {vencidos.map((quimico) => (
              <li className="border-b border-borde pb-3 last:border-0 last:pb-0" key={quimico.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-texto">{quimico.nombre}</span>
                  <InsigniaAlerta tipo="vencido" />
                </div>
                <p className="mt-1 text-sm text-texto-suave">
                  Venció el {formatearFecha(quimico.fechaVencimiento)}.
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <EstadoVacio descripcion="No hay químicos vencidos." titulo="Sin químicos vencidos" />
        )}
      </Tarjeta>
      <Link
        className="text-sm font-semibold text-primario underline-offset-4 hover:underline lg:col-span-3"
        href="/finca/movimientos/nuevo"
      >
        Registrar un movimiento
      </Link>
    </div>
  );
}
