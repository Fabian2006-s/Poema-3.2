# Finca Bananera · Prompts para GitHub Copilot

> Plan de referencia: `doc/PLAN_FINCA.md`
> Herramienta: GitHub Copilot Chat en modo Agente (VS Code)
> Punto de partida: por confirmar en P00 (el primer prompt averigua qué hay montado)

---

## El primer prompt concilia

El primer prompt (P00) audita el repositorio (proyecto Next, Supabase, login) y escribe un dictamen de qué usar, qué adaptar y qué crear. Los prompts siguientes leen ese dictamen. Lee `doc/DICTAMEN.md` después de P00: ahí sabrás qué te falta conseguir (por ejemplo, la conexión a Supabase) antes de seguir.

## Cómo ejecutar estos prompts

1. Crear la carpeta `doc/` en la raíz del repositorio (si no existe) y copiar allí `PLAN_FINCA.md` y `PROMPTS_FINCA.md`.
2. Abrir el proyecto en VS Code y abrir Copilot Chat. En el selector de modo elegir **Agent**. En el selector de modelo elegir el más capaz disponible.
3. Cada prompt se ejecuta en una **conversación nueva** (botón `+` del chat).
4. Copiar el bloque gris completo del prompt, pegarlo en el chat y enviarlo. No hay datos que reemplazar.
5. Cuando Copilot pida permiso para ejecutar un comando en la terminal, leerlo y aceptarlo.
6. Al terminar cada prompt: revisar los cambios y aceptarlos (**Keep**); hacer la verificación indicada; hacer commit con el mensaje sugerido y `git push`. Vercel desplegará; si falla, usar el prompt de despliegue fallido antes de continuar.
7. No saltar prompts. Si algo falla, usar el prompt de corrección del final.

| Fase | Prompts |
|---|---|
| 0 · Conciliación | P00 |
| 1 · Base de datos | P01 |
| 2 · Reglas de negocio | P02 |
| 3 · Servidor | P03 |
| 4 · Datos y API | P04, P05 |
| 5 · Interfaz | P06, P07, P08 |
| 7 · Opcionales | P09 |

---

## P00 · Conciliación: qué hay, qué falta, qué se crea

**Fase:** 0 · **Modifica código:** no · **Crea:** `doc/ESTADO_ACTUAL.md`, `doc/DICTAMEN.md`, `.github/copilot-instructions.md`, `doc/ESTADO_EJECUCION.md`, `doc/checkpoints/FASE_0_COMPLETADA.md`

````text
Actúa como ingeniero de software senior trabajando en modo agente sobre este repositorio.

Contexto: el proyecto "Finca Bananera" (control de trabajadores, implementos, productos químicos e inventario de una finca) se construye sobre el stack del curso (Next.js + TypeScript + Tailwind + Supabase + Vercel). NO se da por hecho que la infraestructura esté montada. Este prompt NO implementa funcionalidades: audita lo que exista y produce un dictamen. El plan técnico está en doc/PLAN_FINCA.md.

Lee completo doc/PLAN_FINCA.md, en especial las secciones 0, 1, 2, 3, 5, 7 y 17.

TAREA 1. Crea doc/ESTADO_ACTUAL.md con una radiografía fiel. No supongas: revisa el repositorio. Secciones:
1. ¿Hay un proyecto Next.js con TypeScript? Versión de next, react, typescript, tailwindcss; si no hay package.json o no es Next, dilo claramente.
2. Scripts de package.json.
3. Estructura: árbol de app/, lib/, components/, supabase/, scripts/ hasta 3 niveles; indica si usa src/.
4. Dependencias relevantes presentes o ausentes: pg, zod, @supabase/supabase-js, vitest. Marca cuáles FALTAN.
5. Autenticación: ¿hay login? Si lo hay, archivos, mecanismo, función de sesión, ruta de login, a dónde redirige. Si NO hay, indícalo (se agrega en P03).
6. Base de datos: ¿hay proyecto Supabase conectado y una variable de conexión directa a Postgres en .env.local? (solo NOMBRES). Si no, indícalo.
7. Dónde viven los datos hoy, si hay algo.
8. Migraciones: ¿mecanismo? Si no, se crea.
9. Qué del dominio ya está construido: trabajadores, implementos, químicos, movimientos. Estado de cada uno.
10. Estilos: versión de Tailwind, globals.css, tokens, fuentes.
11. Pruebas: framework (Vitest u otro) y pruebas existentes.
12. Conflictos: existencia previa de app/finca, app/api/finca, lib/dataService, components/ui; contenido de app/page.tsx; tablas trabajadores/implementos/quimicos/movimientos.
13. Decisiones derivadas: ¿hay base Next o hay que crear el proyecto?; ruta de login (existe o se agrega); archivo de protección (proxy.ts en Next 16, middleware.ts antes); mecanismo de migraciones; nombre de la variable de conexión a Postgres; nombres de M1 y M2; prefijo de imports; dónde está app/.
14. Compilación de base: resultado de npm run build (TAREA 4).

