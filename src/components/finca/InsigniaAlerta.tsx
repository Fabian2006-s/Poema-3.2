import { Insignia } from '@/components/ui/Insignia';

type TipoAlerta = 'inventarioBajo' | 'porVencer' | 'vencido';

const alertas: Record<TipoAlerta, { etiqueta: string; tono: 'bajo' | 'vencido' }> = {
  inventarioBajo: { etiqueta: 'Inventario bajo', tono: 'bajo' },
  porVencer: { etiqueta: 'Próximo a vencer', tono: 'bajo' },
  vencido: { etiqueta: 'Vencido', tono: 'vencido' },
};

export function InsigniaAlerta({ tipo }: { tipo: TipoAlerta }) {
  const alerta = alertas[tipo];
  return <Insignia tono={alerta.tono}>{alerta.etiqueta}</Insignia>;
}
