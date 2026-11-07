import { Insignia } from '@/components/ui/Insignia';
import type { EstadoElemento } from '@/lib/reglas/alertas';
import type { EstadoTrabajador } from '@/lib/reglas/trabajador';

type EstadoVisible = EstadoElemento | EstadoTrabajador;

const etiquetas: Record<EstadoVisible, string> = {
  disponible: 'Disponible',
  agotado: 'Agotado',
  vencido: 'Vencido',
  inactivo: 'Inactivo',
  activo: 'Activo',
};

export function InsigniaEstado({ estado }: { estado: EstadoVisible }) {
  const tono =
    estado === 'disponible' || estado === 'activo'
      ? 'disponible'
      : estado === 'vencido' || estado === 'agotado'
        ? 'vencido'
        : 'inactivo';
  return <Insignia tono={tono}>{etiquetas[estado]}</Insignia>;
}
