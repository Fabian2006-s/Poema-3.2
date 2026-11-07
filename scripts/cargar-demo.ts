import { execFileSync } from 'node:child_process';
import { loadEnvConfig } from '@next/env';
import { hoyBogota, sumarDias } from '@/lib/reglas/fechas';

loadEnvConfig(process.cwd());

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
      fechaVencimiento: sumarDias(hoy, 40),
    });
    await crearQuimico({
      nombre: 'Demo Próximo',
      categoria: 'Fungicida',
      disponible: 2,
      minima: 0.5,
      unidad: 'litros',
      fechaVencimiento: sumarDias(hoy, 20),
    });
    await crearQuimico({
      nombre: 'Demo Vencido',
      categoria: 'Herbicida',
      disponible: 1,
      minima: 0,
      unidad: 'litros',
      fechaVencimiento: sumarDias(hoy, -1),
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