TAREA 2. Crea doc/DICTAMEN.md: para cada pieza de INFRAESTRUCTURA (proyecto Next/TS, Tailwind, conexión Supabase/Postgres, login, migraciones) y cada funcionalidad del módulo mínimo (F1 trabajadores, F2 implementos, F3 químicos, F4 movimientos, F5 existencias, F6 alertas), di su estado y qué hacer:

```markdown
## [Pieza o funcionalidad]
- Estado: EXISTE Y SIRVE | EXISTE PARCIAL | NO EXISTE
- Qué hacer: USAR | ADAPTAR | CREAR
- Detalle: [qué exactamente, en qué prompt]
```

Si algo EXISTE Y SIRVE, se USA; si EXISTE PARCIAL, se ADAPTA; si NO EXISTE, se CREA. Incluye una tabla resumen y una lista de "qué necesita conseguir el estudiante" (crear el proyecto Supabase, copiar la cadena de conexión), con pasos sencillos.

TAREA 3. Crea .github/copilot-instructions.md reemplazando [AJUSTAR] con lo hallado:

```markdown
# Finca Bananera · Instrucciones para Copilot

## Documentos rectores
- Plan técnico: doc/PLAN_FINCA.md. Si una instrucción contradice el plan, prevalece el plan.
- Estado real del repositorio: doc/ESTADO_ACTUAL.md.
- Dictamen de conciliación: doc/DICTAMEN.md. Antes de crear algo, revisa si dice USAR (ya existe).
- Avance: doc/ESTADO_EJECUCION.md.

## Stack objetivo
- Next.js App Router + TypeScript + Tailwind CSS. Despliegue en Vercel.
- Postgres de Supabase con el paquete pg y la variable [AJUSTAR: conexión]. (pg [AJUSTAR: está / falta].)
- Validación con Zod. Pruebas con Vitest.
- Login: [AJUSTAR: existe / se agrega en P03] como puerta única, sin roles. Solo el encargado accede; los trabajadores no son usuarios.

## Lo más importante del dominio
- Implementos: cantidades enteras. Químicos: cantidades decimales guardadas como entero en CENTÉSIMAS (una unidad = 100), para evitar errores de redondeo; se convierten a decimal solo al mostrar.
- Inventario bajo: disponible <= mínima (incluye igualdad exacta).
- Químico próximo a vencer: faltan 30 días o menos (30 exactos incluido); vencido si la fecha ya pasó; un químico vencido no admite salida.
- El estado (disponible/agotado/vencido) y las alertas se CALCULAN al leer, con la cantidad y la fecha de hoy; no se guardan.
- Un movimiento y la actualización de la cantidad ocurren en una transacción; si uno falla, ninguno se aplica.

## Convenciones
- Identificadores, comentarios, mensajes y textos de interfaz en español.
- Reglas de negocio solo en lib/reglas/: funciones puras, sin pg, sin red, sin variables de entorno y sin reloj (excepto fechas.ts). Se prueban con Vitest.
- Solo lib/datos/ importa lib/db/conexion.ts. Rutas y páginas importan datos únicamente desde lib/dataService.ts.
- Toda ruta en app/api/finca/ llama await exigirSesion() como primera instrucción.
- Fechas 'YYYY-MM-DD' como texto entre capas. Zona horaria America/Bogota; "hoy" solo con hoyBogota().
- En rutas dinámicas params es una Promise: const { id } = await params.
- SQL siempre con parámetros. Nunca concatenar valores.
- Trabajadores, implementos y químicos se desactivan, no se eliminan. Los movimientos no se editan.
- No instalar librerías de componentes (shadcn, MUI u otras). Usar components/ui/.
- Prefijo de imports para lib: [AJUSTAR]. Archivo de protección: [AJUSTAR]. Ruta de login: [AJUSTAR].

## Al terminar cada tarea
1. npm run build sin errores.
2. npm test sin fallas (desde que exista Vitest).
3. Actualizar doc/ESTADO_EJECUCION.md.
4. No hacer commit: el estudiante revisa y hace el commit.
```

TAREA 4. Si hay proyecto Next y falta node_modules, ejecuta npm install y luego npm run build; registra el resultado en la sección 14 de ESTADO_ACTUAL.md. Si no hay proyecto o falla, NO lo arregles: descríbelo y dilo en el dictamen.

TAREA 5. Crea doc/ESTADO_EJECUCION.md con la tabla de prompts (P00 a P09) en estado pendiente y una sección de bitácora.

TAREA 6. Revisa .env.local y dime qué variable de conexión a Postgres hay (yo mismo la copié desde Vercel). Confírmame su nombre exacto (puede ser DATABASE_URL, POSTGRES_URL, POSTGRES_PRISMA_URL u otro) y cuál debe usar lib/db/conexion.ts: la del pooler (puerto 6543), que es la adecuada para `pg` en serverless; si hay una de puerto 5432 (non-pooling), no es esa. Si en .env.local no hay ninguna, avísame para pegarla (la copio desde Vercel como siempre) antes de P01. No hace falta nada más: solo confírmame el nombre.

RESTRICCIONES: no modifiques código, configuración ni dependencias. Solo creas los archivos de este prompt.

