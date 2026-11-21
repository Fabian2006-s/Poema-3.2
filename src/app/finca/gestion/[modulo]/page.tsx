import { notFound } from 'next/navigation';
import { ModuloGestion as ModuloGestionComponent } from '@/components/finca/ModuloGestion';
import { cargarModuloGestion, type ModuloGestion } from '@/lib/dataService';
import { hoyBogota } from '@/lib/reglas/fechas';

export const dynamic = 'force-dynamic';

const modulos: ModuloGestion[] = [
  'parcelas',
  'produccion',
  'riego',
  'asistencia',
  'maquinaria',
  'registro-maquinaria',
  'empaque',
  'ventas',
  'gastos',
  'materiales',
  'movimientos-materiales',
];

function esModuloGestion(valor: string): valor is ModuloGestion {
  return modulos.some((modulo) => modulo === valor);
}

export default async function ModuloGestionPage({
  params,
}: {
  params: Promise<{ modulo: string }>;
}) {
  const { modulo } = await params;
  if (!esModuloGestion(modulo)) notFound();

  const datos = await cargarModuloGestion(modulo);
  return <ModuloGestionComponent datos={datos} fechaHoy={hoyBogota()} modulo={modulo} />;
}
