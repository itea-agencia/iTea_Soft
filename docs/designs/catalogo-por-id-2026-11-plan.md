# Datos de catálogo por id — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El asistente manda por id proveedor, tarjeta de la agencia, aerolínea, plan de equipaje y método de pago; el servidor guarda la tarjeta y devuelve cada dato como par id y nombre; las ventas viejas de producción reciben su tarjeta.

**Architecture:** Migración aditiva (`tarjeta_agencia_id`); `utils/catalog.js` suma el índice de tarjetas y la resolución tarjeta-o-método; el controlador lee `<cosa>Id ?? <nombre de respaldo>`, guarda la tarjeta con el método vacío y lo deduce al leer; el frontend cambia campos, opciones y lecturas; un script de `db-manual/` corrige las ventas viejas.

**Tech Stack:** Express 5 + Prisma (CommonJS), PostgreSQL, React 19 + TS, `node:test`.

**Spec:** `docs/designs/catalogo-por-id-2026-11.md` (aprobado el 2026-11-16).

## Global Constraints

- Rama `feat-bayrol`. Campos nuevos en inglés con el patrón `<cosa>Id`; columna `tarjeta_agencia_id`; mensajes y commits en español.
- El servidor acepta ids y, de respaldo, los nombres de hoy; el id manda si vienen los dos.
- Migración solo aditiva. En local se aplica con `prisma migrate deploy` (la tabla `_prueba_propios_ventas` hace que `migrate dev` pida resetear), con permiso.
- Reconstruir el backend, pegarle a la API y escribir en la base local necesitan permiso; producción, además, confirmación explícita antes de correr el script.
- Aeropuertos siguen por código IATA. El método principal de la venta sigue derivado de los pagos.

## Review Focus

- Borrador viejo con `supplierName` y sin `supplierId`: el servidor lo resuelve por nombre. Caso de API en la tarea 6.
- `supplierPaymentMethod` con un nombre de método que no es tarjeta ("Transferencia", lo que mandan otros clientes): se guarda el método sin tarjeta. Prueba en la tarea 2.
- Tarjeta sin método asociado: se guarda la tarjeta y el método al leer es `null`, sin 400. Prueba en la tarea 2.
- Pago del paquete con `agencyCardId`: la fila de `pagos_proveedor` guarda la tarjeta y `totals.bySupplier` muestra el método de la tarjeta. Caso de API en la tarea 6.
- Venta vieja sin tarjeta: `agencyCard` es `null` y `supplierPaymentMethod` es el método guardado. Comparación de contrato en la tarea 6.

---

### Task 1: Spec y migración

**Files:**
- Modify: `docs/specs/2026-09-17-dinero-y-totales.md`, `docs/specs/2026-09-17-vocabulario.md`
- Create: `backend/prisma/migrations/20261116120000_tarjeta_agencia_en_pagos_proveedor/migration.sql`
- Modify: `backend/prisma/schema.prisma` (`DetalleVenta`, `PagosProveedor`, `TarjetasAgencia`)

- [ ] **Step 1:** specs según la sección "Spec primero" del diseño.
- [ ] **Step 2:** migración: `ALTER TABLE "detalle_venta" ADD COLUMN "tarjeta_agencia_id" INTEGER` y lo mismo en `"pagos_proveedor"`, cada una con `FOREIGN KEY ... REFERENCES "tarjetas_agencia"("id") ON DELETE SET NULL ON UPDATE CASCADE`, con un comentario del porqué. En el esquema, `tarjetaAgenciaId Int? @map("tarjeta_agencia_id")` y `tarjetaAgencia TarjetasAgencia? @relation(...)` en los dos modelos, y las relaciones inversas en `TarjetasAgencia`.
- [ ] **Step 3:** `cd backend && npx prisma validate` → válido. La comprobación de que migración y esquema coinciden es en la tarea 6, al aplicarla en local: `npm run db:status` sin pendientes y `verificar_schema_local.sql` limpio.

### Task 2: Índice de tarjetas

