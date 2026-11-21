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
    { etiqueta: 'Personal activo', cantidad: trabajadores.length, icono: 'personas' },
    { etiqueta: 'Implementos', cantidad: implementos.length, icono: 'implementos' },
    { etiqueta: 'Productos químicos', cantidad: quimicos.length, icono: 'quimicos' },
  ];

  return (
    <div className="grid gap-8 pb-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#193f2e] px-6 py-8 text-white shadow-[0_24px_60px_-32px_rgba(25,63,46,0.65)] sm:px-9 sm:py-10 lg:px-12 lg:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(circle at 83% 18%, rgba(189,211,137,0.22), transparent 26%), linear-gradient(115deg, #193f2e 10%, #24553b 65%, #315c3c)',
          }}
        />
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 -z-10 h-[420px] w-[420px] text-[#d3df9e] opacity-[0.12]"
          fill="none"
          viewBox="0 0 420 420"
        >
          <path
            d="M340 35C207 57 99 155 79 298c81 27 182 3 231-74 35-55 43-126 30-189Z"
            fill="currentColor"
          />
          <path d="M91 301C154 220 227 144 331 56" stroke="#193f2e" strokeWidth="5" />
          <path
            d="M176 214c-6-52-28-82-70-106m145 31c-5-45-21-76-54-101m-67 214c-46-4-78 7-111 34m174-95c-48-7-84 1-119 29"
            stroke="#193f2e"
            strokeWidth="4"
          />
        </svg>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#dce9b4] uppercase">
              Resumen de la finca
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">
              El campo, bajo control.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Revisa el personal, controla las existencias y organiza toda la operación del cultivo.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#e0e9c2] px-5 py-3 text-sm font-bold text-[#1b422f] shadow-sm transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                href="/finca/movimientos/nuevo"
              >
                <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
                  <path
                    d="M10 4v12M4 10h12"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="1.8"
                  />
                </svg>
                Registrar movimiento
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                href="/finca/inventario"
              >
                Ver inventario
              </Link>
              <Link
                className="inline-flex min-h-12 items-center rounded-xl border border-white/20 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                href="/finca/gestion"
              >
                Gestión integral
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/15 bg-black/10 p-3 sm:gap-3 sm:p-4 lg:min-w-[310px]">
            <div className="rounded-xl bg-white/[0.07] px-3 py-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-white">{alertas.inventarioBajo.length}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">Stock bajo</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] px-3 py-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-white">{alertas.porVencer.length}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">Por vencer</p>
            </div>
            <div className="rounded-xl bg-white/[0.07] px-3 py-3 text-center">
              <p className="text-2xl font-semibold tabular-nums text-white">{alertas.vencidos.length}</p>
              <p className="mt-1 text-[10px] leading-4 text-white/65 sm:text-xs">Vencidos</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Resumen de registros" className="grid gap-4 sm:grid-cols-3">
        {resumen.map((dato) => (
          <Tarjeta
            className="group flex items-center gap-4 rounded-2xl border-white/80 p-5 shadow-[0_12px_35px_-26px_rgba(32,50,41,0.45)] transition hover:-translate-y-1 hover:shadow-lg sm:p-6"
            key={dato.etiqueta}
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primario-suave text-primario transition group-hover:bg-primario group-hover:text-white">
              {dato.icono === 'personas' && (
                <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M16 20v-1.6a3.4 3.4 0 0 0-3.4-3.4H7.4A3.4 3.4 0 0 0 4 18.4V20m14-6.7a3.4 3.4 0 0 1 2 3.1V20M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm6-6.6a3.5 3.5 0 0 1 0 6.8"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              )}
              {dato.icono === 'implementos' && (
                <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
                  <path
                    d="m14.7 6.3 3-3 3 3-3 3m-2-2L7 16m-2 0 3 3-3 3-3-3 3-3Zm8.7-8.7a5 5 0 0 0 6.1 6.1L11 21l-4-4 7.7-7.7Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              )}
              {dato.icono === 'quimicos' && (
                <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M9 3h6m-5 0v6.2L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9.2V3m-5 11h6"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.7"
                  />
                </svg>
              )}
            </span>
            <div>
              <p className="text-sm font-medium text-texto-suave">{dato.etiqueta}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums text-texto">
                {dato.cantidad}
              </p>
            </div>
          </Tarjeta>
        ))}
      </section>

      <section className="grid gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-primario uppercase">
              Atención prioritaria
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-texto">Alertas de hoy</h2>
            <p className="mt-1 text-sm text-texto-suave">
              Los estados se calculan con las existencias y fechas actuales.
            </p>
          </div>
          <Link
            className="text-sm font-semibold text-primario underline-offset-4 hover:underline"
            href="/finca/inventario"
          >
            Ir al reporte completo
          </Link>
        </div>
        <PanelAlertas alertas={alertas} />
      </section>
    </div>
  );
}
