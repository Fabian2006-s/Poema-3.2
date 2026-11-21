# Estado actual del repositorio

Auditoría inicial P00, actualizada con el estado de P11. La información histórica de P00 se conserva en las secciones que describen el punto de partida; el estado vigente se resume aquí y en la sección 9.

> P11 añade módulos de parcelas, producción, riego, asistencia, maquinaria, empaque, ventas, gastos y materiales de empaque. La migración `004_gestion_integral_finca.sql` está aplicada en Postgres y verificada; los módulos aún no tienen registros operativos.

## 1. Proyecto y versiones

Existe un proyecto Next.js con TypeScript:

- Next.js: 16.3.5
- React / React DOM: 19.2.8
- TypeScript: 5.9.3 instalado (`^5` en `package.json`)
- Tailwind CSS: 4.3.3 instalado (`^4` en `package.json`)
- El App Router está bajo `src/app/`.

## 2. Scripts disponibles

Los scripts incluyen `dev`, `build`, `start`, `lint`, `format`, `type-check`, `test`, migraciones y verificación de BD.

## 3. Estructura (hasta tres niveles)

```text
src/
  app/
    api/
      auth/
      correo/
      health/
    dashboard/
    login/
    prueba-correo/
    recuperar-contrasena/
    restablecer-contrasena/
  components/
    home/
  lib/
    auth/
  test/
scripts/
data/
doc/
```

La aplicación usa `src/`, con módulos bajo `src/app/finca/`, API protegida en `src/app/api/finca/`, componentes en `src/components/finca/` y `src/components/ui/`, acceso a datos en `src/lib/datos/`, reglas en `src/lib/reglas/` y migraciones en `supabase/migrations/`.

## 4. Dependencias relevantes

| Paquete | Estado |
|---|---|
| `pg` | FALTA |
| `@types/pg` | FALTA |
| `zod` | Presente |
| `@supabase/supabase-js` | FALTA |
| `vitest` | Presente |

## 5. Autenticación

Hay login en `/login` (`src/app/login/page.tsx`) y `POST /api/auth/login`. Las credenciales se verifican con hashes scrypt en `src/lib/auth/users.ts`; en producción los usuarios se guardan en `usuarios_login` de Postgres y, en desarrollo local, en `data/users.json`. La sesión usa una cookie firmada `poema_session`; `getAuthenticatedEmail()` en `src/lib/auth/session.ts` obtiene el correo de la sesión. Al iniciar sesión, la interfaz entra a `/finca`. También existen logout y recuperación de contraseña; en producción los tokens y límites de recuperación se guardan en Postgres.

## 6. Base de datos y variables

`.env.local` contiene nombres de variables de conexión de Postgres pooler y variables de Supabase. Se verificaron los puertos sin mostrar ni guardar sus valores:

- `POEMA32_POSTGRES_PRISMA_URL` o `POSTGRES_PRISMA_URL`: pooler, puerto 6543.
- `POEMA32_POSTGRES_URL_NON_POOLING` o `POSTGRES_URL_NON_POOLING`: conexión directa, puerto 5432.

La aplicación en serverless usa la variable de pooler disponible; los scripts locales de migración/verificación prefieren la variable directa (5432). Las URLs contienen `sslmode=require`; se quita ese parámetro antes de crear el pool para que `pg` respete la configuración TLS explícita. M1, M2 y M3 están aplicadas.

## 7. Datos existentes

Las cuentas del login y los restablecimientos usan Postgres en producción, y archivos locales durante el desarrollo. Los datos de finca también persisten en Postgres.

## 8. Migraciones

P01 creó `supabase/migrations/001_finca_base.sql`, `002_finca_vistas_seguridad.sql`, `scripts/migrar.mjs` y `scripts/verificar-bd.mjs`. M3 (`003_autenticacion_postgres.sql`) agrega usuarios y recuperación de contraseña; P11 agrega `004_gestion_integral_finca.sql`. Las cuatro migraciones están aplicadas.

## 9. Dominio de la finca

| Funcionalidad | Estado actual |
|---|---|
| Trabajadores y asignaciones | Implementado |
| Inventario de implementos y químicos | Implementado |
| Movimientos y alertas de inventario | Implementado |
| Parcelas, producción y riego | Implementados; migración 004 aplicada |
| Asistencia de trabajadores | Implementada; migración 004 aplicada |
| Maquinaria y mantenimientos | Implementados; migración 004 aplicada |
| Empaque, ventas y gastos | Implementados; migración 004 aplicada |
| Materiales y movimientos de empaque | Implementados; migración 004 aplicada |

## 10. Estilos

Tailwind CSS 4 está configurado mediante `@tailwindcss/postcss`; `src/app/globals.css` importa `tailwindcss` y define los tokens visuales de la finca. Hay fuente Inter en el layout y componentes compartidos en `src/components/ui/`.

## 11. Pruebas

Vitest 5 está configurado en `vitest.config.ts`. Hay pruebas para autenticación, recuperación de contraseña, reglas de finca, validación operativa, `dataService` y salud de API.

## 12. Posibles conflictos

- Las afirmaciones de inexistencia en la auditoría P00 son históricas; los módulos base de finca ya están implementados.
- La migración `004_gestion_integral_finca.sql` está aplicada; la verificación de tablas, RLS e integridad terminó sin fallas.

## 13. Decisiones derivadas

| Decisión | Resultado |
|---|---|
| Base del proyecto | Usar el Next.js existente |
| Login | Reutilizar y envolver el login existente |
| Ruta de login | `/login` |
| Protección en Next.js 16 | `src/proxy.ts` |
| Migraciones | Crear scripts Node en P01 |
| Variable Postgres | `POEMA32_POSTGRES_PRISMA_URL` (pooler, puerto 6543) |
| M1 | `001_finca_base.sql` |
| M2 | `002_finca_vistas_seguridad.sql` |
| Prefijo de imports | `@/lib/...` |
| App Router | `src/app/` |

## 14. Compilación de base

Se instalaron las dependencias porque `node_modules/` no existía. `npm run build` finalizó correctamente con Next.js 16.3.5. Next emitió dos advertencias de trazado por acceso dinámico al sistema de archivos en `src/lib/auth/users.ts` y `src/lib/dataService.ts`; no impidieron la compilación. La instalación reportó 51 alertas de auditoría de dependencias (24 moderadas, 25 altas y 2 críticas); no se ejecutó una actualización automática.
