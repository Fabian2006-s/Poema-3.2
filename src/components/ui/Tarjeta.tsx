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
    <section className={`rounded-lg border border-borde bg-superficie p-5 shadow-sm ${className}`}>
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
