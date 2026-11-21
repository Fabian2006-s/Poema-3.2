'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Aviso } from '@/components/ui/Aviso';
import { Boton } from '@/components/ui/Boton';

const enlaces = [
  { href: '/finca', etiqueta: 'Panel' },
  { href: '/finca/trabajadores', etiqueta: 'Trabajadores' },
  { href: '/finca/implementos', etiqueta: 'Implementos' },
  { href: '/finca/quimicos', etiqueta: 'Químicos' },
  { href: '/finca/movimientos/nuevo', etiqueta: 'Movimiento' },
  { href: '/finca/movimientos', etiqueta: 'Historial' },
  { href: '/finca/asignaciones', etiqueta: 'Asignaciones' },
  { href: '/finca/inventario', etiqueta: 'Reporte' },
  { href: '/finca/gestion', etiqueta: 'Operación' },
];

export function NavegacionFinca({ correo }: { correo: string }) {
  const ruta = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [error, setError] = useState('');
  const [cerrando, setCerrando] = useState(false);

  async function cerrarSesion() {
    setError('');
    setCerrando(true);
    try {
      const respuesta = await fetch('/api/auth/logout', { method: 'POST' });
      if (!respuesta.ok) throw new Error('No se pudo cerrar la sesión.');
      router.replace('/login');
      router.refresh();
    } catch {
      setError('No se pudo cerrar la sesión. Inténtalo de nuevo.');
      setCerrando(false);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#183e2d] text-white shadow-lg shadow-[#183e2d]/10">
      <div className="relative mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 2xl:px-10">
        <Link
          aria-label="Finca Bananera, ir al panel"
          className="flex shrink-0 items-center gap-3"
          href="/finca"
        >
          <span className="flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-[#dce9b4]">
            <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 32 32">
              <path
                d="M25.5 4.5C15.2 6.1 7.6 13.3 7 23.8c6.3 2.1 13.7.3 17.1-5.3 2.4-3.9 2.7-9.1 1.4-14Z"
                fill="currentColor"
              />
              <path d="M8 24c4.8-6.1 9.5-10.7 16-16" stroke="#183e2d" strokeWidth="1.6" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="block text-[15px] font-bold tracking-tight">Finca Bananera</span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.16em] text-white/55 uppercase">
              Gestión de campo
            </span>
          </span>
        </Link>

        <button
          aria-controls="navegacion-principal"
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/20 px-3 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:hidden"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          type="button"
        >
          <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
            {menuAbierto ? (
              <path
                d="m5 5 10 10M15 5 5 15"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            ) : (
              <path
                d="M3 5h14M3 10h14M3 15h14"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            )}
          </svg>
          Menú
        </button>

        <nav
          aria-label="Navegación principal"
          className={`${menuAbierto ? 'flex' : 'hidden'} absolute top-full right-0 left-0 z-10 flex-col gap-1 border-t border-white/10 bg-[#183e2d] p-4 shadow-xl xl:static xl:flex xl:flex-1 xl:flex-row xl:items-center xl:justify-end xl:gap-0 xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none`}
          id="navegacion-principal"
        >
          {enlaces.map(({ href, etiqueta }) => {
            const activo =
              href === '/finca'
                ? ruta === href
                : ruta === href || (href !== '/finca/movimientos' && ruta?.startsWith(`${href}/`));
            return (
              <Link
                aria-current={activo ? 'page' : undefined}
                className={`rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white xl:px-2 xl:text-xs 2xl:px-3 2xl:text-sm ${activo ? 'bg-white/10 text-white ring-1 ring-inset ring-white/10' : 'text-white/75'}`}
                href={href}
                key={href}
                onClick={() => setMenuAbierto(false)}
              >
                {etiqueta}
              </Link>
            );
          })}
          <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-3 xl:ml-3 xl:mt-0 xl:justify-start xl:border-t-0 xl:border-l xl:pt-0 xl:pl-4">
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-[0.12em] text-white/50 uppercase">
                Sesión activa
              </span>
              <span className="block max-w-48 truncate text-xs font-medium text-white/90">
                {correo}
              </span>
            </div>
            <Boton
              cargando={cerrando}
              className="shrink-0 !px-3 !text-white/80 hover:!bg-white/10 hover:!text-white"
              onClick={cerrarSesion}
              variante="fantasma"
            >
              Salir
            </Boton>
          </div>
        </nav>
      </div>
      {error && (
        <div className="mx-auto max-w-7xl px-4 pb-3 sm:px-6 lg:px-8">
          <Aviso tipo="error">{error}</Aviso>
        </div>
      )}
    </header>
  );
}
