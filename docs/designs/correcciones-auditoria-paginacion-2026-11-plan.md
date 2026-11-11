# Correcciones de la paginación de Ventas: plan

> Ejecución en línea, sin subagentes (regla 5 de `CLAUDE.md`) y sin la skill `ponytail` (decisión del usuario, 2026-11-11): se aplica a mano su principio, lo mínimo que resuelva cada punto. Diseño: `correcciones-auditoria-paginacion-2026-11.md`.

## Restricciones

- Rama `feat/hallazgo-16-carga-y-mantenimiento`. Un commit por tarea; verificar la rama antes de cada uno.
- La tabla de Ventas sigue mostrando el esqueleto en cada recarga. Solo el panel de créditos conserva su estado.
- Nada que escriba en la base local ni levante la app sin permiso del usuario en el momento (tarea 6).
- El merge a `main` espera estas correcciones y la prueba a mano de la venta de las 17 categorías del hallazgo 16. Lo hace el usuario.

## Puntos de revisión

1. Buscar `_` no trae nada que no tenga un guion bajo; `50%` busca el texto "50%".
2. "Desde 10/nov" no incluye una venta del 9/nov a las 20:00 de Colombia; "Hasta 10/nov" incluye una del 10/nov a las 23:30.
3. Página 3, se filtra, se limpia el filtro: queda en la 1.
4. Anular la única venta de la última página con un filtro de estado: la tabla pasa a la nueva última página, con su paginador.
5. "Crédito y Cobros" con "Finalizado" elegido en Listado: muestra los 11 créditos abiertos, no "¡Todo al día!".
6. Pagar desde el panel de créditos: el panel no se desmonta y conserva búsqueda, filtros y cliente elegido.
7. Si la recarga del panel falla: siguen las cifras anteriores, con una alerta y Reintentar.
8. Anular o pagar y reabrir el detalle: muestra el estado nuevo.
9. Un usuario con alcance "propios" no ve ventas ajenas en ninguna página ni búsqueda.

### Tarea 1: comodines en la búsqueda (backend)

