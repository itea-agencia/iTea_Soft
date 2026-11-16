# Los datos de catálogo de la venta viajan por id

Diseño del 2026-11-16. Rama `feat-bayrol`. Hallazgo 4 de `docs/resultado-venta-completa-api-2026-11-16.md`, ampliado por decisión del usuario. Invariante 5 (cada cosa se llama igual en todo el flujo) y spec `docs/specs/2026-09-17-dinero-y-totales.md`.

## Por qué

Hoy los datos de catálogo de una venta viajan por nombre y vuelven con otro nombre o en otro formato:

- **Proveedor.** 14 formularios lo mandan como `supplierName` y 4 como `supplier`, con texto libre; la API lo devuelve como `supplier`. Ocho lugares de la pantalla leen `supplier || supplierName`. Si alguien corrige el nombre en Configuración, un formulario abierto manda el nombre viejo.
- **Pago al proveedor.** El desplegable muestra las **tarjetas de la agencia** ("Samtur Bancolombia Negocios", "PRECOMPRAS CLIC AIR"), pero el servidor convierte la tarjeta en su método de pago y guarda solo eso: **se pierde con qué tarjeta se pagó**, y al usuario le importa para conciliar (2026-11-16). En producción: 124 productos con Transferencia y 40 con Tarjeta de Débito, los métodos de esas dos tarjetas, y 22 con métodos que hoy no son tarjetas, de cuando el desplegable mostraba otras opciones.
- **Aerolínea.** En tiquete y paquete la API devuelve en `airline` el id como texto y el nombre en `airlineName`; en equipaje y en los tramos, `airline` es el nombre. Equipaje la manda por id; tiquete y paquete, por nombre.
- **Plan de equipaje.** Se manda como "Aerolínea - Tarifa"; el tiquete lo devuelve como la tarifa sola y sus tramos como "Aerolínea - Tarifa".
- **Seguro del auto.** Se manda `basic`/`all_risk`, vuelve `basico`/`todo_riesgo`, y la pestaña del detalle muestra el valor crudo ("todo_riesgo").
- **Pagos del cliente.** Ya van por id, pero en un campo llamado `method`.

## Objetivo

- Todo dato de catálogo viaja del formulario al servidor por id, en un campo que termina en `Id`.
- La API devuelve cada uno con el mismo par: el id y el nombre para mostrar.
- El pago al proveedor guarda la tarjeta de la agencia, y su método se deduce de la tarjeta.
- Las ventas viejas de producción quedan con su tarjeta donde el proveedor y el método guardado lo permiten, con la regla que dio el usuario.
- El proveedor se elige solo de la lista.

No es objetivo: corregir el método de pago de cada tarjeta (hoy Samtur figura como "Transferencia" y PRECOMPRAS como "Tarjeta de Débito", y están mal: el usuario los corrige en Configuración después del despliegue), cambiar los aeropuertos (el código IATA ya es un identificador único e inmutable, `@unique` en el esquema, y pasarlo a un id interno no gana nada), ni el método principal de la venta (ya se deriva de los pagos, `5c1eefe`).

Sería un fracaso: que una venta deje de guardarse durante el despliegue, que cambie un total, o que se muestre una tarjeta que no se usó.

## Restricciones

- Frontend y backend salen en el mismo cambio, pero el servidor sigue recibiendo nombres un tiempo: la ventana entre el despliegue automático de Render y la subida manual a GoDaddy, las pestañas abiertas con el frontend viejo, y los borradores del asistente guardados en el navegador (`localStorage`) con la forma vieja.
- El esquema cambia solo por una migración versionada, aditiva (invariante 6).
- Siigo no se toca: lee el proveedor, no el método ni la tarjeta (`siigo.service.js`).

## Enfoques

- **A. Un solo cambio; el frontend manda ids y el servidor acepta ids y, de respaldo, nombres (elegido por el usuario).** Cubre la ventana, las pestañas y los borradores sin costo: el índice del catálogo ya busca por nombre. Quitar el respaldo queda en pendientes.
- **B. Un solo cambio, solo ids.** Descartado: las pestañas abiertas y los borradores darían error al guardar durante la transición.
- **C. Dos despliegues escalonados.** Innecesario: el usuario publica frontend y backend juntos.

## Diseño

### Contrato de la venta (lo que manda el asistente)