AL TERMINAR:
- Crea doc/checkpoints/FASE_0_COMPLETADA.md con: estado de la infraestructura, resumen del dictamen y qué necesita conseguir el estudiante.
- Marca P00 en ESTADO_EJECUCION.md.
- Muéstrame el dictamen resumido y qué me falta conseguir antes de seguir con P01.
````

**Verificación del estudiante:** leer `doc/DICTAMEN.md`. Dice qué ya tienes, qué falta y qué se va a crear, y al final qué debes conseguir (por ejemplo, la conexión a Supabase) antes de P01.

**Commit sugerido:** `docs: conciliación y dictamen de la Finca Bananera`

---

## P01 · Base de datos del módulo

**Fase:** 1 · **Crea o usa:** dependencia `pg`, migraciones M1 y M2, `scripts/verificar-bd.mjs`, `scripts/migrar.mjs`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 4, 5, 7, 9 y 15), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Si el dictamen dice que falta la conexión a Postgres, detente y avísame.

OBJETIVO: crear las tablas en Supabase Postgres y dejar un script que demuestre que la base protege las reglas (documento único, cantidades no negativas, movimiento con cantidad > 0 y motivo, estados válidos).

TAREA 1. Si falta pg, agrégalo (y @types/pg).

TAREA 2. Crea en supabase/migrations/ dos archivos con los nombres de la sección 13 de ESTADO_ACTUAL.md:
- M1 (tablas trabajadores, implementos, quimicos, movimientos, asignaciones) con el SQL exacto de la sección 9.2 del plan.
- M2 (vistas v_implementos, v_quimicos y seguridad) con el SQL exacto de la sección 9.3.
No cambies nombres, columnas ni restricciones: el código depende de ellos (sección 9.4). Nota: los químicos guardan la cantidad en centésimas (disponible_cent, minima_cent).

TAREA 3. Aplica las migraciones con el mecanismo existente o creando scripts/migrar.mjs (patrón estándar: variable de conexión, tabla _migrations, orden alfabético, transacción, aplicada/omitida, código 1 si falla) y "db:migrar". Ejecútalo.

TAREA 4. Crea scripts/verificar-bd.mjs y "db:verificar". Debe imprimir:
1. Existencia de trabajadores, implementos, quimicos, movimientos, asignaciones y las vistas v_implementos, v_quimicos.
2. Número de filas de cada tabla.
3. Restricciones e índices: ux_trab_documento, ux_impl_nombre, ux_quim_nombre, impl_disp_no_neg, quim_disp_no_neg, mov_cantidad_positiva, mov_motivo_minimo.
4. Si RLS está activo en las cinco tablas.
5. Pruebas de integridad en UNA transacción que SIEMPRE termina en ROLLBACK, con SAVEPOINT antes de cada caso que debe fallar:
   a) Crear trabajador "Verif Juan" (documento VD-1): funciona; crear otro con documento VD-1: 23505 (ux_trab_documento).
   b) Crear implemento con disponible −1: 23514 (impl_disp_no_neg).
   c) Crear químico con disponible_cent −1: 23514.
   d) Insertar un movimiento con cantidad_cent 0: 23514 (mov_cantidad_positiva).
   e) Insertar un movimiento con motivo vacío: 23514 (mov_motivo_minimo).
   f) Insertar un movimiento con tipo_elemento 'vehiculo': 23514.
   g) Crear trabajador con estado 'suspendido': 23514 (trab_estado_valido).
   h) Insertar implemento "Verif Guantes" (disponible 5, minima 5) y comprobar que v_implementos lo marca inventario_bajo = true.
   Imprime OK o FALLA por caso.
6. Total de fallas; código 1 si hubo alguna.

Ejecuta npm run db:verificar y copia la salida en la bitácora.

RESTRICCIONES: no modifiques el login ni app/. No crees tablas distintas a las del plan.

AL TERMINAR:
- npm run build sin errores.
- Crea doc/checkpoints/FASE_1_COMPLETADA.md con la salida de db:verificar.
- Marca P01 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** en Supabase aparecen `trabajadores`, `implementos`, `quimicos`, `movimientos`, `asignaciones`. La salida de `npm run db:verificar` no tiene FALLA; el caso h confirma la alerta de inventario bajo con igualdad.

**Commit sugerido:** `feat(bd): tablas, vistas y restricciones de la finca`

---

## P02 · Reglas de negocio y pruebas unitarias

**Fase:** 2 · **Crea:** `lib/config/finca.ts`, `lib/reglas/*`, `tests/reglas/*`, `vitest.config.ts`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 4, 5, 7, 8, 10, 11.2 y 16.1), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: implementar las reglas puras y probarlas con Vitest. El núcleo es la aritmética decimal de químicos (centésimas) y las alertas (inventario bajo, vencimiento).

TAREA 1. Si falta Vitest, instálalo y configúralo (environment node, include ['tests/**/*.test.ts'], alias de tsconfig). Si ya hay Vitest, respétalo.

TAREA 2. Crea lib/config/finca.ts con el contenido de la sección 10.4 (DIAS_AVISO_VENCIMIENTO 30, CENTESIMAS 100, topes, zona horaria).

