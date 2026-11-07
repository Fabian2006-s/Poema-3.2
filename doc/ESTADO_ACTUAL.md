# Estado actual del repositorio

Auditoría inicial P00. No se modificaron archivos de código.

## 1. Proyecto y versiones

Existe un proyecto Next.js con TypeScript:

- Next.js: 16.3.5
- React / React DOM: 19.2.8
- TypeScript: 5.9.3 instalado (`^5` en `package.json`)
- Tailwind CSS: 4.3.3 instalado (`^4` en `package.json`)
- El App Router está bajo `src/app/`.

## 2. Scripts disponibles

`dev`, `build`, `start`, `lint`, `format`, `type-check`, `test`, `test:watch` y `test:coverage`. Todavía no existen scripts para migraciones, verificación de BD o datos demo.

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

La aplicación usa `src/`. No existen `src/app/finca/`, `src/app/api/finca/`, `src/components/ui/`, `src/lib/datos/`, `src/lib/reglas/` ni `supabase/`.

## 4. Dependencias relevantes

| Paquete | Estado |
|---|---|
| `pg` | FALTA |
| `@types/pg` | FALTA |
| `zod` | Presente |
| `@supabase/supabase-js` | FALTA |
| `vitest` | Presente |

## 5. Autenticación

Hay login en `/login` (`src/app/login/page.tsx`) y `POST /api/auth/login`. Las credenciales se verifican con hashes scrypt en `src/lib/auth/users.ts`; los usuarios se guardan en Upstash Redis si está configurado, o en `data/users.json` en desarrollo. La sesión usa una cookie firmada `poema_session`; `getAuthenticatedEmail()` en `src/lib/auth/session.ts` obtiene el correo de la sesión. Al iniciar sesión, la interfaz redirige a `/dashboard`. También existen logout y recuperación de contraseña. No hay protección ni rutas `/finca`; P03 debe envolver la sesión existente y proteger las rutas nuevas sin reemplazar el login.

## 6. Base de datos y variables

`.env.local` contiene nombres de variables de conexión de Postgres pooler y variables de Supabase. Se verificaron los puertos sin mostrar ni guardar sus valores:

- `POEMA32_POSTGRES_PRISMA_URL`: pooler, puerto 6543.
- `POEMA32_POSTGRES_URL`: pooler, puerto 6543.
- `POEMA32_POSTGRES_URL_NON_POOLING`: conexión directa, puerto 5432.

La aplicación en serverless usará `POEMA32_POSTGRES_PRISMA_URL` (pooler). Los scripts locales de migración/verificación usan `POEMA32_POSTGRES_URL_NON_POOLING` (5432), porque en este entorno los URLs pooler agotaron el tiempo mientras el endpoint directo conectó correctamente. Las URLs contienen `sslmode=require`; se quita ese parámetro antes de crear el pool para que `pg` respete la configuración TLS explícita. M1 y M2 se aplicaron y verificaron correctamente en P01.

## 7. Datos existentes

Hay almacenamiento para las cuentas del login (Redis o archivo local) y para recuperación de contraseña. No hay datos de finca ni persistencia de trabajadores, implementos, químicos o movimientos.

## 8. Migraciones

P01 creó `supabase/migrations/001_finca_base.sql`, `002_finca_vistas_seguridad.sql`, `scripts/migrar.mjs` y `scripts/verificar-bd.mjs`. Ambas migraciones fueron aplicadas; las tablas, vistas, restricciones, RLS y pruebas de integridad se verificaron sin fallas.

## 9. Dominio de la finca

| Funcionalidad | Estado actual |
|---|---|
| Trabajadores | No existe |
| Implementos | No existe |
| Productos químicos | No existe |
| Movimientos de inventario | No existe |
| Asignaciones | No existe |

## 10. Estilos

Tailwind CSS 4 está configurado mediante `@tailwindcss/postcss`; `src/app/globals.css` importa `tailwindcss` y define variables de fondo oscuro, gradientes y acentos. Hay fuente Inter en el layout. No existen tokens ni estilos de la finca.

## 11. Pruebas

Vitest 5 está configurado en `vitest.config.ts`. Hay pruebas para autenticación, recuperación de contraseña, `dataService` y salud de API. No hay pruebas de reglas o del dominio de finca.

## 12. Posibles conflictos

- `src/app/finca/`: no existe.
- `src/app/api/finca/`: no existe.
- `src/lib/dataService.ts`: existe para recuperación de contraseña; no implementa datos de finca y debe conservarse/adaptarse sin duplicar nombre de módulo.
- `src/components/ui/`: no existe.
- `src/app/page.tsx`: muestra el componente de login; no redirige a `/finca`.
- Tablas `trabajadores`, `implementos`, `quimicos`, `movimientos` y `asignaciones`: no existen ni hay migraciones.

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
