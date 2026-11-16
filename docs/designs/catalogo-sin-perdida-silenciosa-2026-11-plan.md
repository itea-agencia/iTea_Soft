# Catálogo sin pérdida silenciosa — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un valor de catálogo escrito que no existe rechaza la venta o el abono con un 400 que lo nombra, en vez de guardarse vacío.

**Architecture:** `backend/src/utils/catalog.js` carga los catálogos una vez por petición y arma índices normalizados; el controlador reemplaza los cinco `resolve*Id` por `refId(index, value, where, what)`, que lanza el 400.

**Tech Stack:** Express 5 + Prisma (CommonJS), `node:test`.

**Spec:** `docs/designs/catalogo-sin-perdida-silenciosa-2026-11.md` (aprobado el 2026-11-16).

## Global Constraints

- Rama `feat-bayrol`; nombres nuevos en inglés, mensajes y commits en español.
- Un campo vacío sigue siendo válido donde hoy lo es; solo se rechaza un valor no vacío que no se encuentra.
- Reconstruir el backend y pegarle a la API necesitan permiso del usuario.
- Sin migraciones ni dependencias nuevas.

## Review Focus

- Nombre con espacios al borde en el catálogo (`AVIANCA `) y el valor sin ellos: se encuentra. Prueba en la tarea 1.
- `'123 Viajes'` como proveedor: no es el id 123, se rechaza. Prueba en la tarea 1.
- Tarifa sola repetida en dos aerolíneas: ambigua, se rechaza. Prueba en la tarea 1.
- Tarjeta de agencia sin método de pago: no cuenta como método válido. Prueba en la tarea 1.
- Tramo vacío del formulario (sin origen ni destino): se sigue omitiendo, no da 400. Caso de API en la tarea 2.

---

### Task 1: Índice de catálogo

**Files:**
- Create: `backend/src/utils/catalog.js`
- Test: `frontend/tests/catalog.test.mjs`

**Interfaces:**
- Produces: `buildIndex(rows: Array<{ id: number|null, keys: string[] }>) => Index`; `findId(index, value) => number | null | undefined` (`null` vacío, `undefined` no encontrado o ambiguo); `loadCatalog(db) => Promise<{ suppliers, airlines, paymentMethods, baggagePlans, airports }>`, cada uno un `Index`.

- [ ] **Step 1: Prueba que falla** con: vacío (`undefined`, `null`, `''`, `'  '`) → `null`; nombre exacto; `' clic  kiu '` encuentra `CLIC KIU`; `'avianca'` encuentra `AVIANCA `; id `5` y `'5'` existentes → 5; id `99` inexistente → `undefined`; `'123 Viajes'` → `undefined`; clave repetida con ids distintos → `undefined`; fila con `id: null` → no se indexa.
- [ ] **Step 2:** `cd frontend && node --test tests/catalog.test.mjs` → FAIL, módulo inexistente.
- [ ] **Step 3: Implementar.** Normalizar con `String(v).trim().replace(/\s+/g, ' ').toLowerCase()`. `loadCatalog` arma: proveedores por `nombre`; aerolíneas por `nombre`; métodos por `nombre` de `metodosPago` más `tarjetasAgencia` con `metodoPagoId` (id = `metodoPagoId`); políticas de equipaje por `"<aerolínea> - <tarifa>"` y por `tarifa`; aeropuertos por `codigoIata`.
- [ ] **Step 4:** la misma prueba → PASS.

### Task 2: El controlador rechaza en vez de perder

**Files:**
- Modify: `backend/src/controllers/sales.controller.js` (resolvedores ~1705-1795, `construirTramoVuelo` ~213, `armarPagosProveedor` ~247, transforms de tiquete, paquete y equipaje, `create`, `registerPayment`)
- Modify: `docs/specs/2026-09-17-dinero-y-totales.md` ("Dónde vive la regla"), primero.

**Interfaces:**
- Consumes: `loadCatalog`, `findId` de la tarea 1.
- Produces: `refId(index, value, where, what) => number|null`, que lanza `{ statusCode: 400, code: 'VALIDATION_ERROR' }` con `"<where>: <what> «<valor>» no existe"`.

- [ ] **Step 1:** fila nueva en la spec.
- [ ] **Step 2:** `refId` y la carga del catálogo al empezar `create` y `registerPayment`. `where` es `"<NOMBRE_CATEGORIA> #<n>"` en los productos, `"Pago #<n>"` en los pagos del cliente y `"La venta"` en el método principal. `what`: "el proveedor", "el método de pago al proveedor", "la aerolínea", "el plan de equipaje", "el aeropuerto", "el método de pago".
- [ ] **Step 3:** los transforms de tiquete, paquete y equipaje reciben `ctx = { catalog, where }` como cuarto argumento; `construirTramoVuelo` y `armarPagosProveedor` reciben `ctx` en vez de los resolvedores y `memCache`. Se borran `resolveSupplierId`, `resolvePaymentMethodId`, `resolveAirlineId`, `resolveBaggagePlanId`, `resolveAirportId` y `memCache`. `payments[].method` deja `parseInt(p.method) || null` y pasa por `refId`.
- [ ] **Step 4:** `node --check` y `npm test` → limpio.
- [ ] **Step 5:** con permiso, reconstruir y verificar por la API: la venta 168 se guarda igual; un 400 por cada tipo (proveedor, método al proveedor, aerolínea, plan de equipaje, aeropuerto de una escala, método del pago del cliente) y un abono con método inexistente, cada uno sin registros nuevos; un tramo vacío no da 400.
- [ ] **Step 6:** pendientes (hallazgo 2 cerrado), informe de la venta por API, commit y push.
