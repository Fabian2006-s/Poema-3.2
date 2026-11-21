# Dictamen de conciliación

> Actualización P11: el contenido siguiente registra el dictamen histórico de P00. Los módulos base de finca indicados como inexistentes ya se implementaron; P11 agrega los módulos operativos que se listan abajo. La migración 004 fue aplicada y verificada en Postgres.

P00 auditó el repositorio y ejecutó la compilación inicial. El proyecto ya tiene una base Next.js, estilos Tailwind, autenticación y pruebas; no tiene aún el módulo de la finca ni conexión a la base desde código.

| Pieza o funcionalidad | Estado | Qué hacer | Detalle |
|---|---|---|---|
| Next.js + TypeScript | EXISTE Y SIRVE | USAR | Next 16.3.5 y TypeScript 5.9.3; conservar `src/app/`. |
| Tailwind CSS | EXISTE Y SIRVE | USAR | Tailwind 4.3.3; agregar los tokens de finca sin reemplazar estilos actuales. |
| Conexión Supabase/Postgres | EXISTE Y SIRVE | ADAPTAR | La app admite `POEMA32_POSTGRES_PRISMA_URL` o `POSTGRES_PRISMA_URL` (pooler 6543); las herramientas locales admiten las variables directas terminadas en `URL_NON_POOLING` (5432). |
| Login | EXISTE Y SIRVE | ADAPTAR | Conservar login y sesión firmada; usuarios y restablecimientos persistidos en Postgres desde M3, sin Upstash. |
| Migraciones | EXISTE Y SIRVE | USAR | M1 y M2 están aplicadas; `db:migrar` y `db:verificar` pasan en P01. |
| F1 · Trabajadores | NO EXISTE | CREAR | Reglas/datos en P02/P04, API en P05 e interfaz en P06. |
| F2 · Implementos | NO EXISTE | CREAR | Reglas/datos en P02/P04, API en P05 e interfaz en P07. |
| F3 · Productos químicos | NO EXISTE | CREAR | Cantidades en centésimas y alertas en P02/P04; API en P05 e interfaz en P07. |
| F4 · Movimientos | NO EXISTE | CREAR | Reglas en P02, servicio transaccional en P04, API en P05 e interfaz en P08. |
| F5 · Existencias | NO EXISTE | CREAR | Consultas en P04 y presentación en P07/P08. |
| F6 · Alertas de inventario bajo | NO EXISTE | CREAR | Cálculo en P02 y presentación en P06/P08. |

## Resumen

- Usar el proyecto, Tailwind, login, Vitest y alias de imports existentes.
- Adaptar la conexión con `pg`; la aplicación usa `POEMA32_POSTGRES_PRISMA_URL` o `POSTGRES_PRISMA_URL` (pooler, puerto 6543), y los scripts locales usan la variable terminada en `URL_NON_POOLING` (puerto 5432).
- Mantener usuarios y restablecimientos en Supabase Postgres; no usar Upstash.
- Las migraciones ya están creadas y aplicadas. Crear las funcionalidades de finca en las fases correspondientes.
- Next.js 16 usa `src/proxy.ts` para la protección de rutas.

## Ampliación P11

| Funcionalidad | Decisión | Implementación |
|---|---|---|
| Parcelas y producción por racimos/cajas | CREAR | Módulos operativos bajo `/finca/gestion/` |
| Riego y consumo estimado de agua | CREAR | Registro por parcela, minutos y m³ |
| Asistencia de trabajadores | CREAR | Novedad y minutos por jornada; sin nómina |
| Maquinaria y mantenimiento | CREAR | Equipos, lecturas, servicio y costos |
| Empaque y ventas | CREAR | Cajas/rechazos, parcela, cliente y valor COP |
| Gastos | CREAR | Categoría, descripción y valor COP |
| Materiales de empaque | CREAR | Catálogo, alertas de mínimo y movimientos transaccionales |

## Qué necesita conseguir el estudiante

Las variables pooler y directa ya están en `.env.local`; no hace falta volver a copiarlas ni compartir sus valores. P01 conectó usando `POEMA32_POSTGRES_URL_NON_POOLING`; la URL pooler agotó el tiempo desde este entorno. El build y las pruebas de integridad de base de datos pasan.
