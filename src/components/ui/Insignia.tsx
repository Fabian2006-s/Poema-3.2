import type { ReactNode } from 'react';

export type TonoInsignia = 'neutro' | 'disponible' | 'bajo' | 'vencido' | 'inactivo';

const tonos: Record<TonoInsignia, string> = {
  neutro: 'bg-gray-100 text-gray-800',
  disponible: 'bg-green-100 text-green-900',
  bajo: 'bg-amber-100 text-amber-950',
  vencido: 'bg-red-100 text-red-900',
  inactivo: 'bg-gray-200 text-gray-800',
};

export function Insignia({
  children,
  tono = 'neutro',
}: {
  children: ReactNode;
  tono?: TonoInsignia;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tonos[tono]}`}>
      {children}
    </span>
  );
}