| Dónde | Campo nuevo | Reemplaza (respaldo que el servidor sigue aceptando) |
|---|---|---|
| Cada producto | `supplierId` | `supplier`, `supplierName` |
| Cada producto | `agencyCardId` | `supplierPaymentMethod` (nombre de tarjeta o de método) |
| Cada fila de `supplierPayments` del paquete | `supplierId`, `agencyCardId` | `supplier`, `paymentMethod` |
| Tiquete | `airlineId`, `baggagePlanId` | `airline`, `baggagePlan` |
| Cada tramo (`legs`, `outboundStops`, `returnLeg`, `returnStops`) | `airlineId`, `baggagePlanId` | `airline`, `baggagePlan` |
| Paquete | `airlineId` | `airline` |
| Equipaje | `airlineId` | `airline` (hoy ya lleva el id) |
| Cada pago del cliente | `paymentMethodId` | `method` |
| Abono (`POST /sales/:id/payments`) | `paymentMethodId` | `method` |

`origin` y `destination` de los tramos siguen siendo el código IATA.

**Resolución en el servidor.** Cada campo se lee como `item.supplierId ?? <respaldo>` y pasa por `refId` (el índice de `utils/catalog.js`, que ya acepta id o nombre). Un id que no existe es el mismo 400 de hoy.

**La tarjeta.** `loadCatalog` suma `agencyCards`: índice de `tarjetas_agencia` por id y nombre. Con `agencyCardId` se guarda solo la tarjeta, y `metodo_pago_proveedor_id` queda vacío: el método se deduce de la tarjeta al leer (invariante 3), así que cuando el usuario corrija el método de una tarjeta en Configuración se corrigen todas sus ventas. Con el respaldo por nombre, primero se busca como tarjeta (se guarda la tarjeta, que es lo que manda hoy el asistente) y, si no, como método (se guarda el método sin tarjeta, como antes); si no aparece, 400. Al leer, el método es el de la tarjeta si la hay, y si no, el guardado. Se descartó copiar el método de la tarjeta en cada venta: el método de las tarjetas está mal hoy, y copiarlo repartiría el error en cada venta nueva sin que corregir la tarjeta lo arreglara.

### Esquema

Una migración aditiva: `tarjeta_agencia_id INT NULL` con clave foránea a `tarjetas_agencia(id)` en `detalle_venta` y en `pagos_proveedor`, y la relación en `schema.prisma` (`tarjetaAgencia` en `DetalleVenta` y `PagosProveedor`). La migración no rellena nada.

### Corrección de las ventas viejas en producción

Regla del usuario (2026-11-16): la mayoría de los pagos a proveedores se hizo con **Samtur Bancolombia Negocios**, y los de Clic Air con **PRECOMPRAS CLIC AIR**. Medido en producción, en solo lectura, sobre los 184 productos sin pagos de paquete y las 2 filas de `pagos_proveedor`:

| Proveedor y método guardado | Cuántos | Tarjeta |
|---|---|---|
| Clic Air con Tarjeta de Débito o Transferencia | 39 + 6 | PRECOMPRAS CLIC AIR |
| Otro proveedor o sin proveedor, con Transferencia | 116 | Samtur Bancolombia Negocios |
| VIAJES COLOMBIA ONLINE con "Tarjeta de Bancolombia" | 14 | Samtur Bancolombia Negocios |
| Filas de `pagos_proveedor` con Transferencia | 2 | Samtur Bancolombia Negocios |
| Efectivo, CTA CTE 2060, y VIAJES COLOMBIA ONLINE con Tarjeta de Débito | 3 + 5 + 1 | sin cambio |

Un script de `backend/db-manual/` (`asignar_tarjeta_pagos_proveedor`) pone la tarjeta y deja vacío el método en las filas de las cuatro primeras líneas, para que lean el método de su tarjeta; las 9 de la última no se tocan. Va en una transacción, con conteos antes y después, solo sobre filas sin tarjeta, y aborta si los conteos no son exactamente 45, 130 y 2. Corre después de la migración, con el visto bueno del usuario, como toda escritura en producción, y su estado va al README de `db-manual/`.

### Lo que devuelve la API

Cada dato con su par id y nombre, igual en `GET /sales/:id` y `GET /sales/:id/details`:

