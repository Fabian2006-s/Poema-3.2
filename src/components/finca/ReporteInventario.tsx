import Link from 'next/link';
import type { Implemento, Quimico } from '@/lib/dataService';
import { formatearCantidadQuimico } from '@/lib/formato';

type FilaInventario = {
  tipo: string;
  nombre: string;
  categoria: string;
  disponible: number;
  unidad: string;
  minima: number;
  estado: string;
  alerta: string;
};

export function ReporteInventario({
  implementos,
  quimicos,
}: {
  implementos: Implemento[];
  quimicos: Quimico[];
}) {
  const filas: FilaInventario[] = [
    ...implementos.map((item) => ({
      tipo: 'Implemento',
      nombre: item.nombre,
      categoria: item.categoria,
      disponible: item.disponible,
      unidad: 'unidades',
      minima: item.minima,
      estado: item.estado,
      alerta: item.inventarioBajo ? 'Inventario bajo' : '',
    })),
    ...quimicos.map((item) => ({
      tipo: 'Químico',
      nombre: item.nombre,
      categoria: item.categoria,
      disponible: item.disponible,
      unidad: item.unidad,
      minima: item.minima,
      estado: item.estado,
      alerta: [
        item.inventarioBajo ? 'Inventario bajo' : '',
        item.nivelVencimiento === 'proximo' ? 'Próximo a vencer' : '',
        item.nivelVencimiento === 'vencido' ? 'Vencido' : '',
      ].filter(Boolean).join('; '),
    })),
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-texto-suave">{filas.length} elementos en el reporte.</p>
        <Link
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-borde bg-superficie px-4 py-2 text-sm font-semibold text-texto hover:bg-primario-suave"
          href="/api/finca/inventario/exportar"
        >
          Descargar CSV
        </Link>
      </div>
      <div className="overflow-x-auto rounded-lg border border-borde bg-superficie">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-primario-suave text-texto">
            <tr>
              <th className="px-4 py-3 font-semibold" scope="col">Tipo</th>
              <th className="px-4 py-3 font-semibold" scope="col">Nombre</th>
              <th className="px-4 py-3 font-semibold" scope="col">Categoría</th>
              <th className="px-4 py-3 font-semibold" scope="col">Disponible</th>
              <th className="px-4 py-3 font-semibold" scope="col">Mínima</th>
              <th className="px-4 py-3 font-semibold" scope="col">Estado</th>
              <th className="px-4 py-3 font-semibold" scope="col">Alertas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-borde">
            {filas.map((fila) => (
              <tr key={`${fila.tipo}-${fila.nombre}`}>
                <td className="px-4 py-3">{fila.tipo}</td>
                <td className="px-4 py-3 font-medium">{fila.nombre}</td>
                <td className="px-4 py-3">{fila.categoria}</td>
                <td className="whitespace-nowrap px-4 py-3">
                  {fila.tipo === 'Químico'
                    ? formatearCantidadQuimico(fila.disponible, fila.unidad)
                    : `${fila.disponible} ${fila.unidad}`}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {fila.tipo === 'Químico'
                    ? formatearCantidadQuimico(fila.minima, fila.unidad)
                    : `${fila.minima} ${fila.unidad}`}
                </td>
                <td className="px-4 py-3">{fila.estado}</td>
                <td className="px-4 py-3">{fila.alerta || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
