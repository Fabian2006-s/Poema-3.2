import { exigirSesion } from '@/lib/auth/sesion';
import { listarImplementos, listarQuimicos } from '@/lib/dataService';

export const dynamic = 'force-dynamic';

function protegerValorCsv(valor: string | number): string {
  const texto = String(valor);
  const seguro = /^[\s]*[=+\-@]/.test(texto) ? `'${texto}` : texto;
  return `"${seguro.replaceAll('"', '""')}"`;
}

export async function GET(): Promise<Response> {
  await exigirSesion();
  const [implementos, quimicos] = await Promise.all([
    listarImplementos({ incluirInactivos: true }),
    listarQuimicos({ incluirInactivos: true }),
  ]);
  const filas: (string | number)[][] = [
    ['Tipo', 'Nombre', 'Categoría', 'Disponible', 'Unidad', 'Mínima', 'Estado', 'Alertas'],
    ...implementos.map((item) => [
      'Implemento',
      item.nombre,
      item.categoria,
      item.disponible,
      'unidades',
      item.minima,
      item.estado,
      item.inventarioBajo ? 'Inventario bajo' : '',
    ]),
    ...quimicos.map((item) => [
      'Químico',
      item.nombre,
      item.categoria,
      item.disponible,
      item.unidad,
      item.minima,
      item.estado,
      [
        item.inventarioBajo ? 'Inventario bajo' : '',
        item.nivelVencimiento === 'proximo' ? 'Próximo a vencer' : '',
        item.nivelVencimiento === 'vencido' ? 'Vencido' : '',
      ]
        .filter(Boolean)
        .join('; '),
    ]),
  ];
  const csv = `\uFEFF${filas
    .map((fila) => fila.map(protegerValorCsv).join(','))
    .join('\r\n')}`;
  return new Response(csv, {
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': 'attachment; filename="reporte-inventario.csv"',
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}
