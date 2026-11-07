export function EstadoVacio({
  titulo,
  descripcion,
}: {
  titulo: string;
  descripcion: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-borde px-5 py-8 text-center">
      <h3 className="font-semibold text-texto">{titulo}</h3>
      <p className="mt-1 text-sm text-texto-suave">{descripcion}</p>
    </div>
  );
}
