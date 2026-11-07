import { Aviso } from '@/components/ui/Aviso';
import { TablaMovimientos } from '@/components/finca/TablaMovimientos';
import {
  listarImplementos,
  listarMovimientos,
  listarQuimicos,
} from '@/lib/dataService';
import { esquemaFiltros } from '@/lib/validacion/esquemas';

export const dynamic = 'force-dynamic';

const esquemaHistorial = esquemaFiltros
  .pick({ tipoElemento: true, elementoId: true, desde: true, hasta: true })
  .refine(
    (filtros) =>
      filtros.desde === undefined ||
      filtros.hasta === undefined ||
      filtros.desde <= filtros.hasta,
    { path: ['hasta'], message: 'La fecha final debe ser igual o posterior a la inicial.' },
  );

export default async function HistorialMovimientosPage({
  searchParams,
}: {
  searchParams: Promise<{
    elemento?: string;
    desde?: string;
    hasta?: string;
  }>;
}) {
  const parametros = await searchParams;
  const [implementos, quimicos] = await Promise.all([
    listarImplementos({ incluirInactivos: true }),
    listarQuimicos({ incluirInactivos: true }),
  ]);
  const coincidencia = /^([a-z]+):([0-9a-f-]+)$/i.exec(parametros.elemento ?? '');
  const valores = {
    ...(coincidencia?.[1] === 'implemento' || coincidencia?.[1] === 'quimico'
      ? { tipoElemento: coincidencia[1] }
      : {}),
    ...(coincidencia?.[2] ? { elementoId: coincidencia[2] } : {}),
    ...(parametros.desde ? { desde: parametros.desde } : {}),
    ...(parametros.hasta ? { hasta: parametros.hasta } : {}),
  };
  const validacion = esquemaHistorial.safeParse(valores);
  const filtros = validacion.success ? validacion.data : {};
  const movimientos = await listarMovimientos(filtros);

  return (
    <div className="grid gap-6">
      <header>
        <p className="text-sm font-semibold text-primario">Trazabilidad del inventario</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">
          Historial de movimientos
        </h1>
        <p className="mt-2 text-texto-suave">
          Consulta entradas y salidas por elemento y rango de fechas.
        </p>
      </header>
      {!validacion.success && (
        <Aviso tipo="error">
          Los filtros no son válidos. Se muestran todos los movimientos.
        </Aviso>
      )}
      <TablaMovimientos
        desde={validacion.success ? (parametros.desde ?? '') : ''}
        filtroElemento={validacion.success ? (parametros.elemento ?? '') : ''}
        hasta={validacion.success ? (parametros.hasta ?? '') : ''}
        implementos={implementos}
        movimientos={movimientos}
        quimicos={quimicos}
      />
    </div>
  );
}
