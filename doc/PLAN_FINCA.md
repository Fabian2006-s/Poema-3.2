# Finca Bananera · Plan técnico de implementación

> Sistema de Gestión de Finca Bananera (trabajadores, implementos, químicos e inventario) · versión técnica 1.0, derivada del plan funcional de Fabián Steban Andrade Sosa
> Asignatura: Lógica y Programación (SIST0200) · Universidad Sergio Arboleda, Santa Marta · Docente: Jhonatan Castro Polo
> Stack: Next.js (App Router) + TypeScript + Tailwind CSS + Supabase Postgres · Despliegue en Vercel
> Ejecución: GitHub Copilot en modo Agente, con los prompts de `doc/PROMPTS_FINCA.md`

---

## Índice

0. [Cómo se usa este documento](#0-cómo-se-usa-este-documento)
1. [Punto de partida y conciliación](#1-punto-de-partida-y-conciliación)
2. [Alcance](#2-alcance)
3. [Acceso](#3-acceso)
4. [Estados y clasificaciones](#4-estados-y-clasificaciones)
5. [Reglas de negocio](#5-reglas-de-negocio)
6. [Casos de uso](#6-casos-de-uso)
7. [Cantidades: enteros y decimales](#7-cantidades-enteros-y-decimales)
8. [Alertas de inventario y vencimiento](#8-alertas-de-inventario-y-vencimiento)
9. [Modelo de datos](#9-modelo-de-datos)
10. [Arquitectura del código](#10-arquitectura-del-código)
11. [Contratos de API](#11-contratos-de-api)
12. [Pantallas](#12-pantallas)
13. [Identidad visual](#13-identidad-visual)
14. [Cantidades, fechas y zona horaria](#14-cantidades-fechas-y-zona-horaria)
15. [Seguridad e integridad](#15-seguridad-e-integridad)
16. [Pruebas](#16-pruebas)
17. [Plan de ejecución](#17-plan-de-ejecución)
18. [Funcionalidades opcionales](#18-funcionalidades-opcionales)
19. [Glosario](#19-glosario)

---

## 0. Cómo se usa este documento

Este plan es el documento rector del proyecto. Copilot lo lee antes de cada tarea y los prompts remiten a sus secciones por número. Si un prompt y este plan no coinciden, prevalece el plan.

El plan funcional de Fabián ya trae especificación (SPEC), reglas numeradas (RN-01 a RN-22), casos de uso (CU-01 a CU-12) y requerimientos (RF, RNF). Este plan técnico los conserva y los traduce al stack del curso. El primer prompt (P00) concilia: audita qué hay montado en el repositorio y decide en cada paso si crear o adaptar.

| Archivo en el repositorio | Función |
|---|---|
| `doc/PLAN_FINCA.md` | Este documento |
| `doc/PROMPTS_FINCA.md` | Prompts en orden de ejecución |
| `doc/ESTADO_ACTUAL.md` | Radiografía del repositorio antes de empezar (lo crea P00) |
| `doc/DICTAMEN.md` | Qué existe, qué falta y qué se crea o adapta |
| `doc/ESTADO_EJECUCION.md` | Avance prompt por prompt |
| `doc/checkpoints/FASE_N_COMPLETADA.md` | Evidencia del cierre de cada fase |
| `.github/copilot-instructions.md` | Reglas permanentes que Copilot aplica en todas las conversaciones |

---

## 1. Punto de partida y conciliación

### 1.1 Lo que el proyecto necesita

- Proyecto Next.js con TypeScript, desplegado en Vercel.
- Proyecto Supabase para la base de datos.
- Un login para el encargado (el plan lo exige: RNF-06).

P00 verifica qué hay y el dictamen marca cada pieza como existe / falta / se crea. El plan es la meta; el camino se ajusta a lo que el repositorio tenga.

### 1.2 Lo que P00 verifica (y el dictamen resuelve)

| Aspecto | Qué decide |
|---|---|
| Si existe el proyecto Next.js con TypeScript y compila | Si hay base o hay que crearla |
| Si existe conexión a Supabase/Postgres | Si se usa o hay que crearla y conectarla |
| Si hay login (RNF-06) | Si se envuelve (sin reescribir) o se agrega uno mínimo en P03 |
| Mecanismo de migraciones | Si existe se usa; si no, se crea `npm run db:migrar` |
| Versión de Tailwind | Define dónde se declaran los colores (sección 13) |
| Qué del dominio ya está construido | Para adaptarlo en vez de rehacerlo |

### 1.3 Regla sobre el login

El plan funcional exige autenticación del encargado (RNF-06) y un solo actor: el encargado de la finca; los trabajadores no modifican inventarios (RNF-05). Se usa un login como puerta única de acceso, sin roles diferenciados: el encargado entra y gestiona todo. Los trabajadores son datos que el encargado registra, no usuarios que inician sesión. Si P00 encuentra login, se envuelve con `lib/auth/sesion.ts` sin reescribirlo; si no, P03 agrega uno mínimo. En ambos casos, `/finca/*` y `/api/finca/*` quedan protegidas.

---

## 2. Alcance

### 2.1 Módulo mínimo (el del plan funcional)

| ID | Funcionalidad (plan funcional) | Casos de uso | Prompts |
|---|---|---|---|
| F1 | Registrar trabajadores (datos, cargo, estado) | CU-01 | P04, P05, P06 |
| F2 | Registrar implementos (cantidades enteras) | CU-02 | P04, P05, P07 |
| F3 | Registrar productos químicos (cantidades decimales, vencimiento) | CU-03 | P04, P05, P07 |
| F4 | Registrar entradas y salidas de inventario | CU-04 | P02, P04, P05, P08 |
| F5 | Consultar existencias | CU-05 | P04, P07, P08 |
| F6 | Ver alertas de inventario bajo | CU-06 | P02, P08 |

### 2.2 Funcionalidades opcionales

| ID | Funcionalidad | Casos de uso | Prompts |
|---|---|---|---|
| F7 | Asignar implementos a trabajadores activos | CU-07 | P09 |
| F8 | Registrar devoluciones de implementos | CU-08 | P09 |
| F9 | Alertas de químicos próximos a vencer | CU-09 | P02, P08, P09 |
| F10 | Historial de movimientos de inventario | CU-10 | P09 |
| F11 | Consultar implementos asignados a un trabajador | CU-11 | P09 |
| F12 | Filtros y reportes de inventario | CU-12 | P09 |

Se construyen solo con la fase 5 cerrada. La clasificación "vencido" y "próximo a vencer" del químico se calcula desde el módulo mínimo (es un estado derivado, sección 8), pero la pantalla de alertas de vencimiento (F9) es opcional.

### 2.3 Fuera de alcance

Se mantiene la lista del plan funcional: nómina y salarios, control de horas y jornadas, ventas de banano, clientes y compradores, compras y pagos automáticos a proveedores, maquinaria y vehículos, cálculo de dosis de químicos por cultivo, instrucciones de seguridad para químicos, geolocalización de trabajadores, aplicación móvil independiente, y modificación de inventarios por los trabajadores.

### 2.4 Decisiones de alcance de esta versión técnica

| Decisión | Motivo |
|---|---|
| Los datos viven en Supabase Postgres (RNF-07) | Para que persistan entre sesiones; es el estándar del curso |
| Las cantidades de implementos son enteros; las de químicos, decimales guardados como entero en centésimas (sección 7) | RN-09 y RN-16; las centésimas evitan errores de redondeo en sumas y restas (RNF-13) |
| El estado del elemento (disponible / agotado / vencido) se deriva, no se edita a mano | RN-14, RN-22; evita que estado y cantidad se contradigan |
| Las alertas (bajo, próximo a vencer, vencido) se calculan al leer, no se guardan | Dependen de la cantidad y de la fecha de hoy, que cambia cada día (sección 8) |
| El movimiento y la actualización del inventario ocurren en una transacción | RNF-04: si uno falla, ninguno se aplica |
| Un trabajador, implemento o químico no se elimina; se desactiva | Un elemento con movimientos o asignaciones debe seguir en el historial |
| El umbral de "próximo a vencer" (30 días) es configurable | RNF-11: se cambia en un solo lugar |
| Un químico vencido no admite salida | RN-15 |

---

## 3. Acceso

| Actor | Acceso | Puede hacer |
|---|---|---|
| Encargado de la finca | Login como puerta | Registrar trabajadores, implementos y químicos; registrar movimientos; consultar existencias y alertas; (opcional) asignar y recibir implementos, ver historial y reportes |
| Sistema | Interno | Valida entradas, actualiza cantidades, deriva estados y alertas, registra movimientos |

| Ruta | Sin sesión | Con sesión |
|---|:-:|:-:|
| `/` | Redirige al login | Redirige a `/finca` |
| `/finca/*` | Redirige al login | Sí |
| `/api/finca/*` | 401 | Sí |

Es de un solo actor; los trabajadores no acceden al sistema (RNF-05).

---

## 4. Estados y clasificaciones

### 4.1 Estado del trabajador (`trabajadores.estado`)

| Código | Etiqueta | Significado |
|---|---|---|
| `activo` | Activo | Puede recibir asignaciones de implementos (RN-02) |
| `inactivo` | Inactivo | No puede recibir nuevas asignaciones (RN-03) |

### 4.2 Estado del elemento (derivado de la cantidad y, en químicos, de la fecha)

| Código | Etiqueta | Cuándo |
|---|---|---|
| `disponible` | Disponible | Cantidad mayor que 0 y, si es químico, no vencido |
| `agotado` | Agotado | Cantidad en 0 (RN-22) |
| `vencido` | Vencido | Solo químicos: la fecha de vencimiento ya pasó (RN-14) |
| `inactivo` | Inactivo | El encargado lo desactivó (no entra en movimientos nuevos) |

El estado `disponible`/`agotado`/`vencido` no se guarda como campo editable: se deriva de la cantidad y de la fecha al leer (sección 8). `inactivo` sí es un campo, porque es una decisión del encargado.

### 4.3 Clasificación de alerta (derivada, no se guarda)

| Código | Cuándo |
|---|---|
| `inventario_bajo` | Cantidad disponible menor o igual a la mínima (RN-06, RN-12) |
| `proximo_a_vencer` | Químico con 30 días o menos para vencer (RN-13) |
| `vencido` | Químico cuya fecha ya pasó (RN-14) |
| `ninguna` | Ningún caso anterior |

### 4.4 Estado de la asignación (`asignaciones.estado`, opcional)

| Código | Etiqueta | Significado |
|---|---|---|
| `entregado` | Entregado | El trabajador tiene el implemento |
| `devuelto` | Devuelto | Se devolvió; la cantidad volvió al inventario (RN-08) |

---

## 5. Reglas de negocio

Se conservan las reglas del plan funcional (RN-01 a RN-22), con su numeración.

| ID | Regla | Dónde se aplica |
|---|---|---|
| RN-01 | El documento del trabajador es único | BD índice único; `lib/reglas/trabajador.ts` |
| RN-02 | Un trabajador solo recibe implementos si está `activo` | Servicio `asignarImplemento` (F7) |
| RN-03 | Un trabajador `inactivo` no recibe nuevas asignaciones | Servicio `asignarImplemento` (F7) |
| RN-04 | La cantidad disponible de un implemento nunca es menor que 0 | BD CHECK; `nuevaCantidad` |
| RN-05 | No se registra una salida de implemento mayor a la disponible | `lib/reglas/inventario.ts`; transacción |
| RN-06 | Alerta de inventario bajo si disponible ≤ mínima (incluye igualdad) | `lib/reglas/alertas.ts` `hayInventarioBajo` |
| RN-07 | Una asignación solo se realiza si hay cantidad suficiente | Servicio `asignarImplemento` (F7) |
| RN-08 | Una devolución suma la cantidad de nuevo al inventario | Servicio `registrarDevolucion` (F8) |
| RN-09 | Las cantidades de implementos son enteros | Zod; BD; `lib/reglas/inventario.ts` |
| RN-10 | La cantidad disponible de un químico nunca es menor que 0 | BD CHECK |
| RN-11 | No se registra una salida de químico mayor a la disponible | `lib/reglas/inventario.ts`; transacción |
| RN-12 | Alerta de inventario bajo en químicos si disponible ≤ mínima | `lib/reglas/alertas.ts` |
| RN-13 | Un químico está próximo a vencer si faltan 30 días o menos (30 exactos incluido) | `lib/reglas/alertas.ts` `nivelVencimiento` |
| RN-14 | Si la fecha de vencimiento ya pasó, el químico se marca `vencido` | `lib/reglas/alertas.ts` |
| RN-15 | Un químico vencido no admite salida | Servicio `registrarMovimiento` |
| RN-16 | Las cantidades de químicos admiten decimales | Se guardan en centésimas enteras (sección 7) |
| RN-17 | Una entrada suma la cantidad a la disponible | `lib/reglas/inventario.ts` `nuevaCantidad` |
| RN-18 | Una salida resta la cantidad de la disponible | `lib/reglas/inventario.ts` `nuevaCantidad` |
| RN-19 | Todo movimiento guarda fecha y motivo | Zod; BD NOT NULL; servicio |
| RN-20 | La cantidad de un movimiento es mayor que 0 | `lib/reglas/inventario.ts` `validarCantidadMovimiento`; BD CHECK |
| RN-21 | Si tras una salida la cantidad queda en el mínimo, la alerta de bajo se mantiene | Derivado: la alerta se recalcula al leer (RN-06) |
| RN-22 | Un elemento con cantidad disponible 0 pasa a `agotado` | Estado derivado (sección 8) |
| RN-23 | El documento, el nombre del trabajador, el nombre del implemento y el del químico no pueden estar vacíos | Agregada; Zod; BD CHECK |
| RN-24 | La cantidad mínima es un entero (implementos) o decimal (químicos) ≥ 0 | Agregada; Zod; BD CHECK |
| RN-25 | Trabajadores, implementos y químicos no se eliminan; se desactivan | Agregada; servicio; BD `ON DELETE RESTRICT` |

### 5.1 Casos límite (del plan)

| Caso | Resultado |
|---|---|
| Documento de trabajador repetido | Rechazo (`DOCUMENTO_DUPLICADO`) |
| Implemento con disponible 5 y mínima 5 | Alerta de inventario bajo (igualdad, RN-06) |
| Implemento con disponible 6 y mínima 5 | Sin alerta |
| Salida mayor a la cantidad disponible | Rechazo (`CANTIDAD_INSUFICIENTE`); el inventario no cambia |
| Movimiento con cantidad 0 o negativa | Rechazo (`DATOS_INVALIDOS`) |
| Movimiento sin motivo o sin fecha | Rechazo (`DATOS_INVALIDOS`) |
| Químico con 30 días exactos para vencer | Próximo a vencer (RN-13) |
| Químico con fecha ya pasada | Vencido (RN-14) |
| Salida de un químico vencido | Rechazo (`QUIMICO_VENCIDO`) |
| Salida que deja la cantidad exactamente en el mínimo | Permitida; la alerta de bajo se mantiene (RN-21) |
| Salida que deja la cantidad en 0 | Permitida; el elemento pasa a `agotado` (RN-22) |
| Químico 2,5 litros, salida 1,5 | Queda 1,0 exacto (sin error de redondeo, sección 7) |
| Asignar a un trabajador inactivo (opcional) | Rechazo (`TRABAJADOR_INACTIVO`) |

---

## 6. Casos de uso

Se conservan CU-01 a CU-12 del plan. Resumen con entradas y errores:

| ID | Entrada | Precondición | Efecto | Errores posibles |
|---|---|---|---|---|
| CU-01 Registrar trabajador | nombre, documento, cargo, teléfono, estado | documento no repetido | Trabajador creado | `DATOS_INVALIDOS`, `DOCUMENTO_DUPLICADO` |
| CU-02 Registrar implemento | nombre, categoría, cantidad, mínima, estado | nombre no repetido | Implemento con su cantidad | `DATOS_INVALIDOS`, `IMPLEMENTO_DUPLICADO` |
| CU-03 Registrar químico | nombre, categoría, cantidad, unidad, vencimiento, mínima | nombre no repetido | Químico con su cantidad y estado (vencido si la fecha pasó) | `DATOS_INVALIDOS`, `QUIMICO_DUPLICADO` |
| CU-04 Registrar movimiento | tipo de elemento, elemento, tipo de movimiento, cantidad, fecha, motivo | el elemento existe y está activo | Cantidad sumada o restada; movimiento guardado; estado y alertas recalculados | `ELEMENTO_NO_ENCONTRADO`, `CANTIDAD_INSUFICIENTE`, `QUIMICO_VENCIDO`, `DATOS_INVALIDOS` |
| CU-05 Consultar existencias | filtro opcional | — | Lista de trabajadores, implementos o químicos con cantidad, unidad y estado | — |
| CU-06 Ver alertas de inventario | — | — | Elementos con cantidad ≤ mínima | — |
| CU-07 Asignar implemento (opcional) | trabajador, implemento, cantidad | trabajador activo; cantidad suficiente | Asignación `entregado`; inventario descontado | `TRABAJADOR_NO_ENCONTRADO`, `TRABAJADOR_INACTIVO`, `IMPLEMENTO_NO_ENCONTRADO`, `CANTIDAD_INSUFICIENTE` |
| CU-08 Registrar devolución (opcional) | asignación | la asignación está `entregado` | Asignación `devuelto`; cantidad sumada al inventario | `ASIGNACION_NO_ENCONTRADA`, `ASIGNACION_NO_DEVOLUCION` |
| CU-09 Ver químicos próximos a vencer (opcional) | — | — | Químicos con ≤ 30 días y los vencidos | — |
| CU-10 Consultar historial (opcional) | filtro opcional | — | Movimientos con tipo, cantidad, fecha y motivo | — |
| CU-11 Implementos asignados a un trabajador (opcional) | trabajador | existe | Implementos en estado `entregado` del trabajador | `TRABAJADOR_NO_ENCONTRADO` |
| CU-12 Filtros y reportes (opcional) | filtros | — | Inventario filtrado | — |

### 6.1 Secuencia de CU-04 (registrar movimiento)

Todo ocurre dentro de `conTransaccion`, con el elemento bloqueado (RNF-04):

1. `validarCantidadMovimiento(cantidad, tipoElemento)` (cantidad > 0; entera si implemento, decimal si químico) y `validarMotivoYFecha` (motivo no vacío, fecha válida) (RN-19, RN-20).
2. Bloquear el elemento (`SELECT ... FOR UPDATE`); si no existe o está inactivo, `ELEMENTO_NO_ENCONTRADO`.
3. Si es salida de un químico vencido, `QUIMICO_VENCIDO` (RN-15).
4. Calcular la nueva cantidad con `nuevaCantidad` (entrada suma, salida resta); si una salida excede la disponible, `CANTIDAD_INSUFICIENTE` (RN-05, RN-11).
5. Actualizar la cantidad del elemento e insertar el movimiento (RN-17, RN-18, RN-19).
6. Confirmar y devolver el elemento con su cantidad, estado y alerta recalculados.

```ts
export async function registrarMovimiento(d: DatosMovimiento): Promise<ResultadoMovimiento> {
  validarCantidadMovimiento(d.cantidad, d.tipoElemento);   // RN-20, RN-09/RN-16
  validarMotivoYFecha(d.motivo, d.fecha);                   // RN-19
  return conTransaccion(async (tx) => {
    const elemento = await bloquearElemento(tx, d.tipoElemento, d.elementoId);  // ELEMENTO_NO_ENCONTRADO
    if (d.tipoMovimiento === 'salida' && d.tipoElemento === 'quimico'
        && estaVencido(elemento.fechaVencimiento, hoyBogota())) {
      throw new ErrorDeNegocio('QUIMICO_VENCIDO');          // RN-15
    }
    const nueva = nuevaCantidad(elemento.cantidad, d.tipoMovimiento, d.cantidad);  // RN-05/RN-11, RN-17/RN-18
    await actualizarCantidad(tx, d.tipoElemento, elemento.id, nueva);
    await insertarMovimiento(tx, d);                        // RN-19
    return leerElementoConEstado(tx, d.tipoElemento, elemento.id);
  });
}
```

---

## 7. Cantidades: enteros y decimales

El plan distingue dos tipos de cantidad: implementos en enteros (RN-09) y químicos con decimales (RN-16). Los decimales de punto flotante acumulan error (2,5 − 1,5 − 1,0 puede no dar 0 exacto), lo que violaría RNF-13 ("sin errores de redondeo visibles"). Por eso:

- **Implementos:** cantidad y mínima como `INTEGER` (unidades enteras).
- **Químicos:** cantidad y mínima guardadas como **entero en centésimas** (una unidad = 100). 2,5 litros se guardan como `250`; 1,5 como `150`. Las sumas y restas se hacen en enteros y la conversión a decimal (dividir entre 100) ocurre solo al mostrar.

```ts
// lib/reglas/cantidades.ts
export function aCentesimas(valorDecimal: number): number {
  return Math.round(valorDecimal * 100);     // 2.5 → 250
}
export function deCentesimas(centesimas: number): number {
  return centesimas / 100;                   // 250 → 2.5
}
```

Así, `aCentesimas(2.5) − aCentesimas(1.5) = 100`, que al mostrar es `1.0` exacto. El movimiento de un químico recibe su cantidad en decimal, se convierte a centésimas para operar y se guarda en centésimas; la interfaz muestra siempre el decimal con la unidad (litros, kilogramos). Los implementos no usan esta conversión: son enteros directos.

---

## 8. Alertas de inventario y vencimiento

Las alertas y el estado del elemento se calculan al leer, con la cantidad actual y la fecha de hoy; no se guardan como campos (así nunca quedan desactualizados).

```ts
// lib/reglas/alertas.ts
export function hayInventarioBajo(disponible: number, minima: number): boolean {
  return disponible <= minima;               // RN-06, RN-12 (incluye igualdad)
}

export type NivelVencimiento = 'vigente' | 'proximo' | 'vencido';
export function nivelVencimiento(fechaVencimiento: string, hoy: string, diasAviso: number): NivelVencimiento {
  const dias = diasEntre(hoy, fechaVencimiento);
  if (dias < 0) return 'vencido';            // RN-14
  if (dias <= diasAviso) return 'proximo';   // RN-13 (30 exactos incluido)
  return 'vigente';
}

export function estadoElemento(d: {
  tipo: 'implemento' | 'quimico'; disponible: number; inactivo: boolean;
  fechaVencimiento?: string | null; hoy: string;
}): EstadoElemento {
  if (d.inactivo) return 'inactivo';
  if (d.tipo === 'quimico' && d.fechaVencimiento
      && nivelVencimiento(d.fechaVencimiento, d.hoy, 0) === 'vencido') return 'vencido';
  if (d.disponible <= 0) return 'agotado';   // RN-22
  return 'disponible';
}
```

- Inventario bajo: disponible ≤ mínima, con igualdad incluida (una cantidad de 5 con mínima 5 alerta; 6 con mínima 5 no).
- Próximo a vencer: 30 días o menos (configurable), con 30 exactos incluido.
- Vencido: la fecha ya pasó.

Ejemplos (hoy = 2026-06-15, aviso 30 días):

| Vencimiento | Días | Nivel |
|---|---|---|
| 2026-07-20 | 35 | vigente |
| 2026-07-15 | 30 | proximo |
| 2026-06-16 | 1 | proximo |
| 2026-06-14 | −1 | vencido |

---

## 9. Modelo de datos

### 9.1 Relaciones

```text
trabajadores 1 ──── N asignaciones N ──── 1 implementos
implementos  (movimientos con tipo_elemento = 'implemento')
quimicos     (movimientos con tipo_elemento = 'quimico')
movimientos  → referencia polimórfica por (tipo_elemento, elemento_id)

v_implementos = implementos + estado y alerta derivados
v_quimicos    = quimicos + estado, nivel de vencimiento y alerta derivados
```

Los movimientos usan una referencia por tipo (`tipo_elemento` + `elemento_id`) porque apuntan a dos tablas distintas (implementos o químicos); la integridad de que el elemento exista se valida en el servicio al registrar. Las migraciones se guardan en `supabase/migrations/`. En este documento se nombran M1 y M2 (y M3 para las opcionales). P00 confirma la numeración.

### 9.2 M1 · Tablas

```sql
-- M1: tablas de la finca bananera

CREATE TABLE IF NOT EXISTS trabajadores (
  id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(120)  NOT NULL,
  documento   VARCHAR(40)   NOT NULL,
  cargo       VARCHAR(80)   NOT NULL,
  telefono    VARCHAR(40),
  estado      VARCHAR(10)   NOT NULL DEFAULT 'activo',
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT trab_nombre_minimo    CHECK (char_length(btrim(nombre)) >= 1),      -- RN-23
  CONSTRAINT trab_documento_minimo CHECK (char_length(btrim(documento)) >= 1),   -- RN-23
  CONSTRAINT trab_estado_valido    CHECK (estado IN ('activo', 'inactivo'))      -- RN-02, RN-03
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_trab_documento ON trabajadores (lower(btrim(documento)));  -- RN-01

CREATE TABLE IF NOT EXISTS implementos (
  id              UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre          VARCHAR(120)  NOT NULL,
  categoria       VARCHAR(60)   NOT NULL,
  disponible      INTEGER       NOT NULL DEFAULT 0,          -- enteros (RN-09)
  minima          INTEGER       NOT NULL DEFAULT 0,
  inactivo        BOOLEAN       NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT impl_nombre_minimo  CHECK (char_length(btrim(nombre)) >= 1),        -- RN-23
  CONSTRAINT impl_disp_no_neg    CHECK (disponible >= 0),                        -- RN-04
  CONSTRAINT impl_minima_no_neg  CHECK (minima >= 0)                             -- RN-24
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_impl_nombre ON implementos (lower(btrim(nombre)));

CREATE TABLE IF NOT EXISTS quimicos (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             VARCHAR(120)  NOT NULL,
  categoria          VARCHAR(60)   NOT NULL,
  disponible_cent    INTEGER       NOT NULL DEFAULT 0,       -- centésimas (sección 7)
  minima_cent        INTEGER       NOT NULL DEFAULT 0,
  unidad             VARCHAR(20)   NOT NULL,                 -- litros, kilogramos, etc.
  fecha_vencimiento  DATE          NOT NULL,
  inactivo           BOOLEAN       NOT NULL DEFAULT false,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT quim_nombre_minimo CHECK (char_length(btrim(nombre)) >= 1),         -- RN-23
  CONSTRAINT quim_disp_no_neg   CHECK (disponible_cent >= 0),                    -- RN-10
  CONSTRAINT quim_minima_no_neg CHECK (minima_cent >= 0),                        -- RN-24
  CONSTRAINT quim_unidad_minima CHECK (char_length(btrim(unidad)) >= 1)
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_quim_nombre ON quimicos (lower(btrim(nombre)));
CREATE INDEX IF NOT EXISTS idx_quim_vencimiento ON quimicos (fecha_vencimiento);

CREATE TABLE IF NOT EXISTS movimientos (
  id            BIGSERIAL     PRIMARY KEY,
  tipo_elemento VARCHAR(10)   NOT NULL,                      -- 'implemento' | 'quimico'
  elemento_id   UUID          NOT NULL,
  tipo          VARCHAR(8)    NOT NULL,                      -- 'entrada' | 'salida'
  cantidad_cent INTEGER       NOT NULL,                      -- centésimas (implementos: múltiplos de 100)
  motivo        VARCHAR(200)  NOT NULL,                      -- RN-19
  fecha         DATE          NOT NULL,                      -- RN-19
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT mov_tipo_elemento_valido CHECK (tipo_elemento IN ('implemento', 'quimico')),
  CONSTRAINT mov_tipo_valido          CHECK (tipo IN ('entrada', 'salida')),
  CONSTRAINT mov_cantidad_positiva    CHECK (cantidad_cent > 0),                 -- RN-20
  CONSTRAINT mov_motivo_minimo        CHECK (char_length(btrim(motivo)) >= 1)    -- RN-19
);
CREATE INDEX IF NOT EXISTS idx_mov_elemento ON movimientos (tipo_elemento, elemento_id, fecha DESC);

CREATE TABLE IF NOT EXISTS asignaciones (          -- opcional (F7, F8)
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  trabajador_id  UUID          NOT NULL REFERENCES trabajadores(id) ON DELETE RESTRICT,
  implemento_id  UUID          NOT NULL REFERENCES implementos(id) ON DELETE RESTRICT,
  cantidad       INTEGER       NOT NULL,
  fecha          DATE          NOT NULL,
  estado         VARCHAR(10)   NOT NULL DEFAULT 'entregado',
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT asig_cantidad_positiva CHECK (cantidad > 0),
  CONSTRAINT asig_estado_valido     CHECK (estado IN ('entregado', 'devuelto'))
);
CREATE INDEX IF NOT EXISTS idx_asig_trabajador ON asignaciones (trabajador_id, estado);
CREATE INDEX IF NOT EXISTS idx_asig_implemento ON asignaciones (implemento_id);

CREATE OR REPLACE FUNCTION finca_actualizar_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_impl_updated_at ON implementos;
CREATE TRIGGER trg_impl_updated_at BEFORE UPDATE ON implementos
  FOR EACH ROW EXECUTE FUNCTION finca_actualizar_updated_at();
DROP TRIGGER IF EXISTS trg_quim_updated_at ON quimicos;
CREATE TRIGGER trg_quim_updated_at BEFORE UPDATE ON quimicos
  FOR EACH ROW EXECUTE FUNCTION finca_actualizar_updated_at();
```

Nota: la cantidad de los movimientos se guarda en centésimas (`cantidad_cent`) para unificar implementos y químicos; en implementos siempre es múltiplo de 100. Alternativamente, el movimiento de un implemento puede guardar unidades enteras; esta versión usa centésimas en toda la tabla para una sola columna y conversión uniforme.

### 9.3 M2 · Vistas y seguridad

```sql
-- M2: vistas con estado y alertas derivados, y cierre de acceso público

CREATE OR REPLACE VIEW v_implementos
WITH (security_invoker = true) AS
SELECT i.*,
  CASE WHEN i.inactivo THEN 'inactivo'
       WHEN i.disponible <= 0 THEN 'agotado'
       ELSE 'disponible' END AS estado,
  (i.disponible <= i.minima) AS inventario_bajo        -- RN-06
FROM implementos i;

CREATE OR REPLACE VIEW v_quimicos
WITH (security_invoker = true) AS
SELECT q.*,
  CASE WHEN q.inactivo THEN 'inactivo'
       WHEN q.fecha_vencimiento < CURRENT_DATE THEN 'vencido'   -- RN-14 (apoyo; el servidor usa hoyBogota)
       WHEN q.disponible_cent <= 0 THEN 'agotado'
       ELSE 'disponible' END AS estado,
  (q.disponible_cent <= q.minima_cent) AS inventario_bajo       -- RN-12
FROM quimicos q;

ALTER TABLE trabajadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quimicos     ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE asignaciones ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON trabajadores, implementos, quimicos, movimientos, asignaciones FROM anon, authenticated;
REVOKE ALL ON v_implementos, v_quimicos FROM anon, authenticated;
```

La vista usa `CURRENT_DATE` como apoyo de presentación; la clasificación oficial de vencimiento (para rechazar salidas y para las alertas) se calcula en el servidor con `hoyBogota()` y `nivelVencimiento`, para no depender de la zona del servidor de base de datos. Las tablas quedan sin políticas: todo el acceso ocurre en el servidor con la conexión directa a Postgres.

### 9.4 Traducción de errores de la base de datos

| Código Postgres | Restricción | Código de negocio |
|---|---|---|
| `23505` | `ux_trab_documento` | `DOCUMENTO_DUPLICADO` |
| `23505` | `ux_impl_nombre` | `IMPLEMENTO_DUPLICADO` |
| `23505` | `ux_quim_nombre` | `QUIMICO_DUPLICADO` |
| `23503` | llaves foráneas (`ON DELETE RESTRICT`) | `TIENE_DEPENDENCIAS` |
| `23514` | cantidades (`*_no_neg`, `mov_cantidad_positiva`) | `DATOS_INVALIDOS` |
| `23514` | cualquier otro CHECK | `DATOS_INVALIDOS` |
| Otro | | `ERROR_INTERNO` (se registra en consola, no se muestra al usuario) |

---

## 10. Arquitectura del código

### 10.1 Capas

```text
Pantallas (app/finca/*) ─────┐
                             ├──► Rutas API (app/api/finca/*) ──► lib/dataService.ts ──► lib/datos/* ──► Postgres
Componentes (components/*) ──┘          │                              │
                                        └──── lib/validacion (Zod)     └──── lib/reglas/* (funciones puras)
```

- `lib/reglas/`: reglas puras (cantidades en centésimas, inventario, alertas, vencimiento, validaciones). No importan la base, ni red, ni el reloj (salvo `fechas.ts`). Se prueban con Vitest. Las alertas y las cantidades decimales son las piezas más probadas.
- `lib/datos/`: consultas SQL y casos de uso con transacciones. Solo este directorio importa `lib/db/conexion.ts`.
- `lib/dataService.ts`: fachada única.
- Rutas API: validan con Zod, verifican sesión, llaman a `dataService`, y al devolver elementos les agregan estado y alerta con `lib/reglas/alertas.ts` y `hoyBogota()`.

### 10.2 Árbol de archivos nuevos

```text
.github/copilot-instructions.md
doc/ESTADO_ACTUAL.md
doc/DICTAMEN.md
doc/ESTADO_EJECUCION.md
doc/checkpoints/FASE_N_COMPLETADA.md

supabase/migrations/NNNN_finca_tablas.sql
supabase/migrations/NNNN_finca_vistas_seguridad.sql

scripts/migrar.mjs                 (solo si no existe mecanismo de migraciones)
scripts/verificar-bd.mjs
scripts/probar-flujo.ts
scripts/limpiar-prueba.mjs
scripts/cargar-demo.ts

lib/config/finca.ts
lib/reglas/errores.ts
lib/reglas/fechas.ts
lib/reglas/cantidades.ts
lib/reglas/trabajador.ts
lib/reglas/inventario.ts
lib/reglas/alertas.ts
lib/validacion/esquemas.ts
lib/db/conexion.ts
lib/auth/sesion.ts
lib/http/respuestas.ts
lib/formato.ts
lib/datos/tipos.ts
lib/datos/trabajadores.ts
lib/datos/implementos.ts
lib/datos/quimicos.ts
lib/datos/movimientos.ts
lib/datos/asignaciones.ts          (opcional)
lib/dataService.ts

tests/reglas/ayudas.ts
tests/reglas/cantidades.test.ts
tests/reglas/inventario.test.ts
tests/reglas/alertas.test.ts
tests/reglas/trabajador.test.ts
vitest.config.ts

app/page.tsx                                  (redirige a /finca)
app/finca/layout.tsx
app/finca/page.tsx                            (panel: existencias y alertas)
app/finca/trabajadores/page.tsx
app/finca/trabajadores/nuevo/page.tsx
app/finca/implementos/page.tsx
app/finca/implementos/nuevo/page.tsx
app/finca/quimicos/page.tsx
app/finca/quimicos/nuevo/page.tsx
app/finca/movimientos/nuevo/page.tsx
app/finca/movimientos/page.tsx                (historial, opcional)
app/finca/asignaciones/page.tsx               (opcional)

app/api/finca/sesion/route.ts
app/api/finca/trabajadores/route.ts
app/api/finca/trabajadores/[id]/route.ts
app/api/finca/implementos/route.ts
app/api/finca/implementos/[id]/route.ts
app/api/finca/quimicos/route.ts
app/api/finca/quimicos/[id]/route.ts
app/api/finca/movimientos/route.ts
app/api/finca/alertas/route.ts
app/api/finca/asignaciones/route.ts           (opcional)
app/api/finca/asignaciones/[id]/devolver/route.ts  (opcional)

components/ui/*  (Boton, Campo, Selector, Tarjeta, Insignia, Aviso, Modal, EstadoVacio)
components/finca/NavegacionFinca.tsx
components/finca/InsigniaEstado.tsx
components/finca/InsigniaAlerta.tsx
components/finca/TablaTrabajadores.tsx
components/finca/FormularioTrabajador.tsx
components/finca/TablaImplementos.tsx
components/finca/FormularioImplemento.tsx
components/finca/TablaQuimicos.tsx
components/finca/FormularioQuimico.tsx
components/finca/FormularioMovimiento.tsx
components/finca/PanelAlertas.tsx
components/finca/FormularioAsignacion.tsx     (opcional)
components/finca/TablaMovimientos.tsx         (opcional)
```

### 10.3 Responsabilidades y prohibiciones

| Regla de código | Motivo |
|---|---|
| Identificadores, comentarios y mensajes en español (RNF-01) | Coherencia con el dominio |
| Las cantidades de químicos se operan en centésimas enteras | Evita errores de redondeo (RNF-13, sección 7) |
| El estado y las alertas se calculan al leer, no se guardan | Dependen de la cantidad y de la fecha (sección 8) |
| El movimiento y la actualización de la cantidad ocurren en una transacción | RNF-04 |
| Solo `lib/datos/` importa `lib/db/conexion.ts` | Las rutas no escriben SQL |
| Las rutas solo importan datos desde `lib/dataService.ts` | Fachada única (RNF-11) |
| Las rutas `/api/finca/*` llaman `exigirSesion()` como primera instrucción | RNF-05, RNF-06 |
| Fechas como texto `YYYY-MM-DD`; "hoy" solo con `hoyBogota()` | Sección 14 |
| `params` de rutas dinámicas se obtiene con `await params` | Next.js entrega `params` como Promise |
| No modificar archivos del login salvo la redirección indicada en P03 | Sección 1.3 |

### 10.4 Configuración

```ts
// lib/config/finca.ts
export const ESTADOS_TRABAJADOR = ['activo', 'inactivo'] as const;
export const DIAS_AVISO_VENCIMIENTO = 30;      // RN-13; configurable (RNF-11)
export const CENTESIMAS = 100;                 // una unidad de químico = 100 centésimas
export const CANTIDAD_MAXIMA = 1_000_000;      // tope razonable
export const ZONA_HORARIA = 'America/Bogota';
export const LIMITE_LISTADO = 500;
```

### 10.5 Firmas de las reglas puras

```ts
// lib/reglas/errores.ts
export type CodigoError =
  | 'DATOS_INVALIDOS' | 'NO_AUTORIZADO'
  | 'DOCUMENTO_DUPLICADO' | 'IMPLEMENTO_DUPLICADO' | 'QUIMICO_DUPLICADO'
  | 'TRABAJADOR_NO_ENCONTRADO' | 'TRABAJADOR_INACTIVO'
  | 'IMPLEMENTO_NO_ENCONTRADO' | 'ELEMENTO_NO_ENCONTRADO'
  | 'CANTIDAD_INSUFICIENTE' | 'QUIMICO_VENCIDO'
  | 'ASIGNACION_NO_ENCONTRADA' | 'ASIGNACION_NO_DEVOLUCION'
  | 'TIENE_DEPENDENCIAS' | 'ERROR_INTERNO';
export const MENSAJES: Record<CodigoError, string>;     // sección 11.2
export const ESTADO_HTTP: Record<CodigoError, number>;  // sección 11.2
export class ErrorDeNegocio extends Error {
  constructor(public codigo: CodigoError, mensaje?: string, public detalles?: unknown);
}

// lib/reglas/fechas.ts
export function hoyBogota(reloj?: Date): string;                 // 'YYYY-MM-DD'
export function esFechaValida(fecha: string): boolean;
export function diasEntre(desde: string, hasta: string): number; // hasta - desde, en días
export function estaVencido(fechaVencimiento: string, hoy: string): boolean;  // < hoy

// lib/reglas/cantidades.ts
export function aCentesimas(valorDecimal: number): number;       // 2.5 → 250
export function deCentesimas(centesimas: number): number;        // 250 → 2.5
export function esEnteroNoNegativo(n: number): boolean;
export function esDecimalNoNegativo(n: number): boolean;

// lib/reglas/trabajador.ts
export type EstadoTrabajador = 'activo' | 'inactivo';
export function validarTrabajador(d: { nombre: string; documento: string; cargo: string }): void;  // RN-23
export function puedeRecibirAsignacion(estado: EstadoTrabajador): boolean;   // RN-02, RN-03

// lib/reglas/inventario.ts
export type TipoElemento = 'implemento' | 'quimico';
export type TipoMovimiento = 'entrada' | 'salida';
export function validarCantidadMovimiento(cantidad: number, tipo: TipoElemento): void;  // >0; entera si implemento (RN-09, RN-20)
export function validarMotivoYFecha(motivo: string, fecha: string): void;   // RN-19
export function nuevaCantidad(disponible: number, tipo: TipoMovimiento, cantidad: number): number;
// entrada: disponible + cantidad; salida: si cantidad > disponible lanza CANTIDAD_INSUFICIENTE, si no disponible - cantidad (RN-05/RN-11, RN-17/RN-18)

// lib/reglas/alertas.ts
export type NivelVencimiento = 'vigente' | 'proximo' | 'vencido';
export type EstadoElemento = 'disponible' | 'agotado' | 'vencido' | 'inactivo';
export function hayInventarioBajo(disponible: number, minima: number): boolean;   // RN-06, RN-12
export function nivelVencimiento(fechaVencimiento: string, hoy: string, diasAviso: number): NivelVencimiento;  // RN-13, RN-14
export function estadoElemento(d: {...}): EstadoElemento;        // sección 8; RN-14, RN-22
```

### 10.6 Firmas de `dataService`

```ts
// Sesión
obtenerSesion(): Promise<{ email: string } | null>

// Trabajadores
listarTrabajadores(f?: { estado?: EstadoTrabajador; incluirInactivos?: boolean }): Promise<Trabajador[]>
crearTrabajador(d: DatosTrabajador): Promise<{ id: string }>
actualizarTrabajador(id: string, cambios: Partial<DatosTrabajador> & { estado?: EstadoTrabajador }): Promise<void>

// Implementos
listarImplementos(f?: { soloBajos?: boolean; incluirInactivos?: boolean }): Promise<Implemento[]>
crearImplemento(d: DatosImplemento): Promise<{ id: string }>
actualizarImplemento(id: string, cambios: ...): Promise<void>

// Químicos (cantidades en decimal hacia afuera; centésimas por dentro)
listarQuimicos(f?: { soloBajos?: boolean; soloPorVencer?: boolean; incluirInactivos?: boolean }): Promise<Quimico[]>
crearQuimico(d: DatosQuimico): Promise<{ id: string }>
actualizarQuimico(id: string, cambios: ...): Promise<void>

// Movimientos
registrarMovimiento(d: DatosMovimiento): Promise<ResultadoMovimiento>    // CU-04; transacción
listarMovimientos(f?: { tipoElemento?: TipoElemento; elementoId?: string; desde?: string; hasta?: string }): Promise<Movimiento[]>  // F10

// Alertas
listarAlertas(): Promise<{ inventarioBajo: ElementoAlerta[]; porVencer: Quimico[]; vencidos: Quimico[] }>  // CU-06, CU-09

// Asignaciones (opcional, F7, F8, F11)
asignarImplemento(d: { trabajadorId: string; implementoId: string; cantidad: number }): Promise<Asignacion>
registrarDevolucion(asignacionId: string): Promise<Asignacion>
implementosDeTrabajador(trabajadorId: string): Promise<Asignacion[]>
```

Tipos (`lib/datos/tipos.ts`): `Trabajador`, `Implemento { id, nombre, categoria, disponible, minima, estado, inventarioBajo }`, `Quimico { id, nombre, categoria, disponible, minima, unidad, fechaVencimiento, estado, inventarioBajo, nivelVencimiento }` (cantidades ya en decimal), `DatosMovimiento { tipoElemento, elementoId, tipoMovimiento, cantidad, motivo, fecha }`, `ResultadoMovimiento`, `Movimiento`, `Asignacion`.

### 10.7 Conexión y transacciones

```ts
// lib/db/conexion.ts
import { Pool, types, type PoolClient } from 'pg';

types.setTypeParser(1082, (v) => v);                 // DATE → 'YYYY-MM-DD'
types.setTypeParser(1114, (v) => v);                 // TIMESTAMP → texto
types.setTypeParser(1184, (v) => v);                 // TIMESTAMPTZ → texto
types.setTypeParser(20, (v) => parseInt(v, 10));     // BIGINT (ids, COUNT) → number

const globalParaPool = globalThis as unknown as { poolFinca?: Pool };

export const pool = globalParaPool.poolFinca ?? new Pool({
  connectionString: process.env.DATABASE_URL,        // el nombre real lo confirma P00
  ssl: { rejectUnauthorized: false },
  max: 3,
  idleTimeoutMillis: 10_000,
});
if (process.env.NODE_ENV !== 'production') globalParaPool.poolFinca = pool;

export async function consultar<T>(sql: string, valores: unknown[] = []): Promise<T[]> { /* pool.query */ }
export async function conTransaccion<T>(trabajo: (tx: PoolClient) => Promise<T>): Promise<T> { /* BEGIN/COMMIT/ROLLBACK */ }
```

Las cantidades de químicos se guardan como `INTEGER` en centésimas, así que no hace falta parser para `NUMERIC`; la conversión a decimal se hace en el código con `deCentesimas`.

---

## 11. Contratos de API

### 11.1 Formato de respuesta

```json
{ "ok": true, "datos": { } }
```

```json
{ "ok": false, "error": { "codigo": "CANTIDAD_INSUFICIENTE", "mensaje": "Cantidad insuficiente en inventario.", "detalles": { "disponible": 3 } } }
```

Todas las respuestas llevan `Cache-Control: no-store`. Los mensajes son claros y en español (RNF-02).

### 11.2 Códigos de error

| Código | HTTP | Mensaje para el usuario |
|---|---|---|
| `DATOS_INVALIDOS` | 400 | Revise los datos ingresados. |
| `NO_AUTORIZADO` | 401 | Debe iniciar sesión. |
| `DOCUMENTO_DUPLICADO` | 409 | Ya existe un trabajador con ese documento. |
| `IMPLEMENTO_DUPLICADO` | 409 | Ya existe un implemento con ese nombre. |
| `QUIMICO_DUPLICADO` | 409 | Ya existe un producto químico con ese nombre. |
| `TRABAJADOR_NO_ENCONTRADO` | 404 | El trabajador no existe. |
| `TRABAJADOR_INACTIVO` | 409 | El trabajador está inactivo y no puede recibir implementos. |
| `IMPLEMENTO_NO_ENCONTRADO` | 404 | El implemento no existe. |
| `ELEMENTO_NO_ENCONTRADO` | 404 | El elemento no existe. |
| `CANTIDAD_INSUFICIENTE` | 409 | Cantidad insuficiente en inventario. |
| `QUIMICO_VENCIDO` | 409 | El producto químico está vencido y no admite salida. |
| `ASIGNACION_NO_ENCONTRADA` | 404 | La asignación no existe. |
| `ASIGNACION_NO_DEVOLUCION` | 409 | La asignación ya fue devuelta. |
| `TIENE_DEPENDENCIAS` | 409 | No se puede eliminar: tiene movimientos o asignaciones. |
| `ERROR_INTERNO` | 500 | Ocurrió un error inesperado. Intente de nuevo. |

### 11.3 Endpoints (todos requieren sesión)

| Método y ruta | Cuerpo o parámetros | Respuesta `datos` |
|---|---|---|
| `GET /api/finca/sesion` | | `{ email }` |
| `GET /api/finca/trabajadores?estado=&incluirInactivos=` | | `Trabajador[]` |
| `POST /api/finca/trabajadores` | `{ nombre, documento, cargo, telefono?, estado? }` | `{ id }` (201) |
| `PATCH /api/finca/trabajadores/[id]` | cambios | `{ actualizado: true }` |
| `GET /api/finca/implementos?soloBajos=&incluirInactivos=` | | `Implemento[]` |
| `POST /api/finca/implementos` | `{ nombre, categoria, disponible, minima }` | `{ id }` (201) |
| `PATCH /api/finca/implementos/[id]` | cambios | `{ actualizado: true }` |
| `GET /api/finca/quimicos?soloBajos=&soloPorVencer=&incluirInactivos=` | | `Quimico[]` |
| `POST /api/finca/quimicos` | `{ nombre, categoria, disponible, unidad, fechaVencimiento, minima }` | `{ id }` (201) |
| `PATCH /api/finca/quimicos/[id]` | cambios | `{ actualizado: true }` |
| `POST /api/finca/movimientos` | `{ tipoElemento, elementoId, tipoMovimiento, cantidad, motivo, fecha }` | `ResultadoMovimiento` (201) |
| `GET /api/finca/movimientos?tipoElemento=&elementoId=&desde=&hasta=` | | `Movimiento[]` (F10) |
| `GET /api/finca/alertas` | | `{ inventarioBajo, porVencer, vencidos }` |
| `POST /api/finca/asignaciones` | `{ trabajadorId, implementoId, cantidad }` | `Asignacion` (201) (F7) |
| `POST /api/finca/asignaciones/[id]/devolver` | | `Asignacion` (F8) |

Las cantidades de químicos entran y salen en decimal (litros, kilogramos); la conversión a centésimas ocurre en la capa de datos.

### 11.4 Esquemas Zod (`lib/validacion/esquemas.ts`)

| Esquema | Reglas |
|---|---|
| `esquemaTrabajador` | nombre (1 a 120), documento (1 a 40), cargo (1 a 80), telefono opcional, estado enum opcional |
| `esquemaImplemento` | nombre (1 a 120), categoria (1 a 60), disponible entero ≥ 0, minima entero ≥ 0 |
| `esquemaQuimico` | nombre, categoria, disponible decimal ≥ 0, unidad (1 a 20), fechaVencimiento (fecha), minima decimal ≥ 0 |
| `esquemaMovimiento` | tipoElemento enum, elementoId uuid, tipoMovimiento enum, cantidad > 0 (entera si implemento), motivo (1 a 200), fecha (fecha) |
| `esquemaAsignacion` | trabajadorId uuid, implementoId uuid, cantidad entero ≥ 1 |
| `esquemaFiltros` | según cada listado |

La cantidad entera para implementos, la conversión a centésimas para químicos, la suficiencia de stock y el vencimiento se resuelven en `lib/reglas/` y en el servicio; la base refuerza con CHECK.

---

## 12. Pantallas

| Ruta | Contenido |
|---|---|
| `/` | Redirige a `/finca`. |
| Layout `/finca` | Verifica la sesión; sin sesión redirige al login. Barra con "Finca Bananera", navegación (Panel, Trabajadores, Implementos, Químicos, Movimiento; Historial, Asignaciones cuando estén activos), y cerrar sesión. Diseño adaptable a computador y celular (RNF-10). |
| `/finca` · Panel | Resumen: número de trabajadores activos, implementos y químicos; `PanelAlertas` con los elementos de inventario bajo, los químicos por vencer y los vencidos. Accesos rápidos a registrar un movimiento. |
| `/finca/trabajadores` · Trabajadores | `TablaTrabajadores`: nombre, documento, cargo, teléfono, estado; filtro por estado; botón "Nuevo trabajador"; acción de activar/desactivar. |
| `/finca/trabajadores/nuevo` | `FormularioTrabajador`: nombre, documento, cargo, teléfono, estado. Documento duplicado muestra el mensaje. |
| `/finca/implementos` · Implementos | `TablaImplementos`: nombre, categoría, disponible, mínima, estado (`InsigniaEstado`), alerta de inventario bajo (`InsigniaAlerta`); filtro "solo bajos"; botón "Nuevo implemento". |
| `/finca/implementos/nuevo` | `FormularioImplemento`: nombre, categoría, cantidad inicial (entera), cantidad mínima (entera). |
| `/finca/quimicos` · Químicos | `TablaQuimicos`: nombre, categoría, disponible (con unidad), mínima, fecha de vencimiento, estado (disponible/agotado/vencido), alertas (inventario bajo, próximo a vencer, vencido). Filtros "solo bajos" y "por vencer". Botón "Nuevo químico". |
| `/finca/quimicos/nuevo` | `FormularioQuimico`: nombre, categoría, cantidad (decimal), unidad, fecha de vencimiento, cantidad mínima (decimal). |
| `/finca/movimientos/nuevo` · Registrar movimiento | `FormularioMovimiento`: tipo de elemento (implemento/químico), elemento (selector), tipo de movimiento (entrada/salida), cantidad (entera o decimal según el elemento), fecha, motivo. Rechaza salida mayor a la disponible y salida de químico vencido con su mensaje. |
| `/finca/movimientos` · Historial (opcional) | `TablaMovimientos` con filtros por elemento y rango de fechas. |
| `/finca/asignaciones` · Asignaciones (opcional) | Asignar un implemento a un trabajador activo y registrar devoluciones; ver los implementos asignados por trabajador. |

### 12.1 Textos fijos

Alerta de inventario bajo:

> {elemento}: quedan {disponible} {unidad} (mínimo {minima}).

Químico por vencer:

> {quimico} vence el {fecha} (faltan {dias} días).

---

## 13. Identidad visual

| Token | Valor | Uso |
|---|---|---|
| `--color-primario` | `#3B7D23` | Verde banano: botones principales, barra superior |
| `--color-primario-suave` | `#E8F2E0` | Fondos de selección, hover |
| `--color-disponible` | `#2F7D4F` | Estado disponible |
| `--color-bajo` | `#B7791F` | Inventario bajo, próximo a vencer |
| `--color-vencido` | `#B83232` | Vencido, agotado, errores |
| `--color-inactivo` | `#5B6770` | Inactivo |
| `--color-fondo` | `#F6F8F3` | Fondo de página |
| `--color-superficie` | `#FFFFFF` | Tarjetas, tablas |
| `--color-texto` | `#1F2933` | Texto principal |
| `--color-texto-suave` | `#52606D` | Texto secundario |
| `--color-borde` | `#DCE3D5` | Bordes y divisores |

Los tokens se agregan a `app/globals.css` sin borrar estilos existentes. Con Tailwind 4 se declaran en `@theme`; con Tailwind 3, en `tailwind.config`.

Criterios: interfaz sencilla y en español (RNF-01); adaptable a computador y celular (RNF-10); cantidades con fuente tabular; las cantidades de químicos se muestran con su unidad y los decimales que correspondan (2,5 litros); las fechas con `Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeZone: 'UTC' })` (día/mes/año claro, RNF-14); el estado y las alertas nunca se comunican solo con color (la insignia lleva texto); bordes redondeados de 8 px; sin emojis; tablas en tarjetas apiladas bajo 640 px.

---

## 14. Cantidades, fechas y zona horaria

| Regla | Implementación |
|---|---|
| Implementos | Enteros (`INTEGER`) |
| Químicos | Decimales guardados en centésimas enteras; se operan en enteros y se muestran como decimal con su unidad (sección 7, RNF-13) |
| "Hoy" (vencimiento, próximo a vencer) | Con `hoyBogota()` |
| Fechas | Texto `YYYY-MM-DD`; se muestran como día/mes/año (RNF-14) |
| Umbral de próximo a vencer | `DIAS_AVISO_VENCIMIENTO` (30), configurable (RNF-11) |
| Lectura desde BD | Parsers de `pg` devuelven texto para fechas (sección 10.7) |

Vercel corre en UTC; Colombia es UTC-5 sin horario de verano. El vencimiento y el "próximo a vencer" se calculan con `hoyBogota()` para que coincidan con el día real de la finca.

---

## 15. Seguridad e integridad

| Medida | Detalle |
|---|---|
| Acceso solo con sesión (RNF-06) | Login como puerta y `exigirSesion()` en cada ruta de `/api/finca` |
| Solo el encargado modifica (RNF-05) | Los trabajadores no son usuarios; no hay acceso para ellos |
| Base de datos cerrada al público | RLS activo sin políticas y permisos revocados a `anon` y `authenticated` |
| Movimiento atómico (RNF-04) | El movimiento y la actualización de la cantidad ocurren en una transacción con el elemento bloqueado; si uno falla, ninguno se aplica |
| Sin estados inconsistentes (RNF-03) | CHECK de cantidades no negativas, documento único, movimientos con fecha y motivo |
| Estado y alertas derivados | Se calculan al leer; no hay un campo que pueda contradecir la cantidad o la fecha |
| Precisión decimal (RNF-13) | Químicos en centésimas enteras; sin errores de redondeo visibles |
| Datos no se eliminan | Trabajadores, implementos y químicos se desactivan; los movimientos quedan en el historial |
| Validación en tres puntos | Formulario (Zod y reglas), API (Zod y reglas) y base (CHECK, UNIQUE, llaves foráneas) |
| SQL parametrizado | Ningún valor se concatena |
| Trazabilidad (RNF-12) | Cada movimiento guarda elemento, tipo, cantidad, fecha y motivo |
| Errores internos | Se registran con `console.error`; el usuario recibe `ERROR_INTERNO` sin detalles técnicos |

---

## 16. Pruebas

### 16.1 Pruebas unitarias de reglas (Vitest)

Fecha de referencia: `hoy = '2026-06-15'`, aviso 30 días. Las cantidades decimales y las alertas son el centro.

| ID | Función | Entrada | Resultado esperado |
|---|---|---|---|
| T-01 | `aCentesimas` | 2.5 | 250 |
| T-02 | `aCentesimas` | 1.5 | 150 |
| T-03 | `deCentesimas` | 250 | 2.5 |
| T-04 | centésimas: 2.5 − 1.5 | aCentesimas(2.5) − aCentesimas(1.5), luego deCentesimas | 1.0 exacto |
| T-05 | centésimas: 2.5 − 1.5 − 1.0 | encadenado en centésimas | 0 exacto |
| T-06 | `nuevaCantidad` | disponible 10, entrada, 5 | 15 |
| T-07 | `nuevaCantidad` | disponible 10, salida, 4 | 6 |
| T-08 | `nuevaCantidad` | disponible 10, salida, 10 | 0 |
| T-09 | `nuevaCantidad` | disponible 10, salida, 11 | `CANTIDAD_INSUFICIENTE` |
| T-10 | `validarCantidadMovimiento` | 0, implemento | `DATOS_INVALIDOS` |
| T-11 | `validarCantidadMovimiento` | −1, quimico | `DATOS_INVALIDOS` |
| T-12 | `validarCantidadMovimiento` | 2.5, implemento | `DATOS_INVALIDOS` (implemento es entero) |
| T-13 | `validarCantidadMovimiento` | 2.5, quimico | sin error |
| T-14 | `validarMotivoYFecha` | motivo " ", fecha válida | `DATOS_INVALIDOS` |
| T-15 | `validarMotivoYFecha` | motivo "Uso", fecha "2026-13-01" | `DATOS_INVALIDOS` |
| T-16 | `hayInventarioBajo` | disponible 6, mínima 5 | `false` |
| T-17 | `hayInventarioBajo` | disponible 5, mínima 5 | `true` (igualdad, RN-06) |
| T-18 | `hayInventarioBajo` | disponible 4, mínima 5 | `true` |
| T-19 | `hayInventarioBajo` | disponible 0, mínima 0 | `true` |
| T-20 | `nivelVencimiento` | "2026-07-20" | vigente (35 días) |
| T-21 | `nivelVencimiento` | "2026-07-15" | proximo (30 días exactos, RN-13) |
| T-22 | `nivelVencimiento` | "2026-06-16" | proximo (1 día) |
| T-23 | `nivelVencimiento` | "2026-06-15" | proximo (hoy) |
| T-24 | `nivelVencimiento` | "2026-06-14" | vencido (RN-14) |
| T-25 | `estaVencido` | "2026-06-14", hoy | `true` |
| T-26 | `estaVencido` | "2026-06-15", hoy | `false` |
| T-27 | `estadoElemento` | implemento, disponible 0 | agotado (RN-22) |
| T-28 | `estadoElemento` | implemento, disponible 3 | disponible |
| T-29 | `estadoElemento` | químico vencido | vencido |
| T-30 | `estadoElemento` | inactivo true | inactivo |
| T-31 | `puedeRecibirAsignacion` | 'activo' | `true` |
| T-32 | `puedeRecibirAsignacion` | 'inactivo' | `false` (RN-03) |
| T-33 | `validarTrabajador` | documento " " | `DATOS_INVALIDOS` |
| T-34 | `validarTrabajador` | datos válidos | sin error |

Comando: `npm test`. Las 34 pruebas deben pasar antes de continuar con la fase 3.

### 16.2 Prueba de flujo contra la base de datos

`scripts/probar-flujo.ts` (`npm run probar:flujo`) usa `dataService` con nombres `Prueba *`. Imprime `OK` o `FALLA` por paso y limpia al final.

| Paso | Operación | Esperado |
|---|---|---|
| 1 | Crear trabajador "Prueba Juan" (documento PT-1) | Creado, activo |
| 2 | Crear otro con el mismo documento | `DOCUMENTO_DUPLICADO` |
| 3 | Crear implemento "Prueba Guantes" (disponible 10, mínima 5) | Creado |
| 4 | Crear químico "Prueba Fungicida" (2.5 litros, mínima 1.0, vence hoy+40) | Creado, disponible |
| 5 | Salida de 4 guantes (motivo "uso", fecha hoy) | Disponible 6; sin alerta |
| 6 | Salida de 1 guante más | Disponible 5; alerta de inventario bajo (igualdad) |
| 7 | Salida de 10 guantes | `CANTIDAD_INSUFICIENTE`; disponible sigue 5 |
| 8 | Salida de 1.5 litros del fungicida | Disponible 1.0 litro (sin error de redondeo) |
| 9 | Salida de 1.5 litros más (excede) | `CANTIDAD_INSUFICIENTE` |
| 10 | Movimiento con cantidad 0 | `DATOS_INVALIDOS` |
| 11 | Movimiento sin motivo | `DATOS_INVALIDOS` |
| 12 | Crear químico "Prueba Vencido" (vence hoy−1) | Creado, estado vencido |
| 13 | Salida del químico vencido | `QUIMICO_VENCIDO` |
| 14 | Crear químico "Prueba PorVencer" (vence hoy+30) | Aparece en la lista de próximos a vencer |
| 15 | Listar alertas | Guantes en inventario bajo; PorVencer y Vencido en sus listas |

### 16.3 Aceptación (criterio de terminado)

Se ejecuta en el despliegue de Vercel y se documenta en `doc/ACEPTACION.md`.

| ID | Acción | Resultado esperado |
|---|---|---|
| A-01 | Abrir `/finca` sin sesión | Redirección al login |
| A-02 | Registrar el trabajador "Juan" (documento 123) | Aparece en Trabajadores |
| A-03 | Intentar otro trabajador con documento 123 | Rechazo por duplicado |
| A-04 | Registrar el implemento "Guantes" (10 unidades, mínima 5) | Aparece con 10 disponibles |
| A-05 | Registrar el químico "Fungicida" (2,5 litros, mínima 1, vence en 40 días) | Aparece con 2,5 litros, disponible |
| A-06 | Registrar una salida de 5 guantes | Disponible 5; se activa la alerta de inventario bajo |
| A-07 | Intentar una salida de 10 guantes | Rechazo por cantidad insuficiente |
| A-08 | Registrar una salida de 1,5 litros de fungicida | Disponible 1,0 litro, sin error de redondeo |
| A-09 | Intentar un movimiento con cantidad 0 o sin motivo | Rechazo con mensaje claro |
| A-10 | Registrar un químico vencido e intentar una salida | Se marca vencido y la salida se rechaza |
| A-11 | Registrar un químico que vence en 30 días | Aparece como próximo a vencer |
| A-12 | Ver el panel de alertas | Lista los de inventario bajo, por vencer y vencidos |
| A-13 | Consultar existencias de implementos y químicos | Muestra cantidades, unidades y estados |
| A-14 | Cerrar el navegador y volver a entrar | Los datos persisten (RNF-07) |
| A-15 | (Opcional) Asignar guantes a un trabajador activo | Descuenta del inventario; queda asignado |
| A-16 | (Opcional) Intentar asignar a un trabajador inactivo | Rechazo |
| A-17 | (Opcional) Registrar la devolución | Suma la cantidad de nuevo al inventario |
| A-18 | (Opcional) Ver el historial de movimientos | Lista con fecha, elemento, cantidad y motivo |

A-15 a A-18 corresponden a las opcionales; se verifican tras P09.

---

## 17. Plan de ejecución

| Fase | Prompt | Resultado | Cierre |
|---|---|---|---|
| 0 · Conciliación | P00 | `ESTADO_ACTUAL.md`, `DICTAMEN.md`, `copilot-instructions.md`, `ESTADO_EJECUCION.md`; estado de compilación | `FASE_0_COMPLETADA.md` |
| 1 · Base de datos | P01 | M1 y M2 aplicadas; `npm run db:verificar` sin fallas | `FASE_1_COMPLETADA.md` |
| 2 · Reglas | P02 | `lib/config`, `lib/reglas` (cantidades y alertas), 34 pruebas en verde | `FASE_2_COMPLETADA.md` |
| 3 · Servidor | P03 | Conexión, sesión, respuestas, esquemas, formato; sesión protegida | `FASE_3_COMPLETADA.md` |
| 4 · Datos y API | P04, P05 | `lib/datos/*`, `dataService`, rutas; `npm run probar:flujo` sin fallas | `FASE_4_COMPLETADA.md` |
| 5 · Interfaz | P06, P07, P08 | Componentes base, trabajadores, implementos, químicos, movimientos, alertas | `FASE_5_COMPLETADA.md` |
| 6 · Aceptación | (en P08) | `ACEPTACION.md` con A-01 a A-14; README | `FASE_6_COMPLETADA.md` |
| 7 · Opcionales | P09 | Asignaciones, devoluciones, alertas de vencimiento, historial, reportes | `FASE_7_COMPLETADA.md` |

Condiciones entre fases: no se inicia una fase sin el archivo de cierre de la anterior; `npm run build` sin errores al final de cada prompt; `npm test` en verde desde P02; cada prompt termina con commit y push, y un fallo de despliegue en Vercel se corrige antes del siguiente prompt.

---

## 18. Funcionalidades opcionales

Se construyen solo con la fase 6 cerrada.

| Prompt | Funcionalidad | Implementación |
|---|---|---|
| P09 | F7 · Asignar implementos | `asignarImplemento`: trabajador activo (puedeRecibirAsignacion, RN-02/RN-03); cantidad suficiente (RN-07); descuenta del inventario en transacción; registra la asignación `entregado`. Ruta y pantalla de asignaciones |
| P09 | F8 · Devoluciones | `registrarDevolucion`: la asignación debe estar `entregado` (si no, `ASIGNACION_NO_DEVOLUCION`); la marca `devuelto` y suma la cantidad al inventario (RN-08) |
| P09 | F9 · Alertas de vencimiento | `listarQuimicos({ soloPorVencer })` y el panel: químicos con `nivelVencimiento` proximo o vencido (RN-13, RN-14) |
| P09 | F10 · Historial de movimientos | `listarMovimientos` con filtros; pantalla con tipo, elemento, cantidad, fecha y motivo (RNF-12) |
| P09 | F11 · Implementos por trabajador | `implementosDeTrabajador`: asignaciones `entregado` de un trabajador (CU-11) |
| P09 | F12 · Filtros y reportes | Filtros por estado, categoría y cargo; un reporte de inventario (CU-12) |

Para los opcionales se agrega la migración M3 si hiciera falta (la tabla `asignaciones` ya está en M1).

---

## 19. Glosario

| Término | Definición |
|---|---|
| Trabajador | Persona de la finca; recibe implementos si está activo |
| Implemento | Herramienta o equipo de trabajo, en cantidades enteras |
| Químico | Producto químico, en cantidades decimales, con fecha de vencimiento |
| Movimiento | Entrada o salida de inventario, con cantidad, fecha y motivo |
| Asignación | Entrega de un implemento a un trabajador (opcional) |
| Inventario bajo | Cantidad disponible menor o igual a la mínima |
| Próximo a vencer | Químico con 30 días o menos para su vencimiento |
| Vencido | Químico cuya fecha de vencimiento ya pasó |
| Centésimas | Unidad entera interna para los químicos (una unidad = 100), para evitar errores de redondeo |
| Estado derivado | disponible / agotado / vencido, calculado de la cantidad y la fecha, no guardado |
| Regla pura | Función de `lib/reglas/` que solo depende de sus parámetros |
| Transacción | Conjunto de escrituras que se confirma completo o se revierte completo |
| Copilot en modo Agente | Modo de GitHub Copilot Chat que lee el repositorio, edita varios archivos y ejecuta comandos de terminal con aprobación |
