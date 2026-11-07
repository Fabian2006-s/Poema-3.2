# Dictamen de conciliación

P00 auditó el repositorio y ejecutó la compilación inicial. El proyecto ya tiene una base Next.js, estilos Tailwind, autenticación y pruebas; no tiene aún el módulo de la finca ni conexión a la base desde código.

| Pieza o funcionalidad | Estado | Qué hacer | Detalle |
|---|---|---|---|
| Next.js + TypeScript | EXISTE Y SIRVE | USAR | Next 16.3.5 y TypeScript 5.9.3; conservar `src/app/`. |
| Tailwind CSS | EXISTE Y SIRVE | USAR | Tailwind 4.3.3; agregar los tokens de finca sin reemplazar estilos actuales. |
| Conexión Supabase/Postgres | EXISTE Y SIRVE | ADAPTAR | La app usa `POEMA32_POSTGRES_PRISMA_URL` (pooler 6543); las herramientas locales usan `POEMA32_POSTGRES_URL_NON_POOLING` (5432), ya que la conexión directa funcionó y el pooler agotó el tiempo en este entorno. |
| Login | EXISTE Y SIRVE | USAR | Conservar login y sesión firmada actuales; envolverlos en P03 y proteger `/finca/*` y `/api/finca/*`. |
| Migraciones | EXISTE Y SIRVE | USAR | M1 y M2 están aplicadas; `db:migrar` y `db:verificar` pasan en P01. |
| F1 · Trabajadores | NO EXISTE | CREAR | Reglas/datos en P02/P04, API en P05 e interfaz en P06. |
| F2 · Implementos | NO EXISTE | CREAR | Reglas/datos en P02/P04, API en P05 e interfaz en P07. |
| F3 · Productos químicos | NO EXISTE | CREAR | Cantidades en centésimas y alertas en P02/P04; API en P05 e interfaz en P07. |
| F4 · Movimientos | NO EXISTE | CREAR | Reglas en P02, servicio transaccional en P04, API en P05 e interfaz en P08. |
| F5 · Existencias | NO EXISTE | CREAR | Consultas en P04 y presentación en P07/P08. |
| F6 · Alertas de inventario bajo | NO EXISTE | CREAR | Cálculo en P02 y presentación en P06/P08. |

## Resumen

- Usar el proyecto, Tailwind, login, Vitest y alias de imports existentes.
- Adaptar la conexión con `pg`; la aplicación usa `POEMA32_POSTGRES_PRISMA_URL` (pooler, puerto 6543) y los scripts de administración local usan `POEMA32_POSTGRES_URL_NON_POOLING` (puerto 5432).
- Las migraciones ya están creadas y aplicadas. Crear las funcionalidades de finca en las fases correspondientes.
- Next.js 16 usa `src/proxy.ts` para la protección de rutas.

## Qué necesita conseguir el estudiante

Las variables pooler y directa ya están en `.env.local`; no hace falta volver a copiarlas ni compartir sus valores. P01 conectó usando `POEMA32_POSTGRES_URL_NON_POOLING`; la URL pooler agotó el tiempo desde este entorno. El build y las pruebas de integridad de base de datos pasan.
