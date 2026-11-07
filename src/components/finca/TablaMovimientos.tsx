import Link from 'next/link';
import type { Implemento, Movimiento, Quimico } from '@/lib/dataService';
import { formatearCantidadQuimico, formatearFecha } from '@/lib/formato';
import { EstadoVacio } from '@/components/ui/EstadoVacio';
import { Selector } from '@/components/ui/Selector';
import { Boton } from '@/components/ui/Boton';

function mostrarCantidad(
  movimiento: Movimiento,
  quimicos: Quimico[],
): string {
  if (movimiento.tipoElemento === 'implemento') {
    const unidad = movimiento.cantidad === 1 ? 'unidad' : 'unidades';
    return `${movimiento.cantidad} ${unidad}`;
  }
  const quimico = quimicos.find(({ id }) => id === movimiento.elementoId);
  return quimico
    ? formatearCantidadQuimico(movimiento.cantidad, quimico.unidad)
    : `${movimiento.cantidad}`;
}

export function TablaMovimientos({
  movimientos,
  implementos,
  quimicos,
  filtroElemento,
  desde,
  hasta,
}: {
  movimientos: Movimiento[];
  implementos: Implemento[];
  quimicos: Quimico[];
  filtroElemento: string;
  desde: string;
  hasta: string;
}) {
  return (
    <div className="grid gap-4">
      <form action="/finca/movimientos" className="flex flex-wrap items-end gap-3" method="get">
        <Selector
          defaultValue={filtroElemento}
          etiqueta="Elemento"
          id="elemento-filtro"
          name="elemento"
        >
          <option value="">Todos</option>
          <optgroup label="Implementos">
            {implementos.map((elemento) => (
              <option key={elemento.id} value={`implemento:${elemento.id}`}>
                {elemento.nombre}
              </option>
            ))}
          </optgroup>
          <optgroup label="Químicos">
            {quimicos.map((elemento) => (
              <option key={elemento.id} value={`quimico:${elemento.id}`}>
                {elemento.nombre}
              </option>
            ))}
          </optgroup>
        </Selector>
        <label className="grid gap-1.5 text-sm font-medium text-texto" htmlFor="desde">
          Desde
          <input className="min-h-11 rounded-lg border border-borde bg-superficie px-3" id="desde" name="desde" type="date" defaultValue={desde} />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-texto" htmlFor="hasta">
          Hasta
          <input className="min-h-11 rounded-lg border border-borde bg-superficie px-3" id="hasta" name="hasta" type="date" defaultValue={hasta} />
        </label>
        <Boton type="submit" variante="secundario">Filtrar</Boton>
      </form>

      {movimientos.length === 0 ? (
        <EstadoVacio
          descripcion="Cambia los filtros o registra una entrada o salida."
          titulo="No hay movimientos para mostrar"
        />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-borde bg-superficie">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-primario-suave text-texto">
              <tr>
                <th className="px-4 py-3 font-semibold" scope="col">Fecha</th>
                <th className="px-4 py-3 font-semibold" scope="col">Tipo</th>
                <th className="px-4 py-3 font-semibold" scope="col">Elemento</th>
                <th className="px-4 py-3 font-semibold" scope="col">Movimiento</th>
                <th className="px-4 py-3 font-semibold" scope="col">Cantidad</th>
                <th className="px-4 py-3 font-semibold" scope="col">Motivo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borde">
              {movimientos.map((movimiento) => (
                <tr key={movimiento.id}>
                  <td className="whitespace-nowrap px-4 py-3">{formatearFecha(movimiento.fecha)}</td>
                  <td className="px-4 py-3">{movimiento.tipoElemento === 'implemento' ? 'Implemento' : 'Químico'}</td>
                  <td className="px-4 py-3 font-medium">{movimiento.elementoNombre}</td>
                  <td className="px-4 py-3">{movimiento.tipoMovimiento === 'entrada' ? 'Entrada' : 'Salida'}</td>
                  <td className="whitespace-nowrap px-4 py-3">{mostrarCantidad(movimiento, quimicos)}</td>
                  <td className="px-4 py-3">{movimiento.motivo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link className="text-sm font-semibold text-primario underline-offset-4 hover:underline" href="/finca/movimientos/nuevo">
        Registrar movimiento
      </Link>
    </div>
  );
}