TAREA 3. Crea lib/reglas/ con las firmas de la sección 10.5:
- errores.ts: CodigoError; MENSAJES y ESTADO_HTTP (tabla 11.2); clase ErrorDeNegocio.
- fechas.ts: hoyBogota; esFechaValida; diasEntre(desde, hasta) (con Date.UTC); estaVencido(fecha, hoy) (fecha < hoy).
- cantidades.ts: aCentesimas(valorDecimal) (Math.round(valor*100)); deCentesimas(cent) (cent/100); esEnteroNoNegativo; esDecimalNoNegativo.
- trabajador.ts: EstadoTrabajador; validarTrabajador (nombre, documento, cargo no vacíos, RN-23); puedeRecibirAsignacion(estado) (solo 'activo', RN-02/RN-03).
- inventario.ts: TipoElemento; TipoMovimiento; validarCantidadMovimiento(cantidad, tipo) (> 0; entera si implemento, RN-09/RN-20; decimal si químico, RN-16); validarMotivoYFecha(motivo, fecha) (motivo no vacío, fecha válida, RN-19); nuevaCantidad(disponible, tipo, cantidad) (entrada suma; salida: si cantidad > disponible lanza CANTIDAD_INSUFICIENTE, si no resta; RN-05/RN-11, RN-17/RN-18).
- alertas.ts: hayInventarioBajo(disponible, minima) (disponible <= minima, RN-06/RN-12); NivelVencimiento; nivelVencimiento(fecha, hoy, diasAviso) (dias<0 vencido; dias<=diasAviso proximo; si no vigente; RN-13/RN-14); EstadoElemento; estadoElemento(d) (sección 8: inactivo; químico vencido; disponible<=0 agotado; si no disponible).

Ninguna regla importa pg, red, next ni process.env, ni llama new Date() (excepto el parámetro por defecto de hoyBogota).

TAREA 4. Crea tests/reglas/ayudas.ts con esperarCodigo(fn, codigo). Crea las pruebas (cantidades, inventario, alertas, trabajador) cubriendo T-01 a T-34 de la sección 16.1, con hoy = '2026-06-15'. Cada caso con su ID. Lo crítico: T-04/T-05 (2.5 − 1.5 = 1.0 exacto en centésimas); T-17 (disponible 5, mínima 5 → bajo); T-21 (30 días exactos → proximo); T-24 (vencido); T-12 (2.5 en implemento → inválido).

TAREA 5. Ejecuta npm test hasta que pasen las 34. Si una falla, corrige la regla, no la prueba, salvo que contradiga el plan; explícalo.

RESTRICCIONES: no toques app/, el login ni la base de datos.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_2_COMPLETADA.md con la salida de npm test.
- Marca P02 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** `npm test` (34 pruebas). Abrir `lib/reglas/cantidades.ts` y comprobar que 2,5 − 1,5 da 1,0 exacto; y `lib/reglas/alertas.ts`, que la igualdad con la mínima alerta y que 30 días exactos es próximo a vencer.

**Commit sugerido:** `feat(reglas): cantidades decimales, inventario y alertas con 34 pruebas`

---

## P03 · Infraestructura del servidor

**Fase:** 3 · **Crea:** conexión, sesión (login como puerta), respuestas, esquemas, formato · **Modifica:** protección de rutas

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 1.3, 3, 9.4, 10, 11.1, 11.2, 11.4, 14 y 15), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: la infraestructura del servidor y el acceso.

TAREA 1. lib/db/conexion.ts como la sección 10.7 (con los parsers). Usa el nombre real de la variable de conexión.

TAREA 2. Login y sesión:
- Si el dictamen dice que hay login: crea lib/auth/sesion.ts que lo envuelve (obtenerSesion, exigirSesion) sin reescribirlo.
- Si NO hay login: agrega uno mínimo como puerta (página /login con contraseña de acceso en variable de entorno y cookie de sesión firmada; el mecanismo más simple y seguro que encaje con la versión de Next). Documenta la decisión. Sin roles (solo el encargado).
- exigirSesion() lanza ErrorDeNegocio('NO_AUTORIZADO') si no hay sesión.

TAREA 3. Protección de rutas (proxy.ts en Next 16, o el archivo del dictamen): protege /finca/:path* y /api/finca/:path*. Sin sesión: páginas a /login; API 401 con el formato de la sección 11.1.

TAREA 4. Tras iniciar sesión, redirige a /finca. app/page.tsx redirige a /finca (o a /login si no hay sesión).

TAREA 5. lib/http/respuestas.ts: responderOk; responderError (ErrorDeNegocio → ESTADO_HTTP; ZodError → 400 DATOS_INVALIDOS con flatten; pg 23505/23503/23514 → tabla 9.4 por error.constraint; otro → console.error y 500 ERROR_INTERNO); conManejoDeErrores; leerCuerpo. Todas con Cache-Control: no-store. Mensajes claros en español (RNF-02).

TAREA 6. lib/validacion/esquemas.ts con los esquemas de la sección 11.4, con tipos z.infer. No importa nada del servidor.

