# Corrección de las vulnerabilidades del análisis de octubre

> Plan escrito el 2026-10-23, a partir de una revisión completa del backend y del frontend.
> Sigue el flujo del `CLAUDE.md`: este documento es el diseño, y cada fase es una rama y un
> PR propio. Las decisiones **D1…D6** se aceptaron tal como están propuestas el 2026-10-23.

## Problema

La revisión encontró ocho problemas. Los que tocan dinero ya tienen huella en producción o
están a un clic de tenerla; los de autorización hoy no tienen a quién afectar, porque en
producción solo hay 2 admins y 2 asesores activos, y los asesores tienen alcance `all` en
ventas y clientes. Ningún freelancer está activo. Eso cambia el orden: primero la plata,
después la superficie de ataque.

Conteos de producción al 2026-10-23, leídos en una transacción `READ ONLY`:

| Consulta | Producción | Local |
|---|---|---|
| Ventas | 160 | 104 |
| `pagado` sin pagos que cubran el total | 0 | **2** |
| Total distinto de la suma de sus filas | **1** (venta 93) | 4 |
| Anuladas con factura emitida en Siigo | 0 | 0 |
| Anuladas dentro de una liquidación de comisión | **2** (ventas 84 y 86) | — |
| Con `deleted_at` | 0 | 1 |

### 1. El estado de la venta llega del navegador

`create` guarda `status: data.status` (`sales.controller.js:2124`) y `update` hace lo mismo
(`:2308`). Ninguno lo compara con los pagos. La interfaz lo permite: `Step3Payment.tsx`
ofrece "Completada" cuando hay **cero pagos** y el total es mayor que cero. Además, la rama
`data.payments` de `update` deriva el estado contra `data.total`, un número del cliente
(`:2358`), y crea pagos sin la guarda de saldo de `registerPayment`.

Es el invariante 2 roto por la puerta de al lado: el total ya se deriva en el servidor, el
estado no.

### 2. Los endpoints de producto suelto: sin uso y abiertos

`POST/PUT/DELETE /sales/:saleId/products/*` son 51 rutas que el frontend no llama
(`createProduct`, `updateProduct` y `deleteProduct` no tienen llamadores).

- El PUT pasa `req.body` crudo a Prisma (`products.controller.js:357`): se escribe cualquier
  columna, incluida `detalleVentaId`, que mueve el producto a otra venta.
- PUT y DELETE no comprueban que el producto pertenezca a `:saleId`, así que `ventaPropia`
  se esquiva con el UUID de un producto ajeno.
- El DELETE recalcula los totales de la venta de la URL, no la del producto.

### 3. Anular no cierra nada

`voidSale` cambia el estado y agrega el motivo, nada más.

- Registrar o borrar un pago sobre una venta anulada **la des-anula**: el estado se
  recalcula a `pagado`, `abonado` o `credito` (`:2745`, `:2806`).
- `generateSiigoInvoice` factura ventas anuladas.
- No se mira si ya hay factura emitida ni comisión liquidada.

### 4. La liquidación de comisiones confía en el cliente

`createSettlement` (`commissions.controller.js:382`) guarda el monto que manda el navegador
y marca liquidadas las ventas que le pasen, sin comprobar que sean de ese comisionista, que
no estén ya liquidadas ni que no estén anuladas.

La causa de las ventas 84 y 86 está en el frontend: `CommissionAgents.tsx:122` suma lo
pendiente con `!s.isSettled` y **no excluye las anuladas**. El 2026-09-09 se liquidaron
$161.367 y $125.350 de comisión sobre dos ventas anuladas.

El neto de la comisión de cada venta también se calcula en el navegador
(`Step3Payment.tsx:402`) y el servidor lo guarda tal cual.

### 5. El alcance `own` solo se aplica en ventas e itinerarios

`clients.getById`, `update` y `toggleStatus` no lo comprueban. Lo más expuesto es
`/clients/:id?includeSales=true`, que es lo que pide el frontend: devuelve hasta 50 ventas
del cliente de cualquier asesor, con sus detalles. Hoy solo afectaría a un freelancer
(`clients.view = own`), y no hay ninguno activo.

### 6. Código muerto en el camino del dinero

Unas 1.300 líneas: `createProductItems` (`:1707`), `deleteSale` (`:2822`), `uploadVoucher`,
todo `products.controller.js` y la rama de productos de `update` (`:2366`–`:2593`). La
interfaz solo manda `{status, isCredit}` a `PUT /sales/:id`, y esa rama ni siquiera sabe
borrar un producto entre varios. El armado de tramos y pasajeros está copiado tres veces.

