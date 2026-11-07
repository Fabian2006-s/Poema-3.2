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
    <header className="bg-primario text-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link className="shrink-0 text-lg font-bold" href="/finca">
          Finca Bananera
        </Link>
        <button
          aria-expanded={menuAbierto}
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          className="rounded-md border border-white/40 px-3 py-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white xl:hidden"
          onClick={() => setMenuAbierto((abierto) => !abierto)}
          type="button"
        >
          Menú
        </button>
        <nav
          aria-label="Navegación principal"
          className={`${menuAbierto ? 'flex' : 'hidden'} absolute top-16 right-0 left-0 z-10 flex-col gap-1 bg-primario p-4 shadow-lg xl:static xl:flex xl:flex-1 xl:flex-row xl:items-center xl:justify-end xl:gap-0 xl:bg-transparent xl:p-0 xl:shadow-none`}
        >
          {enlaces.map(({ href, etiqueta }) => {
            const activo = href === '/finca' ? ruta === href : ruta?.startsWith(href);
            return (
              <Link
                aria-current={activo ? 'page' : undefined}
                className={`rounded-md px-3 py-2 text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-white xl:px-2 xl:text-xs 2xl:px-3 2xl:text-sm ${activo ? 'bg-white/15' : ''}`}
                href={href}
                key={href}
                onClick={() => setMenuAbierto(false)}
              >
                {etiqueta}
              </Link>
            );
          })}
          <span className="px-3 py-2 text-xs text-white/80 xl:ml-1">{correo}</span>
          <Boton
            cargando={cerrando}
            className="border border-white/40 !text-white hover:bg-white/15"
            onClick={cerrarSesion}
            variante="fantasma"
          >
            Cerrar sesión
          </Boton>
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
