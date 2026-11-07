import type { EstadoElemento, NivelVencimiento } from '@/lib/reglas/alertas';
import type { EstadoTrabajador } from '@/lib/reglas/trabajador';
import type { TipoElemento, TipoMovimiento } from '@/lib/reglas/inventario';

export type OpcionalesConUndefined<T> = {
  [K in keyof T]?: T[K] | undefined;
};

export type Trabajador = {
  id: string;
  nombre: string;
  documento: string;
  cargo: string;
  telefono: string | null;
  estado: EstadoTrabajador;
};

export type Implemento = {
  id: string;
  nombre: string;
  categoria: string;
  disponible: number;
  minima: number;
  estado: EstadoElemento;
  inventarioBajo: boolean;
  inactivo: boolean;
};

export type Quimico = {
  id: string;
  nombre: string;
  categoria: string;
  disponible: number;
  minima: number;
  unidad: string;
  fechaVencimiento: string;
  estado: EstadoElemento;
  inventarioBajo: boolean;
  nivelVencimiento: NivelVencimiento;
  inactivo: boolean;
};

export type DatosMovimiento = {
  tipoElemento: TipoElemento;
  elementoId: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  motivo: string;
  fecha: string;
};

export type Movimiento = DatosMovimiento & {
  id: number;
  elementoNombre: string;
};

export type ResultadoMovimiento = {
  tipoElemento: TipoElemento;
  elemento: Implemento | Quimico;
  movimiento: Movimiento;
};

export type Asignacion = {
  id: string;
  trabajadorId: string;
  implementoId: string;
  cantidad: number;
  fecha: string;
  estado: 'entregado' | 'devuelto';
};

export type ElementoAlerta =
  | ({ tipoElemento: 'implemento' } & Implemento)
  | ({ tipoElemento: 'quimico' } & Quimico);
