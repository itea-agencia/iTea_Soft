# El plan de equipaje es de la aerolínea del tiquete o del tramo

Diseño del 2026-11-16, aprobado por el usuario (enfoque A). Rama `feat-bayrol`. Hallazgo 3 de `docs/resultado-venta-completa-api-2026-11-16.md`.

## Por qué

El catálogo valida que la aerolínea y el plan de equipaje existan, pero cada uno por separado: un tiquete de Copa se guardaba con un plan de Avianca. Además `construirTramoVuelo` hace que un tramo sin plan propio herede el del tiquete aunque el tramo sea de otra aerolínea. En producción, al 2026-11-16 y en solo lectura: 0 tiquetes y 0 tramos con plan de otra aerolínea; 4 tramos de una aerolínea distinta a la del tiquete, todos con plan propio de su aerolínea; 1 tramo con plan y sin aerolínea. El asistente filtra los planes por aerolínea, así que el riesgo viene de la API o del texto libre del `Combobox`.

## Enfoques

- **A. Rechazar lo elegido, no heredar lo ajeno (elegido).** Un plan que el asesor eligió para el tiquete o el tramo y no es de su aerolínea es un 400. Un tramo sin plan propio hereda el del tiquete solo si es de su misma aerolínea; si no, queda sin plan: el asesor no eligió ese plan para ese tramo. Sin aerolínea no hay con qué comparar y se guarda como hoy.
- **B. Rechazar también la herencia.** Descartado: frenaría una conexión de otra aerolínea en la que el asesor no tocó el plan del tramo.
- **C. Solo el frontend.** Descartado: ya filtra y no protege la API.

## Diseño

- `loadCatalog` agrega `planAirline`, un `Map` de id de política de equipaje a id de aerolínea. `planMatchesAirline(catalog, planId, airlineId)` en `utils/catalog.js` es `true` si falta alguno de los dos o si coinciden.
- Transform de tiquete: si el plan no es de la aerolínea, 400 "Tiquetería #1: el plan de equipaje «…» no es de la aerolínea «…»".
- `construirTramoVuelo`: el plan propio del tramo (`leg.baggagePlan`) se valida igual contra la aerolínea del tramo (`leg.airline || item.airline`); el heredado (`item.baggagePlan`) se usa solo si `planMatchesAirline`, y si no, `null`.
- Paquete y equipaje no tienen plan de equipaje: no cambian.

## Verificación

- Prueba de `planMatchesAirline` en `frontend/tests/catalog.test.mjs`, que falla antes de la función.
- Con permiso: la venta 168 tal cual (plan de Avianca en un tiquete de Copa) da 400; con un plan de Copa se guarda; un tramo de otra aerolínea sin plan propio se guarda sin plan; un tramo con plan propio de otra aerolínea da 400; sin registros nuevos en los rechazos.