TAREA 7. lib/formato.ts: formatearCantidadQuimico (recibe centésimas, muestra decimal con unidad); formatearFecha (Intl es-CO, dateStyle medium, timeZone UTC, día/mes/año, RNF-14).

TAREA 8. app/api/finca/sesion/route.ts: GET con conManejoDeErrores; primera instrucción await exigirSesion(); responde { email }. export const dynamic = 'force-dynamic'.

VERIFICACIÓN: npm run build y npm test. Inicia npm run dev; sin sesión, la ruta de sesión da 401 y /finca redirige al login. Inicia sesión y comprueba que llega a /finca.

AL TERMINAR:
- Crea doc/checkpoints/FASE_3_COMPLETADA.md con los resultados y la decisión de login.
- Marca P03 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** sin sesión, `/finca` redirige al login; con sesión, entra.

**Commit sugerido:** `feat(servidor): conexión, login de acceso y utilidades de API`

---

## P04 · Datos: trabajadores, implementos, químicos y movimientos

**Fase:** 4 (primera parte) · **Crea:** `lib/datos/*`, `lib/dataService.ts`, scripts de prueba y demo

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 5, 6, 6.1, 7, 8, 9, 10.5, 10.6 y 16.2), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Revisa lib/reglas/, lib/db/conexion.ts y lib/validacion/esquemas.ts.

OBJETIVO: la capa de datos y los casos de uso contra Postgres, con transacciones, y comprobar el flujo. Lo crítico: el movimiento atómico, la aritmética en centésimas de químicos, y el estado/alertas derivados.

TAREA 1. lib/datos/tipos.ts con los tipos de la sección 10.6. Las cantidades de químicos se exponen en decimal hacia afuera; por dentro se operan en centésimas.

TAREA 2. lib/datos/trabajadores.ts: listarTrabajadores({ estado, incluirInactivos }); crearTrabajador(d) (validarTrabajador; DOCUMENTO_DUPLICADO si choca); actualizarTrabajador(id, cambios); obtenerTrabajadorActivo(tx, id) (interna).

TAREA 3. lib/datos/implementos.ts y lib/datos/quimicos.ts:
- implementos: listarImplementos({ soloBajos, incluirInactivos }) desde v_implementos con estadoElemento; crearImplemento(d); actualizarImplemento(id, cambios). Cantidades enteras.
- quimicos: listarQuimicos({ soloBajos, soloPorVencer, incluirInactivos }) desde v_quimicos, calculando nivelVencimiento con hoyBogota() y convirtiendo centésimas a decimal; crearQuimico(d) (convierte disponible y minima a centésimas con aCentesimas); actualizarQuimico(id, cambios).

TAREA 4. lib/datos/movimientos.ts:
- registrarMovimiento(d): secuencia EXACTA de la sección 6.1 dentro de conTransaccion (validarCantidadMovimiento; validarMotivoYFecha; bloquear el elemento, ELEMENTO_NO_ENCONTRADO si no existe o está inactivo; si es salida de químico vencido, QUIMICO_VENCIDO; nuevaCantidad, CANTIDAD_INSUFICIENTE si una salida excede; actualizar la cantidad —en centésimas si es químico— e insertar el movimiento; RNF-04 atómico). Devuelve el elemento con su estado y alerta recalculados.
- listarMovimientos({ tipoElemento, elementoId, desde, hasta }) (F10).

TAREA 5. lib/datos/alertas: listarAlertas(): inventario bajo (implementos y químicos con disponible <= mínima), químicos por vencer (nivelVencimiento proximo) y vencidos. Reexporta en dataService.

TAREA 6. lib/datos/asignaciones.ts: créalo preparado para los opcionales (F7, F8, F11); en el mínimo no se usa.

TAREA 7. lib/dataService.ts como fachada: reexporta las funciones públicas y los tipos. Verifica que ningún archivo fuera de lib/datos importe lib/db/conexion.ts, y que las cantidades de químicos se conviertan en la frontera (decimal afuera, centésimas adentro).

TAREA 8. scripts/limpiar-prueba.mjs ("db:limpiar") y scripts/cargar-demo.ts ("db:demo"): demo con trabajadores, implementos (alguno bajo umbral), químicos (uno por vencer, uno vencido, uno normal) y algunos movimientos. Limpia los demo antes. Ejecútalo.

TAREA 9. Instala tsx si falta. scripts/probar-flujo.ts ("probar:flujo") con los 15 pasos de la sección 16.2 usando solo dataService. Imprime OK/FALLA por paso; los que esperan error verifican el código; limpia antes y en finally; cierra el pool; código 1 si hay fallas. CRÍTICO: el paso 6 comprueba la alerta de inventario bajo con igualdad; el 8 que 2.5 − 1.5 da 1.0 exacto; el 13 que un químico vencido no admite salida; el 7/9 que una salida que excede se rechaza. Ejecuta y corrige hasta 0 fallas.

RESTRICCIONES: no romper el login ni las pruebas. No dupliques lógica (vive en lib/reglas/).

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P04 en ESTADO_EJECUCION.md y agrega la salida de probar:flujo y db:demo en la bitácora. La fase 4 sigue abierta hasta P05.
- Muéstrame un resumen.
````

