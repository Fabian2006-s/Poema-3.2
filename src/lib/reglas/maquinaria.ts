import { ErrorDeNegocio } from '@/lib/reglas/errores';

export function proximaLecturaValida(
  lectura: number | undefined,
  proximaLectura: number | undefined,
): boolean {
  return proximaLectura === undefined || (lectura !== undefined && proximaLectura > lectura);
}

export function validarLecturaNoRegresiva(
  lecturaNueva: number,
  lecturaAnterior: number | null,
): void {
  if (!Number.isSafeInteger(lecturaNueva) || lecturaNueva < 0) {
    throw new ErrorDeNegocio('DATOS_INVALIDOS');
  }
  if (lecturaAnterior !== null && lecturaNueva < lecturaAnterior) {
    throw new ErrorDeNegocio('LECTURA_MAQUINARIA_INVALIDA');
  }
}