### 7. Borrado lógico a medias

`DELETE /sales/:id` marca `deleted_at`, pero el listado y `getById` no filtran por esa
columna y las estadísticas sí. La interfaz no llama a ese endpoint.

### 8. Siigo sin timeout

El cliente HTTP de Siigo no tiene timeout (`siigo.service.js:11`). Si Siigo crea la
factura y la respuesta se pierde, la fila queda `pendiente` y un reintento crea otra.

### Menores

CORS acepta cualquier `*.vercel.app` con credenciales; la cookie `token` del login no la lee
nadie; los correos de voucher interpolan el nombre del cliente sin `escaparHtml`;
`console.log` con datos de pasajeros en `create`; el `DataContext` convierte un error de red
en "no hay ventas" con `.catch(() => ({ data: [] }))`.

## Objetivo

Al terminar:

- El estado de una venta es siempre función de sus pagos y su total, calculada en el
  servidor, y una venta anulada no sale de `anulado` por ningún camino.
- Una liquidación solo incluye ventas del comisionista, pendientes y no anuladas, y su monto
  es la suma de sus netos.
- No existe ningún endpoint de escritura que la interfaz no use.
- Un freelancer no puede leer ni editar clientes ajenos.
- Una factura de Siigo que no respondió no se puede reintentar a ciegas.

## Fuera de alcance

- **Mover el token de localStorage a una cookie httpOnly.** Es la defensa de fondo contra un
  XSS que robe la sesión, pero obliga a resolver CSRF y toca todo el cliente HTTP. Va a
  "Lo que queda abierto" de la spec de autenticación.
- **Corregir las ventas 84, 86 y 93.** Son datos de negocio: alguien tiene que decidir si se
  recupera la comisión y cuál de los dos totales de la 93 es el bueno. Este plan las lista,
  no las toca.
- **`strict` de TypeScript, los 384 `any`, el borrador del asistente en localStorage** y
  `.superpowers/` versionado. Son deuda, no vulnerabilidades.
- **Editar productos de una venta ya creada.** Hoy no existe en la interfaz; si se quiere,
  es una feature con su propio diseño, no un arreglo.

## Decisiones (aceptadas el 2026-10-23)

| | Pregunta | Propuesta | Necesaria para |
|---|---|---|---|
| **D1** | ¿Existe una venta "pagada" sin ningún pago registrado (p. ej., el cliente le pagó directo al proveedor)? | No. En producción, 0 de 151 ventas `pagado` lo son sin pagos que las cubran. Se quita la opción. | F1 |
| **D2** | ¿Anular una venta con factura emitida en Siigo? | Se permite, pero la respuesta avisa que hace falta una nota crédito en Siigo. Bloquearlo dejaría la venta viva en la app y muerta en la realidad. | F2 |
| **D3** | ¿Anular una venta con la comisión ya liquidada? | Se permite con el mismo aviso: la comisión pagada no se revierte sola. | F2 |
| **D4** | ¿Alguna vez se le paga a un comisionista un monto distinto de la suma de sus netos? | No. La única liquidación de producción cuadra al peso. El servidor deriva el monto. | F3 |
| **D5** | ¿Quieren borrar ventas, aparte de anularlas? | No. Se quita `DELETE /sales/:id`: anular es el flujo y deja rastro. | F4 |
| **D6** | ¿Los deploys de preview de Vercel tienen que poder llamar al backend de producción? | No. CORS solo con `FRONTEND_URL`, el dominio propio y localhost. | F7 |

## Fases

Cada fase es una rama desde `main` y un PR. El orden va por riesgo real: primero lo que
mueve plata en la interfaz de hoy.

La "prueba que falla" es una consulta o un `curl` que muestra el problema antes del cambio y
da lo esperado después. Las que necesitan la app levantada piden permiso (regla 4 del
`CLAUDE.md`); `tsc`, `node --check` y las lecturas SQL, no.

### F1 — El estado de la venta lo deriva el servidor · `fix/estado-venta-derivado`

Hallazgo 1. Depende de D1.

- [x] **T1.1** Una función `estadoDeVenta(montoTotal, sumaPagos)` en `sales.controller.js`,
  con la misma tolerancia de $1 que `registerPayment`. La usan `create`, `registerPayment`
  y `deletePayment`; las dos últimas ya calculan esto a mano, así que se reemplaza, no se
  agrega.
