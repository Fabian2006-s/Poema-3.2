# Estado de ejecución

| Prompt | Estado | Evidencia |
|---|---|---|
| P00 | Completado | `ESTADO_ACTUAL.md`, `DICTAMEN.md`, instrucciones Copilot y checkpoint de fase 0; `npm run build` correcto. |
| P01 | Completado | M1/M2 aplicadas; `db:verificar`: 0 fallas; build correcto. |
| P02 | Completado | 34 pruebas de reglas; suite total: 47 pruebas; build correcto. |
| P03 | Completado | Build y pruebas pasan; sin sesión API 401 y `/finca` redirige; login existente inicia sesión y endpoint protegido responde 200. |
| P04 | Completado | `probar:flujo`: 15 OK, 0 fallas; `db:demo` cargó los registros; build y pruebas pasan. |
| P05 | Completado | Rutas protegidas verificadas; sin sesión 401; con sesión: creación, duplicado, alerta, decimal químico y rechazos 409; build, 47 pruebas y `db:verificar` correctos. |
| P06 | Completado | Panel, navegación, componentes UI y gestión de trabajadores; creación, duplicado y desactivación verificados con sesión; vista móvil sin desbordamiento; build y 49 pruebas correctos. |
| P07 | Completado | Inventario de implementos y químicos implementado; creado implemento y químico de 2,5 litros, duplicados rechazados, alertas/filtros revisados en móvil; build, 49 pruebas y `db:verificar` correctos. |
| P08 | Completado | Formulario de movimientos, `doc/ACEPTACION.md`, README y checkpoints de fases 5–6; build, 50 pruebas y flujo de 15 casos correctos. |
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

### P05 · 2026-11-07 · Completado

- Agregadas rutas protegidas para trabajadores, implementos, químicos, movimientos y alertas; las rutas dinámicas permiten actualizar trabajadores, implementos y químicos.
- Sin sesión: `GET /api/finca/implementos` y `POST /api/finca/movimientos` respondieron 401.
- Con sesión local: creación de trabajador, implemento y químico; documento duplicado rechazado con 409; salida de implemento activó alerta; salida química decimal de 1,5 litros dejó saldo 3,5; excedente y químico vencido rechazados con 409.
- Los registros temporales de API se limpiaron por identificadores/nombres únicos; se conservaron los datos demo. `db:verificar`: 0 fallas.
- `npm run build`, `npm test` (47 pruebas) y ESLint enfocado: correctos. El build mantiene dos advertencias preexistentes de trazado dinámico del sistema de archivos.
- Los pushes anteriores siguen rechazados por GitHub con 403; los commits se conservan localmente.

### P06 · 2026-11-07 · Completado

- Agregados tokens de Tailwind 4 y componentes reutilizables para botones, campos, selectores, tarjetas, insignias, avisos, modal y estado vacío.
- Agregados layout protegido de `/finca`, navegación con menú adaptable, panel con conteos y alertas, y páginas de consulta/creación de trabajadores.
- Verificado localmente con sesión: panel mostró 2 trabajadores, 2 implementos y 3 químicos; se creó un trabajador, el documento duplicado mostró el error esperado y se desactivó el trabajador de prueba.
- Revisión móvil: tarjetas bajo 640 px; el menú móvil evita desbordamiento a 375 y 640 px. Se ajustó el punto de quiebre del menú para evitar desbordamiento en tablet.
- Se corrigió el formato de cantidades químicas para recibir los decimales que devuelve la capa de datos; pruebas de formato incluidas.
- Los datos temporales P06 se eliminaron puntualmente; se conservaron los datos demo. `db:verificar`: 0 fallas.
- `npm run build`, `npm test` (11 archivos, 49 pruebas) y ESLint enfocado: correctos. El build conserva dos advertencias preexistentes de trazado dinámico.
- Los pushes continúan bloqueados por GitHub con 403.

### P07 · 2026-11-07 · Completado

- Agregadas tablas adaptables y formularios para implementos enteros y químicos con cantidades decimales, unidad y fecha de vencimiento.
- Verificado con sesión: implemento entero creado; duplicado mostró `IMPLEMENTO_DUPLICADO`. Químico de 2,5 litros creado y presentado como `2,5 litros`; duplicado mostró `QUIMICO_DUPLICADO`.
- Se comprobaron los datos demo: implemento con inventario bajo, químico próximo a vencer y químico vencido. El filtro de bajos mostró solo el elemento correspondiente y el filtro de vencimiento mostró los químicos próximos.
- Vista móvil: tarjetas de inventario y sin desbordamiento horizontal a 375 px.
- Los registros temporales P07 se eliminaron por prefijo único; los datos demo se conservaron. `db:verificar`: 0 fallas.
- `npm run build`, `npm test` (11 archivos, 49 pruebas) y ESLint enfocado: correctos. Continúan dos advertencias preexistentes del build.
- El push sigue rechazado por GitHub con 403.

### P08 · 2026-11-07 · Completado

- Agregado `FormularioMovimiento` y `/finca/movimientos/nuevo`: selector de implemento o químico activo, entrada o salida, cantidad, fecha y motivo; validación en vivo y presentación del saldo actualizado, estado y alerta de inventario bajo.
- Verificado localmente con sesión: validación de cantidad fraccionaria para implementos; salida de 2 unidades dejó 3 y activó el aviso de inventario bajo; salida química de 1,5 litros dejó 1 litro; exceso y salida de químico vencido recibieron los mensajes de rechazo esperados. La fecha se presenta en formato `DD/MM/AAAA`.
- La vista se comprobó a 375 px sin desbordamiento horizontal. Las tablas de inventario y el panel existentes ya muestran cantidades, unidades, estados y alertas.
- La auditoría confirmó cantidades químicas decimales con almacenamiento en centésimas, cálculos derivados de estados/alertas, movimientos atómicos, validación de cantidad/motivo/fecha, rutas protegidas y consultas parametrizadas.
- Se centralizaron `hoyBogota` y `sumarDias` en `src/lib/reglas/fechas.ts`. Se agregó la limpieza `--prueba` y se cambió `probar:flujo` para conservar los registros demo.
- `npm test`: 11 archivos, 50 pruebas correctas. `npm run probar:flujo`: 15 casos correctos, 0 fallas. `npm run db:verificar`: 0 fallas; se conservaron 2 trabajadores, 2 implementos, 3 químicos y 2 movimientos demo.
- `.env.local` está ignorado por Git y el escaneo de archivos versionados no encontró asignaciones con valores de variables de entorno.
- Actualizados `README.md`, `doc/ACEPTACION.md` y los checkpoints `FASE_5_COMPLETADA.md` y `FASE_6_COMPLETADA.md`. A-01 a A-14 quedan para validación en Vercel; A-15 a A-18 son opcionales de P09.
- `npm run build`: correcto; permanecen dos advertencias preexistentes de trazado dinámico del sistema de archivos. Se intentará el push después del commit local.
