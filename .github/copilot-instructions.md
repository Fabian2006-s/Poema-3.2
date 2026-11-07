# Finca Bananera · Instrucciones para Copilot

## Documentos rectores

- Plan técnico: `doc/PLAN_FINCA.md`. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: `doc/ESTADO_ACTUAL.md`.
- Dictamen de conciliación: `doc/DICTAMEN.md`. Antes de crear algo, revisa si dice USAR (ya existe).
- Avance: `doc/ESTADO_EJECUCION.md`.

## Stack objetivo

- Next.js App Router + TypeScript + Tailwind CSS. Despliegue en Vercel.
- Postgres de Supabase con el paquete `pg` y la variable `POEMA32_POSTGRES_PRISMA_URL` (pooler, puerto 6543); `pg` falta al iniciar.
- Validación con Zod. Pruebas con Vitest.
- Login existente en `/login`, reutilizado como puerta única, sin roles. Solo el encargado accede; los trabajadores no son usuarios.

## Lo más importante del dominio

- Implementos: cantidades enteras. Químicos: cantidades decimales guardadas como entero en CENTÉSIMAS (una unidad = 100), para evitar errores de redondeo; se convierten a decimal solo al mostrar.
- Inventario bajo: disponible <= mínima (incluye igualdad exacta).
- Químico próximo a vencer: faltan 30 días o menos (30 exactos incluido); vencido si la fecha ya pasó; un químico vencido no admite salida.
- El estado (disponible/agotado/vencido) y las alertas se CALCULAN al leer, con la cantidad y la fecha de hoy; no se guardan.
- Un movimiento y la actualización de la cantidad ocurren en una transacción; si uno falla, ninguno se aplica.

## Convenciones

- Identificadores, comentarios, mensajes y textos de interfaz en español.
- Reglas de negocio solo en `src/lib/reglas/`: funciones puras, sin `pg`, sin red, sin variables de entorno y sin reloj (excepto `fechas.ts`). Se prueban con Vitest.
- Solo `src/lib/datos/` importa `src/lib/db/conexion.ts`. Rutas y páginas importan datos únicamente desde `src/lib/dataService.ts`.
- Toda ruta en `src/app/api/finca/` llama `await exigirSesion()` como primera instrucción.
- Fechas `YYYY-MM-DD` como texto entre capas. Zona horaria `America/Bogota`; "hoy" solo con `hoyBogota()`.
- En rutas dinámicas `params` es una Promise: `const { id } = await params`.
- SQL siempre con parámetros. Nunca concatenar valores.
- Trabajadores, implementos y químicos se desactivan, no se eliminan. Los movimientos no se editan.
- No instalar librerías de componentes (shadcn, MUI u otras). Usar `src/components/ui/`.
- Prefijo de imports para lib: `@/lib/...`. Archivo de protección: `src/proxy.ts`. Ruta de login: `/login`.

## Al terminar cada tarea

1. `npm run build` sin errores.
2. `npm test` sin fallas (desde que exista Vitest).
3. Actualizar `doc/ESTADO_EJECUCION.md`.
4. Hacer commit/push solo cuando el usuario lo solicite explícitamente.