- [x] **T1.2** `create`: el estado y `esCredito` salen de `estadoDeVenta` con los pagos del
  request; si los pagos superan el total, 409 `SALDO_INSUFICIENTE`. Se ignora `data.status`.
- [x] **T1.3** `update`: se deja de aceptar `status`, `isCredit` y `payments`, y se borra la
  rama `data.payments` (`:2332`–`:2364`). Los pagos ya tienen sus endpoints.
- [x] **T1.4** `Step3Payment.tsx`: sin pagos y con total mayor que cero, la única opción es
  "Crédito". El `useEffect` que escribe el estado pasa a valor derivado en el render, como
  pide el `CLAUDE.md`.

  *Notas de implementación:* el selector quedó como campo de solo lectura, porque con D1
  el estado ya no tiene opciones. `status` e `isCredit` salieron del formulario y del
  payload. `create` además guarda `montoPagadoCredito` como la suma de los pagos (antes
  guardaba `creditPaidAmount`, que el asistente nunca mandaba, y quedaba en 0), así que el
  voucher de una venta pagada al crearla muestra "Abonado", como ya pasaba con las pagadas
  después.
- [x] **T1.5** `SaleEditModal.tsx`: el selector de estado y su `useEffect` se reemplazan por
  el estado derivado; "Guardar" solo cierra, porque los pagos ya se guardaron al
  registrarlos.

  *Notas de implementación:* el botón "Actualizar" se quitó y queda solo "Cerrar". Con eso
  la interfaz deja de llamar a `PUT /sales/:id`: F4 puede borrar el endpoint entero en vez
  de recortarlo.

**Verificación**

```sql
-- Antes: 2 en local. Después de crear una venta de prueba con status=pagado y sin pagos: sigue en 2.
SELECT count(*) FROM ventas v WHERE v.status = 'pagado'
   AND v.monto_total - COALESCE((SELECT sum(monto) FROM pagos_venta p WHERE p.venta_id = v.id), 0) > 1;
```

`curl -X POST /sales` con `"status": "pagado"` y sin pagos debe crear la venta en `credito`
(con permiso). T1.4 y T1.5 son de interfaz: **no se pueden verificar visualmente**.

### F2 — Una venta anulada se queda anulada · `fix/reglas-de-anulacion`

Hallazgo 3. Depende de D2 y D3. Usa `estadoDeVenta` de F1.

- [x] **T2.1** `registerPayment` y `deletePayment` responden 409 `VENTA_ANULADA` si la venta
  está anulada.
- [x] **T2.2** `generateSiigoInvoice` responde 409 `VENTA_ANULADA` antes de registrar el
  intento.
- [x] **T2.3** `voidSale` responde 409 si ya está anulada; si tiene factura `emitida` o
  `comisionLiquidada`, anula igual y devuelve los avisos.
- [x] **T2.4** El frontend muestra esos avisos al anular. **Interfaz: no verificable
  visualmente.**
- [x] **T2.5** Spec `dinero-y-totales`: agregar "una venta anulada no sale de `anulado`" y la
  consulta de abajo.

**Verificación**: con una venta anulada de prueba, `POST /:id/payments`,
`DELETE /:id/payments/:pid` y `POST /:id/invoice` dan 409 (con permiso). Antes del cambio,
el `DELETE` de un pago la devuelve a `credito` o `abonado`. Después:

```sql
SELECT status, (SELECT count(*) FROM pagos_venta WHERE venta_id = v.id) AS pagos
  FROM ventas v WHERE id = <venta de prueba>;  -- sigue 'anulado', con los mismos pagos
```

### F3 — La liquidación de comisiones se deriva · `fix/liquidacion-derivada`

Hallazgo 4. Depende de D4.

- [x] **T3.1** `createSettlement`: dentro de la transacción, `SELECT ... FOR UPDATE` de las
  ventas pedidas; 409 si alguna no es del comisionista, ya está liquidada, está anulada o
  tiene `deleted_at`. El monto es la suma de `monto_comision_neto`; `data.amount` se ignora.
- [x] **T3.2** `create` y `update` de ventas: `montoComisionNeto` se calcula en el servidor
  con el bruto y el porcentaje de retención. Se ignora el neto que llega.
- [x] **T3.3** `CommissionAgents.tsx:122`: excluir `status === 'anulado'` del acumulado. Es
  la causa de las ventas 84 y 86.
- [x] **T3.4** Registrar las ventas 84 y 86 en "Lo que queda abierto" de la spec, para que
  alguien decida si se recupera la comisión.

