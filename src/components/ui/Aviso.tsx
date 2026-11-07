import type { ReactNode } from 'react';

type TipoAviso = 'info' | 'exito' | 'advertencia' | 'error';

const estilos: Record<TipoAviso, string> = {
  info: 'border-blue-300 bg-blue-50 text-blue-950',
  exito: 'border-green-300 bg-green-50 text-green-950',
  advertencia: 'border-amber-300 bg-amber-50 text-amber-950',
  error: 'border-red-300 bg-red-50 text-red-950',
};

export function Aviso({
  children,
  tipo = 'info',
  titulo,
}: {
  children: ReactNode;
  tipo?: TipoAviso;
  titulo?: string;
}) {
  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm ${estilos[tipo]}`}
      role={tipo === 'error' ? 'alert' : 'status'}
    >
      {titulo && <p className="font-semibold">{titulo}</p>}
      <div className={titulo ? 'mt-1' : undefined}>{children}</div>
    </div>
  );
}
