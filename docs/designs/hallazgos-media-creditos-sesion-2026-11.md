# Hallazgos 6, 12 y 14 de la auditoría del frontend

Diseño para los hallazgos 6, 12 y 14 de `docs/auditoria-frontend-2026-11-08.md`. Acordado con el usuario el 2026-11-10.

## Problema

- **6.** Una venta vencida con abonos sale "Parcial" y no suma a lo vencido (1 en producción al 2026-11-10). Además, `es_credito` solo se escribe al crear: al saldar con abonos queda en `true`, y el panel de créditos cuenta como activos créditos ya pagados y pone a su cliente en "Pronto" (10 ventas `pagado` en producción).
- **12.** El asistente imprime el formulario completo de la venta en consola, y ni el logout ni un 401 borran las cachés de ventas, clientes, usuarios, config y dashboard.
- **14.** El contador de registros del detalle lee `meta.totalItems`; el backend manda `meta.total`, así que siempre muestra 0.

## Diseño

- **`isCredit` es "todavía está en crédito"** (decisión del usuario). Las respuestas de ventas lo calculan del estado (`credito` o `abonado`) en vez de leer `es_credito`: un dato derivado no se guarda (invariante 3), y así no hace falta escribir en producción. Las ventas saldadas dejan de aparecer en el panel de créditos y en el detalle del cliente.
- **El vencimiento manda sobre el abono** (decisión del usuario): `getCreditSaleStatus` revisa el vencimiento antes que lo abonado. La venta sale "Vencido" y su saldo suma a lo vencido; lo abonado se sigue viendo en la fila.
- **Una función, `clearSessionCaches()`,** borra las cachés de la sesión. La llaman el logout y el interceptor del 401. El borrador de la venta en curso solo lo borra el logout (decisión del usuario): si la sesión vence a mitad de una venta, el asesor la recupera al volver a entrar. La clave del borrador lleva el id del usuario.
- Se quita el `console.log` del formulario y la línea de `login` que borraba `itea_dashboard_cache`, una clave que no existe (la real lleva el id del usuario).
- El contador lee `meta.total`.

## Fuera de alcance

- Siigo (hallazgo 3): se va a dejar de usar. Sigue leyendo `es_credito`.
- Quitar la columna `es_credito`: necesita una migración.
- El tope de 5.000 filas del hallazgo 14.
- Borrar el único pago de una venta de contado la deja en `credito` sin fecha de vencimiento. Pasa hoy y no cambia.

## Entrega y verificación

Un commit por hallazgo en `feat-bayrol`: 6, 12, 14. El backend del 6 se despliega antes de publicar el frontend; el frontend publicado sigue funcionando con él, porque `isCredit` solo pasa a ser exacto.

Pruebas de `creditUtils` primero en `frontend/tests/`, `tsc`, `npm test` y `node --check`. Comprobar `isCredit` contra la base local necesita reconstruir el contenedor, con permiso. Lo visual lo mira una persona.
