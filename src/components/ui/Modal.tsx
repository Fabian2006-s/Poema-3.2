'use client';

import { useEffect, useRef, type ReactNode } from 'react';

export function Modal({
  abierto,
  titulo,
  children,
  onCerrar,
}: {
  abierto: boolean;
  titulo: string;
  children: ReactNode;
  onCerrar: () => void;
}) {
  const referencia = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = referencia.current;
    if (!dialogo) return;
    if (abierto && !dialogo.open) dialogo.showModal();
    if (!abierto && dialogo.open) dialogo.close();
  }, [abierto]);

  return (
    <dialog
      aria-labelledby="modal-titulo"
      className="m-auto w-[min(92vw,32rem)] rounded-lg border border-borde bg-superficie p-0 text-texto shadow-xl backdrop:bg-black/50"
      onClose={onCerrar}
      onCancel={onCerrar}
      ref={referencia}
    >
      <div className="grid gap-4 p-6">
        <h2 className="text-lg font-semibold" id="modal-titulo">
          {titulo}
        </h2>
        {children}
      </div>
    </dialog>
  );
}