**Files:**
- Modify: `backend/src/utils/catalog.js`
- Test: `frontend/tests/catalog.test.mjs`

**Interfaces:**
- Produces: `loadCatalog` devuelve además `agencyCards` (`Index` por id y nombre de `tarjetas_agencia`) y `cardMethod` (`Map` id de tarjeta → id de método o `null`). `resolveSupplierPayment(catalog, { cardId, legacyName }) => { tarjetaAgenciaId, metodoPagoProveedorId } | null | undefined`: con `cardId` → `{ tarjetaAgenciaId: id, metodoPagoProveedorId: null }`; sin `cardId`, el nombre se busca como tarjeta (mismo resultado) y si no como método (`{ tarjetaAgenciaId: null, metodoPagoProveedorId: id }`); vacío → `null`; no encontrado → `undefined`.

- [ ] **Step 1: Prueba que falla:** tarjeta por id; tarjeta por nombre de respaldo; nombre de método sin tarjeta; vacío; id de tarjeta inexistente; nombre que no es ni tarjeta ni método.
- [ ] **Step 2:** `cd frontend && node --test tests/catalog.test.mjs` → FAIL.
- [ ] **Step 3:** implementar en `catalog.js`.
- [ ] **Step 4:** la misma prueba → PASS.

### Task 3: El servidor escribe por id

**Files:**
- Modify: `backend/src/controllers/sales.controller.js` (`create`, `armarPagosProveedor`, `construirTramoVuelo`, transforms de tiquete, paquete y equipaje, `registerPayment`)

**Interfaces:**
- Consumes: `refId`, `resolveSupplierPayment`.

- [ ] **Step 1:** proveedor `item.supplierId ?? nombreProveedorDe(item)`; filas del paquete `pago.supplierId ?? pago.supplier`; aerolínea `d.airlineId ?? d.airline` (tiquete, paquete, equipaje) y `leg.airlineId ?? leg.airline ?? item.airlineId ?? item.airline` en tramos; plan `d.baggagePlanId ?? d.baggagePlan` y el equivalente en tramos, con la herencia del plan del tiquete y `checkPlanAirline` sin cambios.
- [ ] **Step 2:** pago al proveedor de cada producto y de cada fila del paquete con `resolveSupplierPayment(catalog, { cardId: item.agencyCardId, legacyName: item.supplierPaymentMethod })` (filas: `pago.agencyCardId`, `pago.paymentMethod`); `undefined` → 400 "… el método de pago al proveedor «…» no existe" (o "la tarjeta «id»" si vino `cardId`); se escriben `tarjetaAgenciaId` y `metodoPagoProveedorId`.
- [ ] **Step 3:** pagos del cliente y abono: `p.paymentMethodId ?? p.method` y `paymentMethodId ?? method`.
- [ ] **Step 4:** `node --check` limpio; `npm test` pasa.

### Task 4: El servidor devuelve pares id y nombre

**Files:**
- Modify: `backend/src/controllers/sales.controller.js` (includes de `getById` y `getPaginatedDetails`, `SELECT_AGREGADO`, `agregarPorPadre`, `PRODUCT_TRANSFORMS`, `mapPassengers` no)

- [ ] **Step 1:** includes: `tarjetaAgencia: { select: { id, nombre, metodoPago: { select: { nombre } } } }` en detalle y en `pagosProveedor`, donde hoy se incluye `metodoPagoProveedor`.
- [ ] **Step 2:** una función `supplierPaymentOf(row) => { agencyCardId, agencyCard, supplierPaymentMethod }` (método de la tarjeta si la hay, si no el guardado) y `supplierId: d.proveedorId` junto a cada `supplier` en los 17 transforms; `agregarPorPadre` suma `supplierId`, `agencyCardId`, `agencyCard` y usa el método deducido en `paymentMethod`.
- [ ] **Step 3:** tiquete y paquete: `airlineId: t.aerolineaId`, `airline: <nombre>`, sin `airlineName`; tiquete y tramos: `baggagePlanId` y `baggagePlan` "Aerolínea - Tarifa"; equipaje: `airlineId`, `airline` (ya); auto: `insuranceType` `basic`/`all_risk`.
- [ ] **Step 4:** `node --check`; `npm test`.

