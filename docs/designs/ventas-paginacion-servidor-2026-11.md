# Ventas: paginación en el servidor

Resuelve, para Ventas, el tope de 5.000 filas del hallazgo 14 de `docs/auditoria-frontend-2026-11-08.md`. Se trabaja en `feat/hallazgo-16-carga-y-mantenimiento`, junto con el hallazgo 16. Las demás pantallas y los `any` restantes están en `plan-carga-y-tipos-2026-11.md`.

## Por qué

Al entrar, la app descarga la lista completa de ventas (hasta 5.000, y las siguientes se pierden sin aviso) y la tabla la divide en el navegador. Hoy son 177 ventas y entran unas 30 al mes, así que no es una urgencia: el usuario decidió hacerlo para que la carga no crezca con el negocio.

## Objetivos

- La tabla de Ventas pide al servidor solo la página que muestra.
- Búsqueda, estado y fechas se resuelven en el servidor, con los mismos resultados que hoy.
- Lo que hoy sale de la lista completa pide sus propios datos: detalle de cliente, de responsable y de usuario, y el panel de créditos.
- Se tipa la capa de datos de ventas.

## Fuera de alcance

- Paginar las demás pantallas.
- Paginar el panel de créditos: trae solo las ventas en crédito y abonadas, una lista acotada (11 hoy).
- Cambiar la forma de la tabla o sus columnas.

## Lo que no debe pasar

- Que una búsqueda encuentre algo distinto de lo que encuentra hoy.
- Que alguien con alcance "propios" vea ventas ajenas.
- Que un detalle diga "sin ventas" mientras carga o si la carga falló (invariante 4).
- Que un pago, una anulación o una venta nueva no se reflejen en la tabla.

## Decisiones del usuario

- Solo en Ventas, en la misma rama del hallazgo 16.
- La búsqueda se lanza medio segundo después de dejar de escribir.
- Al cambiar de página o de filtro: esqueleto en la tabla, con buscador y filtros a la vista.
- `any`: por etapas, primero la capa de datos de ventas.

## Decisiones del implementador

**Backend**, `GET /sales`:

- `search` busca en cliente, asesor, comisionista, estado e id, también con el id relleno a cuatro dígitos, como hoy en la pantalla. Hoy `search` mira `observaciones`, pero ninguna pantalla lo usa.
- Filtros nuevos: `responsableId` y `onCredit=true` (`credito` o `abonado`). `sortBy=id`.
- El total se cuenta con las mismas uniones y condiciones que las filas.

**Frontend:**

- Un hook `useSalesQuery` con la página, los filtros, las filas, el total, y los estados de carga y error. Si llegan dos respuestas, gana la última (`latestRequests`).
- `SalesTable` recibe la página y el total, y deja de cortar la lista. Siguen siendo 10 filas por página. Al cambiar un filtro se vuelve a la página 1.
- Crear, anular, marcar como facturada y registrar o borrar un pago recargan la página actual.
- `data.sales`, `fetchSales` y la caché de ventas se quitan. Refrescar vuelve a pedir la página con los filtros actuales.
- Detalles: cada ventana pide las ventas de su cliente, responsable o usuario al abrirse, con estados de carga y error.

**Orden de despliegue:** el backend antes que el frontend. El frontend publicado no usa `search`, así que sigue funcionando.

## Verificación

- `tsc`, `npm test` y `node --check`.
- La consulta nueva, con cada filtro, en solo lectura contra la base.
- Probar en pantalla, con el backend reconstruido: búsqueda por cada campo, filtros, cambio de página, usuario con alcance "propios", panel de créditos, los tres detalles, y crear, anular y pagar.

## Lo que queda abierto

Ver `plan-carga-y-tipos-2026-11.md`.
