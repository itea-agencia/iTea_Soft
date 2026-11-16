# Un titular por producto, también en tours y seguros

Diseño del 2026-11-16. Rama `feat-bayrol`. Invariante 1, spec `docs/specs/2026-09-17-datos-por-pasajero.md`.

## Por qué

Al guardar una venta, `create` marca a cada pasajero con `esTitular: p.esTitular ?? true` (`sales.controller.js`): si el dato no viene, el pasajero es titular. Hotel, paquete, tiquete y viaje terrestre tienen el botón "Es Titular" y siempre mandan el dato. Tours (`guests`) y seguros (`members`) tienen lista de pasajeros pero no tienen el botón, así que todos sus pasajeros quedan titulares. El voucher y el detalle ordenan al titular primero y no pueden saber de quién es la reserva.

Medido en producción el 2026-11-16, en solo lectura: un solo producto con varios titulares, un tour del 2026-11-07. Seguros no tiene ningún pasajero guardado todavía.

## Objetivo

- Cada producto con pasajeros guarda exactamente un titular: el que eligió el asesor o, si nadie lo eligió, el primero de la lista.
- El asesor puede elegir el titular en tours y en seguros, igual que en hotel.

No es objetivo: corregir el tour del 2026-11-07 (queda anotado en la spec), ni el número de tiquete repetido entre pasajeros (20 filas en 10 tiquetes, escrito por el asesor, no heredado; queda anotado).

Sería un fracaso: que con el frontend viejo de GoDaddy, que se publica a mano, un tour o un seguro se guarde sin titular o falle al guardar.

## Enfoques

- **A. Solo el servidor:** si en la lista nadie viene marcado, el primero es titular. No pide publicar el frontend, pero el asesor no puede elegir.
- **B. Botón en tours y seguros, más la regla de A en el servidor.** Elegido por el usuario: el asesor elige, y la regla del servidor cubre al frontend viejo mientras no se publique el nuevo.
- **C. Cambiar el `?? true` por `?? false`:** los tours quedan sin titular. Descartado.

## Diseño

**Servidor** (`sales.controller.js`, en `create`). Una función nueva, `markHolder(rows)`, decide el titular de la lista de pasajeros de un ítem: el primero marcado con `esTitular === true` queda titular y los demás no; si nadie viene marcado, el primero. Un pasajero implícito (sin lista) es una lista de uno, y por eso queda titular como hoy. Si llegan varios marcados, se queda el primero en vez de rechazar la venta: el frontend viejo nunca manda más de uno, y el nuevo no deja hacerlo. Se quita `|| item.ticketNumber` de `nroTiquete`: ningún formulario llena ese campo del producto, y si alguno lo hiciera, copiaría el tiquete a todos los pasajeros.

**Frontend.** `TourForm.tsx` e `InsuranceForm.tsx` reciben el mismo bloque de hotel: el radio "Es Titular" con `name={titularGroup}` (`useId()`), la etiqueta "Titular", el titular sin botón de eliminar y, si nadie está marcado, el primero se muestra como titular. Se reusan `setTitular` y `hayTitular` de `passengerHelpers.ts`. Los pasajeros nuevos llegan con `esTitular: false`.

**Nombres.** Lo nuevo y lo que se toque va en inglés: `markHolder`, y la variable local `pasajerosDetalleData` pasa a `passengerRows` en el mismo bloque. El campo `esTitular` del contrato con el frontend no se renombra: lo usan 13 archivos del frontend y el que está publicado en GoDaddy; renombrarlo se hace en un cambio propio que despliegue backend y frontend juntos.

**Spec primero.** Antes del código, "Un solo titular" de `2026-09-17-datos-por-pasajero.md` dice que la regla vale en todas las listas y que el servidor la impone, y "Lo que queda abierto" cambia `esTitular ?? true` por el tour del 2026-11-07 y los tiquetes repetidos.

## Verificación

- Antes del arreglo: con permiso, levantar el backend local, crear por la API un tour con dos pasajeros sin `esTitular` y comprobar con SQL que quedan dos titulares (falla). Después del arreglo, la misma prueba da uno.
- Con lista y sin marcar, con uno marcado que no es el primero, y con pasajero implícito: un titular, el que corresponde.
- `npx tsc --noEmit`, `npm test` y `node --check`.
- Lo visual (el radio en tours y seguros) no se puede verificar aquí: va a la lista de pruebas en pantalla antes del merge.

## Lo que decide quien construye

Si `markHolder` vive en el controlador o en `utils/`, y si se le agrega una prueba en `frontend/tests/` cargándola sin bundler.
