import type { ReactNode } from 'react';

export function Tarjeta({
  children,
  className = '',
  titulo,
  descripcion,
}: {
  children: ReactNode;
  className?: string;
  titulo?: string;
  descripcion?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-borde/80 bg-superficie p-5 shadow-[0_12px_35px_-28px_rgba(32,50,41,0.55)] ${className}`}
    >
      {(titulo || descripcion) && (
        <header className="mb-4">
          {titulo && <h2 className="text-lg font-semibold text-texto">{titulo}</h2>}
          {descripcion && <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>}
        </header>
      )}
      {children}
    </section>
  );
}
