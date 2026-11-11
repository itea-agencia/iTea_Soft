# Correcciones de la auditoría de la paginación de Ventas

Estado: **aprobado, sin plan.** Las preguntas se respondieron el 2026-11-11 (ver "Decisiones del usuario"). Sigue escribir el plan. No se tocó código.

Sale de la auditoría del 2026-11-10 sobre los commits `c2c4077` y `30388fd` de
`feat/hallazgo-16-carga-y-mantenimiento` (ver `ventas-paginacion-servidor-2026-11.md`).

## Lo que encontró la auditoría

Verificado: `tsc`, 78 pruebas, build y `node --check` pasan. El SQL real del controlador,
corrido contra producción en solo lectura, dio los mismos resultados que el filtro anterior
en 460 términos de búsqueda y 94 días; 18 páginas, 177 ids sin duplicados; panel de créditos
con 11 ventas; alcance "propios" sin ventas ajenas (simulado en el controlador, sin `auth`).

Problemas:

1. **Página huérfana (regresión).** Si la última página de un filtro tiene una sola venta y
   esa venta sale del filtro (p. ej. se anula con "Finalizado": 161 ventas, la página 17 tiene
   una), la pantalla dice "Venta no encontrada" y desaparece el paginador. `Sales.tsx:641`.
2. **Filtros invisibles en créditos.** "Crédito y Cobros" aplica la búsqueda, el estado y las
   fechas de la pestaña Listado sin mostrarlos. Con "Finalizado" el panel dice "¡Todo al día!"
   y $0 con 11 créditos abiertos (invariante 4). Venía de antes. `Sales.tsx:99`.
3. **Comodines sin escapar en la búsqueda.** `_` trae 177 ventas en lugar de 0, `a_a` 163 y
   `50%` 2. `sales.controller.js:27`.
4. **La página reaparece (regresión).** Página 3, se filtra (va a la 1), se limpia el filtro:
   vuelve a la 3. `Sales.tsx:96`.
5. **Esqueleto en cada recarga.** Marcar como facturada, anular, pagar o refrescar reemplaza
   la tabla por el esqueleto. En créditos desmonta el panel y pierde su búsqueda, filtros y
   cliente elegido. `Sales.tsx:616` y `681`.

Heredados (antes de la paginación):

- **Fecha "Desde".** Se interpreta en UTC: desde el 10/nov incluye ventas del 9/nov desde las
  19:00 de Colombia. El 25 % de las ventas (45 de 177) se crean en esa franja. Una prueba de
  `salesQuery.test.mjs` fija el comportamiento actual. `salesQuery.ts:16`.
- **Detalle desactualizado.** `salesDetails` nunca se invalida: tras anular o pagar, el detalle
  puede mostrar el estado anterior. `Sales.tsx:112`.
- **Factura Siigo sin recargar.** Emitir desde el detalle no actualiza la marca en la tabla.
  `SaleDetailModal.tsx:170`.

## Decisiones del usuario

- **Créditos, filtros:** el panel usa solo sus propios filtros (búsqueda,
  Vencidos/Pronto/Pendiente, asesor, vencimiento, deuda mínima). Lo de Listado deja de
  afectarlo.
- **Créditos, tarjeta:** "Total Pendiente / Vencido / Próximo" muestra siempre toda la cartera,
  sin depender de los filtros del panel.
- **Créditos, recarga:** el panel sigue visible con sus cifras anteriores mientras recarga y
  conserva filtros y cliente elegido.
- **Créditos, recarga fallida:** el panel sigue visible con una alerta clara de que las cifras
  pueden estar desactualizadas y un botón Reintentar.
- **Página vacía:** si la página actual deja de existir, se pasa sola a la última válida.
- **Cambiar o limpiar un filtro:** siempre lleva a la página 1.
- **Tabla de Ventas:** sigue mostrando el esqueleto en cada recarga. Solo el panel de créditos
  deja de perder su estado.
- **Heredados que entran:** fecha "Desde" y detalle desactualizado.
- **Heredado que no entra:** factura Siigo sin recargar. Queda en "Lo que queda abierto".
- Las preguntas se hacen con opciones.

Respondidas el 2026-11-11:

- **Día del filtro de fechas:** hora de Colombia fija, para "Desde" y "Hasta": de 00:00 a 23:59:59.999 con `-05:00`. Hoy "Desde" se lee en UTC y "Hasta" en la hora del navegador, que ni siquiera coinciden entre sí. Colombia es como la tabla muestra las fechas (`formatDate`), como cuenta los días `getDaysUntilDue` y como los calcula `diaColombia` en el backend.
- **Detalle desactualizado:** alcanza con descartar el detalle guardado tras anular, pagar, marcar facturada o liquidar, para que al reabrirlo se pida de nuevo. No hace falta actualizarlo abierto: anular se hace desde la tabla (`Sales.tsx:440`) y los pagos desde otra modal (`Sales.tsx:747`); el único caso con el detalle abierto es emitir en Siigo, que no entra.
- **Comodines:** la búsqueda trata `_`, `%` y `\` como texto literal, como el filtro anterior en el navegador. Es corregir un resultado, no una preferencia.
- **Rama:** las correcciones van en `feat/hallazgo-16-carga-y-mantenimiento`, donde están los commits que introdujeron las regresiones.
- **Plan:** uno solo, con un commit por corrección: tocan los mismos archivos (`Sales.tsx`, `salesQuery.ts`).
- **Merge:** espera todo junto, las correcciones y la prueba a mano de la venta de las 17 categorías del hallazgo 16. Se descartó separar la paginación en otra rama desde `main`.
- **Alcance "propios":** se prueba con un usuario de prueba en la base local con un rol de alcance "propios", con la app levantada y `auth` incluido. Crear el usuario y levantar la app se confirman con el usuario en el momento (regla 4).

## Lo que queda abierto

- Factura Siigo sin recargar la tabla (decidido no entrar ahora).
- Ninguna prueba cubre `useSalesQuery`, la lógica de páginas ni el controlador.
- El diseño de la paginación nombra `useSalesList`; el código usa `useSalesQuery`. Queda en
  `SalesTable` el alias sin uso `currentSales = sales`.
- El merge a `main` lo hace el usuario, no el agente.
