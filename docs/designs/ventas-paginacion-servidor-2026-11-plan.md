# Ventas: plan de la paginación en el servidor

> Ejecución en línea, sin subagentes (regla 5 de `CLAUDE.md`). Diseño: `ventas-paginacion-servidor-2026-11.md`.

## Restricciones

- Rama `feat/hallazgo-16-carga-y-mantenimiento`.
- La búsqueda encuentra lo mismo que hoy. Alcance "propios" lo aplica el backend.
- Un detalle no afirma "sin ventas" mientras carga o si falló.

## Puntos de revisión

1. Dos cambios de filtro seguidos: gana el último.
2. Un filtro nuevo estando en la página 3: vuelve a la 1.
3. Un id de más de cuatro dígitos se sigue encontrando por su número.
4. Un usuario sin `sales.view`: el detalle de un cliente no muestra error.
5. Pagar con la ventana abierta: la tabla refleja el pago al cerrarla.

### Tarea 1: backend

`backend/src/controllers/sales.controller.js`: `search` por cliente, asesor, comisionista, estado e id; filtros `responsableId` y `onCredit`; `sortBy=id`; el total con las mismas uniones y condiciones.

- [ ] `node --check`. Ejecutar la consulta con cada filtro en solo lectura. Commit.

### Tarea 2: consulta y tabla

Crear `utils/salesQuery.ts` (`buildSalesParams(filters, page, perPage?)`), `hooks/useSalesQuery.ts`, `hooks/useDebouncedValue.ts`. Modificar `pages/Sales.tsx`, `components/sales/SalesTable.tsx`.

- [ ] Pruebas de `buildSalesParams`, verlas fallar, implementar y verlas pasar.
- [ ] `tsc` y `npm test`.

### Tarea 3: quitar la lista completa

`DataContext` sin `data.sales`, `fetchSales` ni caché de ventas (`salesCache` pasa a `clientsCache`), con `salesVersion` para recargar. Detalles de cliente, responsable y usuario con `useSalesQuery`, y estados de carga y error. Tipos en `api/sales.ts`.

- [ ] `tsc`, `npm test` y `vite build`. Commit y push.