### Task 5: Frontend por id

**Files:**
- Modify: `frontend/src/types/index.tsx`, `components/sales/wizardData.ts`, `wizardValidation.ts`, `NewSaleWizard.tsx`, `steps/Step3Payment.tsx` si hace falta, `forms/VoucherField.tsx`, `forms/{Ticket,Plan,Hotel,Insurance,Baggage}Form.tsx` y los 13 formularios que usan `FinancialSection`, `tabs/PaginatedProductTab.tsx`, `SaleDetailModal.tsx`, `VoucherPDF.tsx`, `ActiveProductForm.tsx`.

- [ ] **Step 1:** tipos e iniciales: `supplierId?: number`, `agencyCardId?: number`, `airlineId?: number`, `baggagePlanId?: number` en los tipos de producto, tramo y fila de pago; `paymentMethodId` en el pago; se quitan `supplier`/`supplierName`/`supplierPaymentMethod`/`airline`/`baggagePlan` de lo que se manda (las lecturas usan los campos de respuesta, tipados aparte o como opcionales de lectura).
- [ ] **Step 2:** proveedor: `Combobox` con `value: String(id)`, `label: nombre`, y `onChange(val, picked)` que guarda `Number(val)` solo si `picked`, si no `undefined`. Tarjeta: opciones `value: String(card.id)`. Aerolínea: `value: String(id)`; planes filtrados por `airlineId` con `value: String(plan.id)` (el catálogo `baggage` del frontend tiene que traer el id; si no, se agrega en `config.controller.js`).
- [ ] **Step 3:** validaciones y el armado del payload (`NewSaleWizard.tsx`: `paymentMethodId: p.methodId`).
- [ ] **Step 4:** lecturas sin respaldos: `supplier`, `airline`, `baggagePlan`; la tarjeta como `agencyCard ?? supplierPaymentMethod`; seguro del auto "Básico"/"Todo Riesgo".
- [ ] **Step 5:** `cd frontend && npx tsc --noEmit` sin errores, `npm test` pasa, `npm run build` termina.

### Task 6: Corrección de producción, verificación y cierre

**Files:**
- Create: `backend/db-manual/asignar_tarjeta_pagos_proveedor.sql` y `.sh`
- Modify: `backend/db-manual/README.md`, `docs/pendientes-2026-11.md`, `docs/pruebas-pantalla-hallazgo-16.md`, `docs/resultado-venta-completa-api-2026-11-16.md`

- [ ] **Step 1:** script transaccional según el diseño: tarjetas por nombre exacto ("Samtur Bancolombia Negocios", "PRECOMPRAS CLIC AIR"), proveedor "Clic Air" por nombre; solo filas con `tarjeta_agencia_id IS NULL`; conteos antes; `UPDATE` que pone la tarjeta y `metodo_pago_proveedor_id = NULL`; guarda `DO $$` que aborta si los afectados no son 45 (PRECOMPRAS), 130 (Samtur en detalle) y 2 (Samtur en `pagos_proveedor`); conteos después. El `.sh` como los demás de la carpeta.
- [ ] **Step 2 (permiso):** reconstruir el backend, aplicar la migración en local con `migrate deploy`, `db:status` y `verificar_schema_local.sql`.
- [ ] **Step 3 (permiso):** por la API: venta completa con ids; la misma con nombres; un id inexistente por campo (400, sin registros); abono con `paymentMethodId` y con `method`; comparar el contrato de `GET /sales/:id` y `/details` campo por campo; SQL: `tarjeta_agencia_id` puesto y método vacío en las filas con tarjeta.
- [ ] **Step 4:** correr el script en local en modo prueba (`BEGIN ... ROLLBACK`) para validar la sintaxis; los conteos locales no son los de producción y la guarda debe abortar ahí.
- [ ] **Step 5:** documentos (sección nueva de pruebas en pantalla, pendientes con el respaldo por nombre a quitar y el script por correr), commits y push.