**Verificación del estudiante:** `npm run probar:flujo` (15 OK, 0 fallas). El paso 8 confirma la resta decimal exacta y el 13 que un químico vencido no sale.

**Commit sugerido:** `feat(datos): trabajadores, inventario con decimales y movimientos atómicos`

---

## P05 · API

**Fase:** 4 (cierre) · **Crea:** rutas de `app/api/finca/`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 11.1 a 11.4), doc/ESTADO_EJECUCION.md, lib/dataService.ts, lib/http/respuestas.ts, lib/validacion/esquemas.ts y lib/auth/sesion.ts.

OBJETIVO: exponer las operaciones del módulo mínimo con rutas protegidas.

TAREA 1. Crea las rutas del módulo mínimo de la tabla 11.3 (deja asignaciones para P09). Reglas de cada handler:
- Primera instrucción: await exigirSesion().
- conManejoDeErrores; cuerpos con leerCuerpo y los esquemas de 11.4; filtros validados.
- [id] con await params.
- export const dynamic = 'force-dynamic'.
- POST de crear responden 201; el movimiento responde 201.
- Las cantidades de químicos entran y salen en decimal; la conversión a centésimas la hace la capa de datos.

TAREA 2. Verificación sin sesión: con npm run dev, GET /api/finca/implementos y POST /api/finca/movimientos deben dar 401.

TAREA 3. Verificación con sesión: pídeme que inicie sesión. Crea un trabajador (comprueba documento duplicado), un implemento y un químico; registra una salida de implemento que active la alerta de inventario bajo; registra una salida decimal de químico (1,5 litros) y verifica la cantidad; intenta una salida que exceda (409) y una salida de un químico vencido (409). Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_4_COMPLETADA.md con probar:flujo (P04) y las verificaciones.
- Marca P05 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** las rutas dan 401 sin sesión; con sesión, registrar un movimiento de químico en decimal funciona y una salida que excede o de un vencido se rechazan.

**Commit sugerido:** `feat(api): rutas de trabajadores, inventario y movimientos`

---

## P06 · Interfaz base, trabajadores y panel de alertas

**Fase:** 5 · **Crea:** `components/ui/*`, layout de `/finca`, trabajadores, panel · **Modifica:** `app/globals.css`, `app/page.tsx`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 3, 5, 8, 11, 12, 13), doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md.

OBJETIVO: componentes reutilizables, navegación, el panel con alertas y la gestión de trabajadores.

TAREA 1. Agrega los tokens de color de la sección 13 sin borrar nada existente (Tailwind 4: @theme; Tailwind 3: tailwind.config). Interfaz sencilla y en español (RNF-01), adaptable a computador y celular (RNF-10).

TAREA 2. components/ui/: Boton (primario, secundario, peligro, fantasma; prop cargando), Campo, Selector, Tarjeta, Insignia (tono neutro, disponible, bajo, vencido, inactivo), Aviso (info, exito, advertencia, error), Modal, EstadoVacio. Foco visible y contraste.

TAREA 3. app/page.tsx: redirección a /finca (o a /login si no hay sesión).

TAREA 4. components/finca/NavegacionFinca.tsx y app/finca/layout.tsx (servidor): obtenerSesion(); sin sesión, redirect al login. Barra con "Finca Bananera", enlaces Panel, Trabajadores, Implementos, Químicos, Movimiento (y Historial/Asignaciones cuando existan); cerrar sesión. Menú móvil.

TAREA 5. components/finca/InsigniaEstado.tsx (disponible/agotado/vencido/inactivo con texto) e InsigniaAlerta.tsx (inventario bajo, próximo a vencer, vencido; con texto además de color).

TAREA 6. Panel: components/finca/PanelAlertas.tsx y app/finca/page.tsx (servidor): resumen (número de trabajadores activos, implementos, químicos) y PanelAlertas con listAlertas (inventario bajo, por vencer, vencidos). Acceso rápido a registrar movimiento.

TAREA 7. Trabajadores: components/finca/TablaTrabajadores.tsx, FormularioTrabajador.tsx y app/finca/trabajadores/page.tsx + trabajadores/nuevo/page.tsx: nombre, documento, cargo, teléfono, estado; filtro por estado; activar/desactivar; DOCUMENTO_DUPLICADO muestra el mensaje.

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos demo: ver el panel con las alertas; crear un trabajador; intentar un documento repetido (error); desactivar uno. Revisa en móvil.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P06 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** ver el panel de alertas; crear un trabajador y comprobar el rechazo por documento duplicado.

**Commit sugerido:** `feat(interfaz): panel de alertas y trabajadores`

---

## P07 · Implementos y químicos

**Fase:** 5 · **Crea:** gestión de implementos (enteros) y químicos (decimales)

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 5, 7, 8, 11, 12, 14), doc/ESTADO_EJECUCION.md y los componentes existentes.

OBJETIVO: gestionar implementos (cantidades enteras) y químicos (cantidades decimales con unidad y vencimiento), mostrando estado y alertas.