| Dato | Campos |
|---|---|
| Proveedor | `supplierId`, `supplier` |
| Pago al proveedor | `agencyCardId`, `agencyCard` (nombre de la tarjeta, `null` sin tarjeta), `supplierPaymentMethod` (método de la tarjeta, o el guardado si no hay tarjeta) |
| Aerolínea (tiquete, tramo, paquete, equipaje) | `airlineId`, `airline` (nombre). Se deja de devolver `airlineName` |
| Plan de equipaje (tiquete, tramo) | `baggagePlanId`, `baggagePlan` ("Aerolínea - Tarifa" en los dos) |
| Seguro del auto | `insuranceType`: `basic` o `all_risk` |
| Filas de pago del paquete y `totals.bySupplier` | `supplierId`, `supplier`, `agencyCardId`, `agencyCard`, `paymentMethod` |

El frontend publicado lee `airlineName || airline`, así que devolver el nombre en `airline` no lo rompe.

### Frontend

- Tipos (`types/index.tsx`) y valores iniciales (`wizardData.ts`) con los campos nuevos.
- Proveedor: el `Combobox` usa el id como valor y el nombre como etiqueta, y solo acepta lo elegido de la lista (`picked`, como en clientes); lo escrito sin elegir deja el campo vacío. Cubre `FinancialSection` (`VoucherField.tsx`, 14 categorías), hotel, seguro, tiquete, paquete y las filas de pago del paquete.
- Pago al proveedor: el desplegable de tarjetas usa el id de la tarjeta.
- Aerolínea y plan de equipaje en tiquete, tramos y paquete: id como valor; los planes se filtran por `airlineId` en vez de comparar nombres.
- Pagos del cliente: `paymentMethodId`.
- `wizardValidation.ts`: las comprobaciones de proveedor, método y aerolínea pasan a los campos nuevos.
- Lecturas (`PaginatedProductTab.tsx`, `SaleDetailModal.tsx`, `VoucherPDF.tsx`): `supplier`, `airline` y `baggagePlan` sin respaldos; la tarjeta donde hoy se muestra el método de pago al proveedor (`agencyCard`, o `supplierPaymentMethod` si no hay); el seguro del auto como "Básico" o "Todo Riesgo".
- Un borrador viejo se carga tal cual: sus campos de nombre viajan con el ítem y el servidor los resuelve; si el asesor elige de nuevo, el id manda.

### Nombres

Los campos nuevos en inglés y con el patrón `<cosa>Id`: `supplierId`, `agencyCardId`, `airlineId`, `baggagePlanId`, `paymentMethodId`. La columna nueva sigue el esquema en español: `tarjeta_agencia_id`.

### Spec primero

En `2026-09-17-dinero-y-totales.md`, la fila "Proveedor y método de pago de cada fila" pasa a decir que viajan por id, que se guarda la tarjeta de la agencia y su método se deduce de ella, y que los nombres solo se aceptan de respaldo. En `2026-09-17-vocabulario.md`, el par id y nombre como regla de la API para los datos de catálogo.

## Verificación

- Pruebas unitarias en `frontend/tests/catalog.test.mjs`: índice de tarjetas por id y nombre; respaldo por nombre que prueba tarjeta y después método. Fallan antes del código.
- Migración: `prisma migrate dev` con permiso, y `verificar_schema_local.sql`.
- Con permiso, por la API: la venta completa con todos los ids (se guarda igual, con `tarjeta_agencia_id`, método vacío y el método de la tarjeta al leer); la misma con los nombres de hoy (respaldo: mismo resultado); un id inexistente por campo (400 sin registros nuevos); un abono con `paymentMethodId` y otro con `method`.
- Contrato de ida y vuelta: leer la venta por `GET /sales/:id` y `GET /sales/:id/details` y comparar cada campo enviado con el devuelto, como en la venta 168. Ningún campo con dos nombres.
- `npx tsc --noEmit`, `npm test`, `npm run build`, `node --check`.
- Lo visual queda para el usuario en una sección nueva de `pruebas-pantalla-hallazgo-16.md`: el proveedor solo de la lista, las tarjetas, aerolínea y plan de equipaje, el detalle mostrando la tarjeta y el seguro, y el voucher.

## Despliegue

El merge corre la migración aditiva en producción. El frontend se publica junto. Después, con el visto bueno del usuario, corre el script de la corrección, y el usuario corrige el método de cada tarjeta en Configuración. Pendiente para después: quitar el respaldo por nombre del servidor cuando ya no haya borradores viejos (unas semanas).

## Lo que decide quien construye

El orden de los archivos del frontend, si `FinancialSection` recibe las tarjetas o los proveedores ya mapeados a opciones, y cómo se nombran las variables locales nuevas, en inglés.
