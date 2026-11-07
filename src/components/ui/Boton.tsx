import type { ButtonHTMLAttributes } from 'react';

type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBoton;
  cargando?: boolean;
};

const variantes: Record<VarianteBoton, string> = {
  primario: 'bg-primario text-white hover:bg-primario/90',
  secundario: 'border border-borde bg-superficie text-texto hover:bg-primario-suave',
  peligro: 'bg-vencido text-white hover:bg-vencido/90',
  fantasma: 'text-texto-suave hover:bg-primario-suave hover:text-texto',
};

export function Boton({
  children,
  className = '',
  cargando = false,
  disabled,
  type = 'button',
  variante = 'primario',
  ...props
}: BotonProps) {
  return (
    <button
      {...props}
      aria-busy={cargando || undefined}
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primario disabled:cursor-not-allowed disabled:opacity-60 ${variantes[variante]} ${className}`}
      disabled={disabled || cargando}
      type={type}
    >
      {cargando ? 'Guardando...' : children}
    </button>
  );
}
