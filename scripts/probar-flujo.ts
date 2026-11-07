import { execFileSync } from 'node:child_process';
import { loadEnvConfig } from '@next/env';
import { hoyBogota, sumarDias } from '@/lib/reglas/fechas';

loadEnvConfig(process.cwd());

type CodigoEsperado =
  | 'DOCUMENTO_DUPLICADO'
  | 'CANTIDAD_INSUFICIENTE'
  | 'DATOS_INVALIDOS'
  | 'QUIMICO_VENCIDO';

let fallas = 0;

async function caso(etiqueta: string, operacion: () => Promise<boolean | void>): Promise<void> {
  try {
    const resultado = await operacion();
    if (resultado === false) throw new Error('El resultado no coincide con lo esperado.');
    console.log(`OK ${etiqueta}`);
  } catch (error) {
    fallas += 1;
    console.error(`FALLA ${etiqueta}:`, error);
  }
}

async function esperarError(
  codigo: CodigoEsperado,
  operacion: () => Promise<unknown>,
): Promise<boolean> {
  try {
    await operacion();
  } catch (error) {
    return (
      typeof error === 'object' &&
      error !== null &&
      'codigo' in error &&
      error.codigo === codigo
    );
  }
  return false;
}

async function main(): Promise<void> {
  const {
    cerrarPool,
    crearImplemento,
    crearQuimico,
    crearTrabajador,
    listarAlertas,
    registrarMovimiento,
  } = await import('@/lib/dataService');

  let trabajadorId = '';
  let implementoId = '';
  let quimicoId = '';
  let vencidoId = '';
  let porVencerId = '';

  try {
    execFileSync(process.execPath, ['scripts/limpiar-prueba.mjs', '--prueba'], { stdio: 'inherit' });
    const hoy = hoyBogota();

    await caso('1) crear trabajador activo', async () => {
      const resultado = await crearTrabajador({
        nombre: 'Prueba Juan',
        documento: 'PT-1',
        cargo: 'Operario',
      });
      trabajadorId = resultado.id;
      return Boolean(trabajadorId);
    });

    await caso('2) rechazar documento duplicado', () =>
      esperarError('DOCUMENTO_DUPLICADO', () =>
        crearTrabajador({ nombre: 'Prueba Duplicado', documento: 'PT-1', cargo: 'Operario' }),
      ),
    );

    await caso('3) crear implemento con inventario inicial', async () => {
      const resultado = await crearImplemento({
        nombre: 'Prueba Guantes',
        categoria: 'Protección',
        disponible: 10,
        minima: 5,
      });
      implementoId = resultado.id;
      return Boolean(implementoId);
    });

    await caso('4) crear químico normal de 2.5 litros', async () => {
      const resultado = await crearQuimico({
        nombre: 'Prueba Fungicida',
        categoria: 'Fungicida',
        disponible: 2.5,
        minima: 1,
        unidad: 'litros',
        fechaVencimiento: sumarDias(hoy, 40),
      });
      quimicoId = resultado.id;
      return Boolean(quimicoId);
    });

    await caso('5) salida de 4 guantes deja 6 sin alerta', async () => {
      const resultado = await registrarMovimiento({
        tipoElemento: 'implemento',
        elementoId: implementoId,
        tipoMovimiento: 'salida',
        cantidad: 4,
        motivo: 'Uso',
        fecha: hoy,
      });
      return (
        'disponible' in resultado.elemento &&
        resultado.elemento.disponible === 6 &&
        !resultado.elemento.inventarioBajo
      );
    });

    await caso('6) salida de 1 guante deja 5 y activa alerta por igualdad', async () => {
      const resultado = await registrarMovimiento({
        tipoElemento: 'implemento',
        elementoId: implementoId,
        tipoMovimiento: 'salida',
        cantidad: 1,
        motivo: 'Uso',
        fecha: hoy,
      });
      return (
        'disponible' in resultado.elemento &&
        resultado.elemento.disponible === 5 &&
        resultado.elemento.inventarioBajo
      );
    });

    await caso('7) rechazar salida de implementos superior a existencias', () =>
      esperarError('CANTIDAD_INSUFICIENTE', () =>
        registrarMovimiento({
          tipoElemento: 'implemento',
          elementoId: implementoId,
          tipoMovimiento: 'salida',
          cantidad: 10,
          motivo: 'Prueba excedida',
          fecha: hoy,
        }),
      ),
    );

    await caso('8) salida de 1.5 litros deja 1.0 exacto', async () => {
      const resultado = await registrarMovimiento({
        tipoElemento: 'quimico',
        elementoId: quimicoId,
        tipoMovimiento: 'salida',
        cantidad: 1.5,
        motivo: 'Aplicación',
        fecha: hoy,
      });
      return (
        'unidad' in resultado.elemento &&
        resultado.elemento.disponible === 1 &&
        resultado.elemento.unidad === 'litros'
      );
    });

    await caso('9) rechazar salida de químico que excede existencias', () =>
      esperarError('CANTIDAD_INSUFICIENTE', () =>
        registrarMovimiento({
          tipoElemento: 'quimico',
          elementoId: quimicoId,
          tipoMovimiento: 'salida',
          cantidad: 1.5,
          motivo: 'Aplicación excedida',
          fecha: hoy,
        }),
      ),
    );

    await caso('10) rechazar movimiento con cantidad cero', () =>
      esperarError('DATOS_INVALIDOS', () =>
        registrarMovimiento({
          tipoElemento: 'implemento',
          elementoId: implementoId,
          tipoMovimiento: 'entrada',
          cantidad: 0,
          motivo: 'Prueba inválida',
          fecha: hoy,
        }),
      ),
    );

    await caso('11) rechazar movimiento sin motivo', () =>
      esperarError('DATOS_INVALIDOS', () =>
        registrarMovimiento({
          tipoElemento: 'implemento',
          elementoId: implementoId,
          tipoMovimiento: 'entrada',
          cantidad: 1,
          motivo: ' ',
          fecha: hoy,
        }),
      ),
    );

    await caso('12) crear químico vencido', async () => {
      const resultado = await crearQuimico({
        nombre: 'Prueba Vencido',
        categoria: 'Herbicida',
        disponible: 1,
        minima: 0,
        unidad: 'litros',
        fechaVencimiento: sumarDias(hoy, -1),
      });
      vencidoId = resultado.id;
      return Boolean(vencidoId);
    });

    await caso('13) rechazar salida de químico vencido', () =>
      esperarError('QUIMICO_VENCIDO', () =>
        registrarMovimiento({
          tipoElemento: 'quimico',
          elementoId: vencidoId,
          tipoMovimiento: 'salida',
          cantidad: 0.5,
          motivo: 'Intento vencido',
          fecha: hoy,
        }),
      ),
    );

    await caso('14) crear químico con vencimiento en 30 días', async () => {
      const resultado = await crearQuimico({
        nombre: 'Prueba PorVencer',
        categoria: 'Fungicida',
        disponible: 1,
        minima: 0,
        unidad: 'litros',
        fechaVencimiento: sumarDias(hoy, 30),
      });
      porVencerId = resultado.id;
      return Boolean(porVencerId);
    });

    await caso('15) listar alertas de bajo, próximo y vencido', async () => {
      const alertas = await listarAlertas();
      return (
        alertas.inventarioBajo.some((elemento) => elemento.id === implementoId) &&
        alertas.porVencer.some((quimico) => quimico.id === porVencerId) &&
        alertas.vencidos.some((quimico) => quimico.id === vencidoId)
      );
    });
  } catch (error) {
    fallas += 1;
    console.error('No se pudo preparar o ejecutar la prueba de flujo:', error);
  } finally {
    try {
      execFileSync(process.execPath, ['scripts/limpiar-prueba.mjs', '--prueba'], { stdio: 'inherit' });
    } catch (error) {
      fallas += 1;
      console.error('No se pudieron limpiar los datos de prueba:', error);
    }
    try {
      await cerrarPool();
    } catch (error) {
      fallas += 1;
      console.error('No se pudo cerrar el pool de Postgres:', error);
    }
  }

  console.log(`Total de fallas: ${fallas}`);
  if (fallas > 0) process.exitCode = 1;
}

void main().catch((error: unknown) => {
  console.error('Error inesperado en la prueba de flujo:', error);
  process.exitCode = 1;
});
