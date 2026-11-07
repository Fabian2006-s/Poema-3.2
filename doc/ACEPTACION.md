# Aceptación del MVP

Completa las columnas de resultado, evidencia y observación al verificar cada caso.

| ID | Acción | Resultado esperado | Resultado obtenido | Evidencia | Observación |
|---|---|---|---|---|---|
| A-01 | Abrir `/finca` sin sesión | Redirección al login |  |  |  |
| A-02 | Registrar el trabajador "Juan" (documento 123) | Aparece en Trabajadores |  |  |  |
| A-03 | Intentar otro trabajador con documento 123 | Rechazo por duplicado |  |  |  |
| A-04 | Registrar el implemento "Guantes" (10 unidades, mínima 5) | Aparece con 10 disponibles |  |  |  |
| A-05 | Registrar el químico "Fungicida" (2,5 litros, mínima 1, vence en 40 días) | Aparece con 2,5 litros, disponible |  |  |  |
| A-06 | Registrar una salida de 5 guantes | Disponible 5; se activa la alerta de inventario bajo |  |  |  |
| A-07 | Intentar una salida de 10 guantes | Rechazo por cantidad insuficiente |  |  |  |
| A-08 | Registrar una salida de 1,5 litros de fungicida | Disponible 1,0 litro, sin error de redondeo |  |  |  |
| A-09 | Intentar un movimiento con cantidad 0 o sin motivo | Rechazo con mensaje claro |  |  |  |
| A-10 | Registrar un químico vencido e intentar una salida | Se marca vencido y la salida se rechaza |  |  |  |
| A-11 | Registrar un químico que vence en 30 días | Aparece como próximo a vencer |  |  |  |
| A-12 | Ver el panel de alertas | Lista los de inventario bajo, por vencer y vencidos |  |  |  |
| A-13 | Consultar existencias de implementos y químicos | Muestra cantidades, unidades y estados |  |  |  |
| A-14 | Cerrar el navegador y volver a entrar | Los datos persisten (RNF-07) |  |  |  |
| A-15 | (Opcional) Asignar guantes a un trabajador activo | Descuenta del inventario; queda asignado |  |  |  |
| A-16 | (Opcional) Intentar asignar a un trabajador inactivo | Rechazo |  |  |  |
| A-17 | (Opcional) Registrar la devolución | Suma la cantidad de nuevo al inventario |  |  |  |
| A-18 | (Opcional) Ver el historial de movimientos | Lista con fecha, elemento, cantidad y motivo |  |  |  |

A-15 a A-18 corresponden a funcionalidades opcionales de P09. Los casos A-01 a A-14 se deben ejecutar en el despliegue de Vercel.