TAREA 1. Implementos: components/finca/TablaImplementos.tsx, FormularioImplemento.tsx y app/finca/implementos/page.tsx + implementos/nuevo/page.tsx: nombre, categoría, disponible, mínima, estado (InsigniaEstado), alerta de inventario bajo (InsigniaAlerta); filtro "solo bajos"; cantidades enteras; IMPLEMENTO_DUPLICADO muestra el mensaje.

TAREA 2. Químicos: components/finca/TablaQuimicos.tsx, FormularioQuimico.tsx y app/finca/quimicos/page.tsx + quimicos/nuevo/page.tsx: nombre, categoría, disponible (con unidad, en decimal), mínima, fecha de vencimiento, estado (disponible/agotado/vencido), alertas (inventario bajo, próximo a vencer, vencido). Filtros "solo bajos" y "por vencer". El formulario acepta cantidades decimales (2.5) y la unidad; QUIMICO_DUPLICADO muestra el mensaje. Las fechas se muestran día/mes/año (RNF-14).

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos demo: ver implementos y químicos con sus estados y alertas; crear un implemento (entero) y un químico (2,5 litros, con fecha de vencimiento); ver un químico marcado como próximo a vencer y otro como vencido. Revisa en móvil.

AL TERMINAR:
- npm run build y npm test sin errores.
- Marca P07 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** crear un implemento y un químico; ver las cantidades decimales con su unidad y las alertas de vencimiento.

**Commit sugerido:** `feat(interfaz): implementos y químicos con estados y alertas`

---

## P08 · Movimientos, consultas y aceptación del MVP

**Fase:** 5 y 6 · **Crea:** registro de movimientos, consulta de existencias, `doc/ACEPTACION.md` · **Modifica:** `README.md`

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 5, 6.1, 7, 8, 11, 12, 14, 15, 16 y 17), doc/ESTADO_EJECUCION.md y los componentes existentes.

OBJETIVO: registrar entradas y salidas de inventario, consultar existencias, y cerrar el módulo mínimo con la aceptación.

TAREA 1. components/finca/FormularioMovimiento.tsx (cliente) y app/finca/movimientos/nuevo/page.tsx: tipo de elemento (implemento/químico), elemento (selector de activos de ese tipo), tipo de movimiento (entrada/salida), cantidad (entera si implemento, decimal si químico), fecha (por defecto hoy), motivo. Validación en vivo; POST /api/finca/movimientos. Muestra los mensajes de CANTIDAD_INSUFICIENTE y QUIMICO_VENCIDO. Tras el movimiento, muestra la nueva cantidad y, si quedó en inventario bajo, lo indica.

TAREA 2. Consulta de existencias: asegura que las tablas de implementos y químicos (P07) muestran la cantidad disponible, la unidad (químicos) y el estado, y que el panel (P06) muestra las alertas. Si hace falta, agrega una vista consolidada de existencias.

TAREA 3. Revisa el código contra las secciones 7, 8 y 15. Reporta y corrige en la bitácora: cantidades de químicos operadas en decimal en vez de centésimas; estado o alerta guardados en vez de calculados; movimiento no atómico (RNF-04); salida de químico vencido permitida; "hoy" con new Date() fuera de fechas.ts; cantidad de movimiento ≤ 0 aceptada; movimiento sin motivo o fecha; rutas sin exigirSesion; SQL concatenado; estado comunicado solo con color; fechas sin formato día/mes/año.

TAREA 4. Ejecuta npm test y npm run probar:flujo; corrige fallas en el código. Prepara la aceptación: db:limpiar --prueba; conserva los demo.

TAREA 5. Crea doc/ACEPTACION.md con la tabla A-01 a A-18 de la sección 16.3 (columnas: ID, acción, resultado esperado, resultado obtenido, evidencia, observación; las tres últimas vacías) y una nota de que A-15 a A-18 son de las opcionales (P09).

TAREA 6. Actualiza README.md: descripción; funcionalidades; requisitos; cómo correr en local (npm install, .env.local con los NOMBRES de las variables, db:migrar, db:demo, dev); scripts; una nota sobre que los químicos se manejan en decimales (guardados en centésimas para no perder precisión) y que las alertas (bajo, por vencer, vencido) se calculan por la cantidad y la fecha de hoy; enlace a doc/PLAN_FINCA.md.

TAREA 7. Verifica que .env.local esté en .gitignore y que ningún archivo versionado tenga valores de variables de entorno.

AL TERMINAR:
- npm run build y npm test sin errores.
- Crea doc/checkpoints/FASE_5_COMPLETADA.md (interfaz) y doc/checkpoints/FASE_6_COMPLETADA.md (revisión y pruebas).
- Marca P08 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen y recuérdame que A-01 a A-14 se ejecutan en el despliegue de Vercel.
````

**Verificación del estudiante:** registrar entradas y salidas (incluida una salida decimal de químico); ver la alerta de inventario bajo activarse; comprobar que una salida que excede y una de un químico vencido se rechazan. Hacer push y ejecutar A-01 a A-14 en Vercel.

**Commit sugerido:** `feat(interfaz): movimientos, existencias y aceptación del MVP`

---

## P09 · Opcionales: asignaciones, devoluciones, vencimiento, historial y reportes

