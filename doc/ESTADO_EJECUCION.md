# Estado de ejecución

| Prompt | Estado | Evidencia |
|---|---|---|
| P00 | Completado | `ESTADO_ACTUAL.md`, `DICTAMEN.md`, instrucciones Copilot y checkpoint de fase 0; `npm run build` correcto. |
| P01 | Completado | M1/M2 aplicadas; `db:verificar`: 0 fallas; build correcto. |
| P02 | Completado | 34 pruebas de reglas; suite total: 47 pruebas; build correcto. |
| P03 | Completado | Build y pruebas pasan; sin sesión API 401 y `/finca` redirige; login existente inicia sesión y endpoint protegido responde 200. |
| P04 | Completado | `probar:flujo`: 15 OK, 0 fallas; `db:demo` cargó los registros; build y pruebas pasan. |
| P05 | Pendiente | — |
| P06 | Pendiente | — |
| P07 | Pendiente | — |
| P08 | Pendiente | — |
| P09 | Pendiente | — |

## Bitácora

### P00 · 2026-11-07

- Se normalizaron los documentos a `doc/PLAN_FINCA.md` y `doc/PROMPTS_FINCA.md`.
- Auditoría: Next.js 16.3.5, React 19.2.8, TypeScript 5.9.3, Tailwind 4.3.3; login y Vitest existentes; sin módulo de finca ni migraciones.
- `.env.local` contiene `POEMA32_POSTGRES_PRISMA_URL` y `POEMA32_POSTGRES_URL` (pooler 6543) y `POEMA32_POSTGRES_URL_NON_POOLING` (5432). No se registraron valores.
- Se instaló el conjunto de dependencias porque faltaba `node_modules/`. `npm run build`: correcto; 2 advertencias preexistentes de trazado dinámico. `npm install` reportó 51 alertas de auditoría.

### P01 · 2026-11-07 · Completado

- Agregados `pg`, `@types/pg`, M1/M2, `db:migrar` y `db:verificar`.
- Se corrigió el uso de `sslmode=require`: los scripts quitan ese parámetro para respetar la configuración TLS explícita de `pg`.
- Los scripts locales de administración usan la URL directa puerto 5432, que conectó correctamente; la app conservará la URL pooler puerto 6543.
- `npm run db:migrar`: aplicó `001_finca_base.sql` y `002_finca_vistas_seguridad.sql`.
- `npm run db:verificar`: tablas, vistas, índices/restricciones, RLS activos en las cinco tablas; casos a-h OK; transacción revertida; 0 fallas.
- `npm run build`: correcto. `npm test` de línea base: 6 archivos y 13 pruebas pasaron.
- `git push` permanece rechazado por GitHub con 403; los commits se conservan localmente.

### P02 · 2026-11-07 · Completado

- Agregadas reglas puras para cantidades, fechas, trabajadores, movimientos, estados y alertas.
- Se amplió la inclusión de Vitest para ejecutar `tests/**/*.test.ts`, conservando las pruebas previas.
- Las pruebas T-01 a T-34 pasan; suite total: 10 archivos y 47 pruebas.
- `npm run build`: correcto; permanecen dos advertencias preexistentes de trazado dinámico del sistema de archivos.
- `npx eslint src/lib/config/finca.ts src/lib/reglas tests/reglas vitest.config.ts`: correcto.

### P03 · 2026-11-07 · Completado

- Agregadas conexión Postgres de aplicación, adaptador de sesión para el login existente, middleware `src/proxy.ts`, respuestas de API, esquemas Zod, formato y endpoint de sesión.
- El login existente y la página raíz conducen ahora a `/finca`; Proxy hace la comprobación optimista de cookie y las rutas verifican la sesión firmada.
- Pruebas locales sin sesión: `GET /api/finca/sesion` devuelve 401 con `Cache-Control: no-store`; `GET /finca` redirige a `/login`.
- Prueba local con el login de desarrollo: login 200 y `/api/finca/sesion` 200.
- `npm run build`, `npm test` (47 pruebas) y ESLint enfocado: correctos.

### P04 · 2026-11-07 · Completado (fase 4 sigue abierta hasta P05)

- Agregadas consultas y casos de uso para trabajadores, implementos, químicos, movimientos y alertas; `dataService` conserva la persistencia previa de recuperación de contraseñas y añade la fachada de finca.
- La app usa el pooler en producción; en local usa la URL directa si está configurada. La selección de conexión es diferida hasta la primera consulta.
- `npm run probar:flujo`: 15 pasos OK, 0 fallas; incluye alerta en igualdad, resta decimal exacta, excedentes y rechazo de químico vencido. Los datos de prueba se limpiaron al inicio y al final.
- `npm run db:demo`: completado; dejó registros demostrativos para las siguientes fases.
- `npm run build`, `npm test` (47 pruebas) y ESLint enfocado: correctos.