**Verificación** (las cuatro deben dar 0, salvo la de anuladas, que hoy da 2 y no debe
crecer):

```sql
SELECT count(*) FROM (SELECT venta_id FROM liquidacion_ventas GROUP BY 1 HAVING count(*) > 1) x;
SELECT count(*) FROM liquidacion_ventas lv JOIN liquidaciones_comision l ON l.id = lv.liquidacion_id
  JOIN ventas v ON v.id = lv.venta_id WHERE v.comisionista_id IS DISTINCT FROM l.comisionista_id;
SELECT count(*) FROM liquidaciones_comision l WHERE abs(l.monto - COALESCE((SELECT sum(v.monto_comision_neto)
  FROM liquidacion_ventas lv JOIN ventas v ON v.id = lv.venta_id WHERE lv.liquidacion_id = l.id), 0)) > 1;
SELECT count(*) FROM liquidacion_ventas lv JOIN ventas v ON v.id = lv.venta_id WHERE v.status = 'anulado';
```

### F4 — Borrar lo que nadie usa · `fix/quitar-endpoints-sin-uso`

Hallazgos 2, 6 y 7. Depende de D5. Es casi todo borrado, por eso va antes que lo menos
urgente.

- [x] **T4.1** Quitar las 51 rutas de producto de `sales.routes.js` y borrar
  `products.controller.js`.
- [x] **T4.2** Quitar `createProduct`, `updateProduct` y `deleteProduct` de
  `frontend/src/api/sales.ts` y `api/index.ts`.
- [x] **T4.3** Borrar `createProductItems` y `deleteSale` de `sales.controller.js`, y la
  rama de productos de `update`.
- [x] **T4.4** Quitar `DELETE /sales/:id`, `remove`, y `deleteSale` del `DataContext` y de la
  API del frontend. Lo mismo con `PUT /sales/:id`, `update` y `updateSale`: desde F1 nadie
  los llama.
- [x] **T4.5** `CLAUDE.md`: la sección "Cuidado con los dos controladores" deja de aplicar.
  Spec de autenticación: corregir el conteo de rutas con `ventaPropia`.

**Verificación**: `grep -rn "products/\|createProductItems\|deleteSale" backend/src frontend/src`
sin resultados; `node --check` y `npx tsc --noEmit` en verde; con permiso,
`PUT /sales/1/products/hotel/x` da 404.

### F5 — Siigo no se reintenta a ciegas · `fix/siigo-timeout`

Hallazgo 8.

- [x] **T5.1** `timeout` en la instancia `http` de `siigo.service.js`.
- [x] **T5.2** Si la llamada que crea la factura se corta por timeout o por red, la fila
  queda `fallida` con un `ultimoError` que diga que Siigo **pudo haberla creado** y que hay
  que revisarlo allá antes de reintentar. El detalle de la venta lo muestra.
- [x] **T5.3** Spec `facturacion-siigo`: el caso nuevo en "Lo que queda abierto". La
  búsqueda automática de la factura en Siigo antes de reintentar queda pendiente: no se
  puede probar, porque las credenciales de sandbox no autentican.

**Verificación**: solo por lectura de código y con el dry run. El camino real de Siigo no se
puede ejercitar desde local (ver spec de facturación).

### F6 — Alcance `own` en clientes · `fix/clientes-alcance-propio`

Hallazgo 5. Hoy no afecta a nadie; **tiene que estar antes de activar un freelancer**.

- [ ] **T6.1** `clients.getById`: con `clients.view = own` y un cliente creado por otro,
  404 (como `ventaPropia`). Con `includeSales`, filtrar por `usuarioId` si `sales.view` es
  `own`.
- [ ] **T6.2** `clients.update` y `toggleStatus`: la misma guarda con el alcance de edición.
- [ ] **T6.3** Spec de autenticación: agregar clientes a la tabla de "Dónde vive la regla".

Responsables queda fuera: ningún rol tiene ahí alcance `own` hoy.

**Verificación**: con un token de un freelancer de prueba en local (con permiso),
`GET /clients/<ajeno>` da 404.

### F7 — Menores · `fix/endurecimiento-menor`

Depende de D6.

- [x] **T7.1** Quitar la cookie `token` del login (`auth.controller.js:108`) y el
  `*.vercel.app` de CORS (`index.js:59`).
- [x] **T7.2** `escaparHtml` en los dos correos de voucher.
- [x] **T7.3** Quitar los `console.log` con datos de pasajeros de `create`.
- [x] **T7.4** `DataContext`: un error al cargar se muestra como error, no como lista vacía.
  **Interfaz: no verificable visualmente.**