**Fase:** 7 · **Requisito:** `doc/checkpoints/FASE_6_COMPLETADA.md` existe y `doc/ACEPTACION.md` está diligenciado

````text
Antes de escribir código lee completos: doc/DICTAMEN.md, doc/PLAN_FINCA.md (secciones 2.2, 5 (RN-02, RN-03, RN-07, RN-08), 6 (CU-07 a CU-12), 16.3 (A-15 a A-18) y 18), doc/ESTADO_EJECUCION.md y doc/checkpoints/FASE_6_COMPLETADA.md. Si FASE_6_COMPLETADA.md no existe, detente y avísame.

OBJETIVO: las funcionalidades opcionales del plan.

TAREA 1. F7 · Asignar implementos:
- lib/datos/asignaciones.ts: asignarImplemento({ trabajadorId, implementoId, cantidad }) en transacción: el trabajador debe estar activo (puedeRecibirAsignacion, RN-02/RN-03, TRABAJADOR_INACTIVO); cantidad suficiente (RN-07, CANTIDAD_INSUFICIENTE); descuenta del inventario; registra la asignación 'entregado'. Reexporta en dataService.
- Ruta POST /api/finca/asignaciones; pantalla /finca/asignaciones.

TAREA 2. F8 · Devoluciones:
- registrarDevolucion(asignacionId): la asignación debe estar 'entregado' (si no, ASIGNACION_NO_DEVOLUCION); la marca 'devuelto' y suma la cantidad al inventario (RN-08). Ruta POST /api/finca/asignaciones/[id]/devolver.

TAREA 3. F9 · Alertas de vencimiento: en el panel y en /finca/quimicos, la lista de próximos a vencer y vencidos (ya calculada con nivelVencimiento). Verifica que se vea con claridad.

TAREA 4. F10 · Historial de movimientos: components/finca/TablaMovimientos.tsx y app/finca/movimientos/page.tsx: listarMovimientos con filtros por elemento y rango de fechas; muestra tipo, elemento, cantidad, fecha y motivo (RNF-12).

TAREA 5. F11 · Implementos por trabajador: en el detalle de un trabajador, implementosDeTrabajador (asignaciones 'entregado').

TAREA 6. F12 · Filtros y reportes: filtros por estado, categoría y cargo en las tablas; un reporte de inventario (puede ser una vista consolidada o una exportación simple).

VERIFICACIÓN: pídeme que inicie sesión si lo necesitas. Con los datos demo: asignar un implemento a un trabajador activo (se descuenta); intentar asignar a uno inactivo (rechazo); registrar la devolución (se suma de vuelta); ver el historial de movimientos; ver los implementos de un trabajador. Documenta.

AL TERMINAR:
- npm run build y npm test sin errores.
- Agrega a doc/ACEPTACION.md los resultados de A-15 a A-18.
- Crea doc/checkpoints/FASE_7_COMPLETADA.md.
- Marca P09 en ESTADO_EJECUCION.md y agrega su sección en la bitácora.
- Muéstrame un resumen.
````

**Verificación del estudiante:** asignar un implemento a un trabajador activo y registrarle la devolución; comprobar que un trabajador inactivo no recibe; ver el historial de movimientos.

**Commit sugerido:** `feat(opcional): asignaciones, devoluciones, historial y reportes`

---

## Prompts auxiliares

### Corrección de un error

Reemplazar `[NN]` por el número del prompt y pegar el error completo donde se indica.

````text
Durante la ejecución del prompt P[NN] apareció este error:

[PEGAR AQUÍ EL ERROR COMPLETO]

Lee doc/DICTAMEN.md, doc/PLAN_FINCA.md, doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Encuentra la causa y corrígela sin salir del alcance de P[NN]. No modifiques pruebas ni scripts de prueba para que pasen; corrige el código que prueban. Ejecuta npm run build y npm test. Registra en la bitácora la causa, la corrección y los archivos modificados. Muéstrame un resumen.
````

### Reanudación de un prompt interrumpido

````text
La ejecución anterior del prompt P[NN] se interrumpió. Lee doc/ESTADO_EJECUCION.md, doc/DICTAMEN.md, doc/PLAN_FINCA.md y doc/PROMPTS_FINCA.md (sección P[NN]). Revisa qué archivos de P[NN] ya existen y cuáles faltan, y continúa desde la primera tarea incompleta sin rehacer lo terminado. Al final ejecuta npm run build y npm test, y actualiza la bitácora.
````

### Despliegue fallido en Vercel

````text
El despliegue en Vercel falló con este registro:

[PEGAR AQUÍ EL REGISTRO DEL BUILD DE VERCEL]

Lee doc/ESTADO_ACTUAL.md y doc/ESTADO_EJECUCION.md. Identifica la causa (error de compilación, variable de entorno faltante en Vercel —incluida la conexión a Postgres—, o diferencia entre local y producción). Si es de código, corrígelo y verifica con npm run build. Si es una variable de entorno, dime exactamente qué NOMBRE de variable falta y en qué entornos de Vercel agregarla, sin pedir ni mostrar valores. Registra la causa y la solución en la bitácora.
````
