import { execFileSync } from 'node:child_process';
import { loadEnvConfig } from '@next/env';

loadEnvConfig(process.cwd());

function desplazarFecha(fecha: string, dias: number): string {
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const resultado = new Date(Date.UTC(anio ?? 0, (mes ?? 1) - 1, (dia ?? 1) + dias));
  return resultado.toISOString().slice(0, 10);
}

function hoyBogota(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const valores = Object.fromEntries(partes.map(({ type, value }) => [type, value]));
  return `${valores.year}-${valores.month}-${valores.day}`;
}

async function main(): Promise<void> {
  const { cerrarPool, crearImplemento, crearQuimico, crearTrabajador, registrarMovimiento } =
    await import('@/lib/dataService');

  try {
    execFileSync(process.execPath, ['scripts/limpiar-prueba.mjs'], { stdio: 'inherit' });
    const hoy = hoyBogota();
    await crearTrabajador({
      nombre: 'Demo Juan',
      documento: 'DEMO-TRAB-01',
      cargo: 'Encargado',
      telefono: '3000000000',
      estado: 'activo',
    });
    await crearTrabajador({
      nombre: 'Demo Ana',
      documento: 'DEMO-TRAB-02',
      cargo: 'Operaria',
      estado: 'activo',
    });

    const guantes = await crearImplemento({
      nombre: 'Demo Guantes',
      categoria: 'Protección',
      disponible: 10,
      minima: 5,
    });
    await crearImplemento({
      nombre: 'Demo Azadón',
      categoria: 'Herramientas',
      disponible: 5,
      minima: 5,
    });

    const fertilizante = await crearQuimico({
      nombre: 'Demo Fertilizante',
      categoria: 'Fertilizante',
      disponible: 8.5,
      minima: 1,
      unidad: 'litros',
      fechaVencimiento: desplazarFecha(hoy, 40),
    });
    await crearQuimico({
      nombre: 'Demo Próximo',
      categoria: 'Fungicida',
      disponible: 2,
      minima: 0.5,
      unidad: 'litros',
      fechaVencimiento: desplazarFecha(hoy, 20),
    });
    await crearQuimico({
      nombre: 'Demo Vencido',
      categoria: 'Herbicida',
      disponible: 1,
      minima: 0,
      unidad: 'litros',
      fechaVencimiento: desplazarFecha(hoy, -1),
    });

    await registrarMovimiento({
      tipoElemento: 'implemento',
      elementoId: guantes.id,
      tipoMovimiento: 'salida',
      cantidad: 2,
      motivo: 'Uso de demostración',
      fecha: hoy,
    });
    await registrarMovimiento({
      tipoElemento: 'quimico',
      elementoId: fertilizante.id,
      tipoMovimiento: 'salida',
      cantidad: 1.5,
      motivo: 'Aplicación de demostración',
      fecha: hoy,
    });
    console.log('Datos demo cargados: trabajadores, implementos, químicos y movimientos.');
  } catch (error) {
    console.error('No se pudieron cargar los datos demo:', error);
    process.exitCode = 1;
  } finally {
    await cerrarPool();
  }
}

void main().catch((error: unknown) => {
  console.error('Error inesperado al cargar datos demo:', error);
  process.exitCode = 1;
});