## Riesgos y desconocidos

- **F1 cambia cómo trabaja el equipo** si alguien usaba "Completada" sin registrar el pago.
  En producción nadie lo hizo, pero la opción existe; conviene avisar antes del deploy.
- **F4 borra un endpoint público.** Si algo externo (un script, una integración) lo usara,
  dejaría de funcionar. En el repo no hay nada que lo llame.
- **Mergear a `main` despliega** y Render no tiene paso de aprobación. Ninguna fase trae
  migraciones, así que no hay `migrate deploy` que pueda fallar.
- **Una sola instancia**: el lock de facturación y la caché de sesiones siguen en memoria.
  No cambia con este plan.

## Estado

- **F1**: implementada en `fix/estado-venta-derivado` y verificada el 2026-10-23 contra la
  API local con una colección de Postman (8 casos: estado ignorado, pagos de más, pago
  completo, pago parcial, falta de responsable, pago en cero, PUT con estado y pagos), todos
  en verde. `tsc` y `node --check` en verde. Sin commitear.
- **F2**: implementada en `fix/reglas-de-anulacion`, que sale de la rama de F1. Verificada el 2026-10-23 con
  una colección de Postman (13 casos), en verde. `tsc` y `node --check` en verde. *Notas de implementación:*
  `voidSale` respondía sus errores con `{ status, message }` y el frontend no veía el
  motivo; pasó a la forma estándar. Los avisos se muestran en el mensaje de éxito, 12
  segundos en vez de 3.
- **F3**: implementada en `fix/liquidacion-derivada`, que sale de `feat-bayrol` (F1 y F2
  ya mergeadas ahí). Verificada el 2026-10-24 con una colección de Postman (12 casos), en verde. `tsc` y
  `node --check` en verde.
  *Notas de implementación:* la causa de las ventas 84 y 86 estaba en dos lugares, el
  acumulado de `CommissionAgents.tsx` y la lista de ventas que arma `settleCommissions`
  en el `DataContext`; los dos usan ahora `comisionPendiente()`. Una liquidación sin
  ventas se rechaza (400): con el monto derivado valdría cero.
- **Punto 8** (fuera del plan original, aceptado el 2026-10-24): `create` rechaza una venta
  sin productos (400) en vez de tomar el total del cliente. En `fix/liquidacion-derivada`;
  verificada el 2026-10-24 con una colección de Postman (3 casos), en verde.
- **F4**: implementada en `fix/quitar-endpoints-sin-uso`, que sale de `feat-bayrol`. Se
  fueron 56 rutas (54 de producto suelto, `PUT` y `DELETE /sales/:id`),
  `products.controller.js` entero y, del controlador de ventas, `update`, `remove`,
  `deleteSale`, `createProductItems` y `crearPagosProveedor`, que quedó sin uso. En el
  frontend, `updateSale`, `deleteSale` y las tres funciones de producto. `tsc` y
  `node --check` en verde. Verificada el 2026-10-24 con una colección de Postman (6 rutas
  quitadas dan 404 y 7 que quedan siguen andando), en verde.
- **F5**: implementada en `fix/siigo-timeout`. Timeout de 30 s en el cliente HTTP de Siigo;
  una emisión sin respuesta da 504 `SIIGO_SIN_RESPUESTA` y queda `fallida` con el aviso de
  revisar en Siigo. Verificada el 2026-10-24 con una autoverificación contra un servidor
  HTTP local que hace de Siigo: uno que nunca responde da `SIIGO_SIN_RESPUESTA` a los 32 s,
  y uno que responde 400 sigue dando `SIIGO_RECHAZO`. El camino real de Siigo no se probó.
- **F7**: implementada en `fix/endurecimiento-menor`, que sale de la rama de F5.
  *Notas de implementación:* además de la cookie se quitó `cookie-parser` del arranque
  (nadie lee cookies); la dependencia sigue en `package.json`. Los logs de `create`
  dejaron de imprimir el body y el correo del cliente; un voucher que no se pudo enviar
  se loguea con el número de venta. El aviso de carga fallida no se muestra para 401/403,
  que son listados que ese rol no tiene permitidos. `tsc` y `node --check` en verde.
  Verificada el 2026-10-24 con una colección de Postman (login y logout sin cookie, origen
  `*.vercel.app` ajeno rechazado, los propios aceptados), en verde. El aviso en pantalla,
  los correos y los logs no se probaron ahí.
- **F6**: queda para el plan de permisos.
