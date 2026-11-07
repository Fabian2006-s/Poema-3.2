# Fase 2 completada · Reglas y pruebas

Se implementaron funciones puras para configuración, fechas, cantidades en centésimas, validación de trabajadores, movimientos, inventario bajo, vencimientos y estado derivado.

## Pruebas

```text
Test Files  10 passed (10)
Tests       47 passed (47)
```

Los 34 casos T-01 a T-34 pasan, incluyendo la resta decimal exacta `2.5 - 1.5 = 1`, igualdad con inventario mínimo y el límite de vencimiento de 30 días. La suite previa permanece verde. `npm run build` y ESLint enfocado también pasan.
