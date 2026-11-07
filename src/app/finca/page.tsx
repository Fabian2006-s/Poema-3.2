import Link from 'next/link';
import {
  listarAlertas,
  listarImplementos,
  listarQuimicos,
  listarTrabajadores,
} from '@/lib/dataService';
import { PanelAlertas } from '@/components/finca/PanelAlertas';
import { Tarjeta } from '@/components/ui/Tarjeta';

export const dynamic = 'force-dynamic';

export default async function PanelFincaPage() {
  const [trabajadores, implementos, quimicos, alertas] = await Promise.all([
    listarTrabajadores({ estado: 'activo' }),
    listarImplementos(),
    listarQuimicos(),
    listarAlertas(),
  ]);

  const resumen = [
    { etiqueta: 'Trabajadores activos', cantidad: trabajadores.length },
    { etiqueta: 'Implementos', cantidad: implementos.length },
    { etiqueta: 'Productos químicos', cantidad: quimicos.length },
  ];

  return (
    <div className="grid gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primario">Resumen de la finca</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-texto">Panel</h1>
          <p className="mt-2 text-texto-suave">
            Consulta rápida de personal, existencias y alertas.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center rounded-lg bg-primario px-4 py-2 text-sm font-semibold text-white hover:bg-primario/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            href="/finca/movimientos/nuevo"
          >
            Registrar movimiento
          </Link>
          <Link
            className="inline-flex min-h-11 items-center rounded-lg border border-borde bg-superficie px-4 py-2 text-sm font-semibold text-texto hover:bg-primario-suave focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario"
            href="/finca/usuarios/nuevo"
          >
            Crear usuario
          </Link>
        </div>
      </header>

      <section aria-label="Resumen de registros" className="grid gap-4 sm:grid-cols-3">
        {resumen.map((dato) => (
          <Tarjeta className="border-l-4 border-l-primario" key={dato.etiqueta}>
            <p className="text-sm font-medium text-texto-suave">{dato.etiqueta}</p>
            <p className="mt-2 font-mono text-3xl font-bold tabular-nums text-texto">
              {dato.cantidad}
            </p>
          </Tarjeta>
        ))}
      </section>

      <section className="grid gap-4">
        <div>
          <h2 className="text-xl font-bold text-texto">Alertas</h2>
          <p className="mt-1 text-sm text-texto-suave">
            Los estados se calculan con las existencias y fechas actuales.
          </p>
        </div>
        <PanelAlertas alertas={alertas} />
      </section>
    </div>
  );
}
