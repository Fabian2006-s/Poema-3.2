import { ErrorDeNegocio } from '@/lib/reglas/errores';

export type EstadoTrabajador = 'activo' | 'inactivo';

export function validarTrabajador(d: { nombre: string; documento: string; cargo: string }): void {
  if (![d.nombre, d.documento, d.cargo].every((valor) => valor.trim().length > 0)) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
}

export function puedeRecibirAsignacion(estado: EstadoTrabajador): boolean {
  return estado === 'activo';
}