`backend/src/controllers/sales.controller.js:27`. El valor de `search` se escapa antes de armar `like`: `\`, `%` y `_` pasan a `\\`, `\%` y `\_`. `ILIKE` usa `\` como escape por defecto. Va en una función `escapeLike` junto al controlador, para que la use cualquier otra búsqueda que se agregue.

- [x] Antes del cambio, contar en la base local, en solo lectura, cuántas ventas trae la consulta con `_`, `a_a` y `50%` (la auditoría vio 177, 163 y 2 en producción).
- [x] Implementar. `node --check`.
- [x] Repetir los conteos con la cadena escapada: `_` y `50%` tienen que dar 0 si ningún nombre los contiene, y `a_a` solo lo que contenga ese texto. Si da algo distinto, se revisa antes de seguir.
- [x] Commit.

### Tarea 2: fechas en hora de Colombia

`frontend/src/utils/salesQuery.ts:16`. `dateFrom` pasa a `` `${startDate}T00:00:00.000-05:00` `` y `dateTo` a `` `${endDate}T23:59:59.999-05:00` ``, sin pasar por `new Date()` del navegador. El backend ya hace `new Date(dateFrom)`, que entiende el desfase.

- [x] En `tests/salesQuery.test.mjs`, cambiar la prueba que fija el comportamiento actual por las nuevas: "Desde 2026-11-10" es `2026-11-10T05:00:00.000Z` y "Hasta 2026-11-10" es `2026-11-11T04:59:59.999Z`, con `TZ` del proceso en otra zona (p. ej. `Europe/Madrid`) para probar que no depende del navegador. Verlas fallar.
- [x] Implementar y verlas pasar. `tsc`. Commit.

### Tarea 3: la página (las dos regresiones)

`frontend/src/pages/Sales.tsx:96`.

- **Reaparece:** la página se guarda con la clave de sus filtros y, al volver a la misma clave, revive. Cuando la clave cambia, se guarda `{ filtersKey, page: 1 }` en el mismo render (patrón de React para reiniciar un estado cuando cambia una prop), así la página vieja no queda guardada.
- **Huérfana:** una función pura `lastPage(total, pageSize)` en `salesQuery.ts` (mínimo 1). Si la consulta terminó, no falló, vino vacía con `total > 0` y la página actual pasa de la última, se guarda la última. No se toca el texto "Venta no encontrada": con `total = 0` sigue siendo lo correcto.

- [x] Pruebas de `lastPage` (0 ventas → 1; 161 con 10 por página → 17; 160 → 16). Verlas fallar, implementar, verlas pasar.
- [x] `tsc` y `npm test`. Commit.

### Tarea 4: panel de créditos

`frontend/src/pages/Sales.tsx:99` y `:681`, `frontend/src/hooks/useSalesQuery.ts`.

- **Filtros invisibles:** `creditQuery` deja de usar `buildSalesParams(filters, …)` y pide solo `{ page: 1, perPage: 5000, onCredit: 'true', sortBy: 'id', sortOrder: 'desc' }`. El panel filtra con sus controles propios, como ya hace. La tarjeta "Total Pendiente / Vencido / Próximo" sale de `getCreditSummaryTotals(clients, sales)` sobre esa lista completa, así que ya muestra toda la cartera sin cambios en `CreditDashboard`.
- **Recarga sin desmontar:** `useSalesQuery` devuelve además `lastSales`, el último resultado que llegó bien (o `null` si todavía no hubo ninguno). En la pestaña de créditos, el esqueleto y el error de página entera se muestran solo con `lastSales === null`. Si no, se renderiza siempre `CreditDashboard` con `lastSales`, en la misma posición del árbol para que conserve su estado.
- **Recarga fallida:** con `lastSales` y `failed`, se muestra encima del panel una alerta: "No se pudieron actualizar los créditos. Las cifras pueden estar desactualizadas." con el botón Reintentar (`creditQuery.retry`).
- La tabla de Listado no cambia: sigue usando `sales` y `loading`.

- [x] `tsc` y `npm test`. Commit.

### Tarea 5: detalle desactualizado

`frontend/src/pages/Sales.tsx:52` y `:112`. `salesDetails` se guarda con el `salesVersion` en que se pidió; si el `salesVersion` del contexto es otro, se trata como vacío y `handleViewDetail` lo vuelve a pedir. `salesVersion` ya sube al crear, anular, marcar facturada, pagar, borrar un pago y liquidar (`refreshSales()` en `DataContext`), y con Refrescar. Se deriva en el render, sin `useEffect` que escriba estado (`.claude/rules/frontend.md`).

- [x] `tsc` y `npm test`. Commit.

### Tarea 6: alcance "propios" con un usuario de prueba (con permiso)

Pedir permiso al usuario antes de cada paso que escribe o levanta algo.

- [x] Con permiso: reconstruir backend y frontend (`docker compose up -d --build backend frontend`).
- [x] Con permiso: en la base local, un usuario de prueba con un rol cuyo `sales.view` sea `own`, y al menos una venta suya y varias ajenas. Si hace falta un script, va en `backend/db-manual/` y su estado en el README de esa carpeta.
- [x] Con permiso: entrar con ese usuario por la API (`curl` con su token) y comprobar que `GET /sales` con página, búsqueda, `onCredit` y fechas solo devuelve sus ventas, y que `meta.total` coincide con un conteo SQL de sus ventas.
- [x] Anotar el resultado en el diseño.
- [x] Borrar o dejar el usuario de prueba según diga el usuario: se deja (2026-11-11).

### Tarea 7: cierre

- [x] Quitar el alias sin uso `currentSales = sales` de `SalesTable.tsx` y corregir en `ventas-paginacion-servidor-2026-11.md` el nombre `useSalesList` por `useSalesQuery`.
- [x] Chequeo completo: `tsc`, `npm test`, `vite build`, `node --check` del controlador.
- [x] Diseño: estado "implementado", "Lo que queda abierto" al día (Siigo sin recargar la tabla; sin pruebas de `useSalesQuery` ni del controlador).
- [x] Commit y push de la rama.
- [ ] Lista para el usuario de lo que tiene que probar en pantalla (los puntos de revisión 3 a 8) y recordatorio de la prueba de las 17 categorías antes del merge. Al desplegar, el backend va antes que el frontend.
