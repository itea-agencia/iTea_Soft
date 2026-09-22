# El servidor manda sobre el dinero, y los agregados se derivan

**Fecha:** 2026-09-17 · **Módulo:** ventas, pagos, facturación

## Los invariantes

1. **Un importe que el servidor puede calcular, lo calcula el servidor.** No se acepta del
   cliente ni como atajo de rendimiento.
2. **Un agregado se deriva de sus partes; no se guarda una copia.** Una copia se
   desincroniza y nadie se entera.

## Qué pasó sin ellos

### El total de la venta llegaba calculado del navegador

```js
montoTotal: data.total || 0,
costoProveedorTotal: data.supplierCost || 0,
```

Ese total se armaba en un `useEffect` de diecisiete líneas casi idénticas que guardaba los
importes como **strings** y los comparaba con `.toString()`, así que podía ir un render
atrasado. Y **Siigo factura contra `montoTotal`**.

Cuando la plata de un paquete se movió a `supplierPayments`, dos sumas siguieron leyendo el
campo suelto `supplierCost` y el paquete aportó **cero**. El efecto en cadena:

- `form.total` en 0 → `Step3Payment` tiene `if (totalSale === 0) set("status", "pagado")`,
  así que **marcaba la venta como pagada sin ningún pago registrado**.
- `ventas.monto_total` en 0 → la factura de Siigo habría salido en cero o la guarda de
  totales habría fallado.

La causa de fondo: "cuánto cuesta este ítem" estaba escrito a mano en **dieciocho lugares**.

### El monto abonado también

```js
registrar:  newPaidAmount = (currentPaidAmount || 0) + amount
borrar:     newPaidAmount = currentPayments.filter(...).reduce(...)
```

El de borrar era el peligroso: si `currentPayments` llegaba **vacío** —lo que pasa siempre
que la venta viene del listado, que no devuelve los pagos— el monto abonado se recalculaba
en **cero** y el estado caía a `credito`, borrando un abono que sí existía en
`pagos_venta`.

### Un pago se sumaba sin techo

*(2026-09-22.)* `registerPayment` sumaba todos los pagos de `pagos_venta` y guardaba esa
suma en `montoPagadoCredito`, sin comprobar que no superara `montoTotal`. En producción, la
venta 64 quedó con **$678.600 pagados sobre un total de $339.300**: dos pagos idénticos de
$339.300, separados por 12 segundos, el patrón de un doble clic o un reintento de red sobre
un botón que no se deshabilitaba mientras la petición estaba en vuelo. El dato de esa venta
se dejó como está —es historia del software, no afectó factura ni comisión (comisión en
$0, sin factura en Siigo)—, pero el código que lo permitió se corrigió: ver más abajo.

### Los endpoints de producto suelto desfasaban el total

Crear, editar o borrar por `POST/PUT/DELETE /sales/:id/products/*` tocaba `detalle_venta`
pero nunca `ventas.monto_total`. En local una venta llegó a decir **$60.000** con filas que
sumaban **$8.165.000**.

## Dónde vive la regla

| Regla | Dónde |
|---|---|
| Totales de la venta al crear | `calcularTotales()` en `sales.controller.js`, recorre `PRODUCT_HANDLERS` para que un producto nuevo no quede fuera por olvido |
| Totales al actualizar | se recalculan desde las filas al cerrar la transacción de `update` |
| Totales al tocar un producto suelto | `recalcularTotalesVenta()` en `products.controller.js`, llamado por create, update y delete |
| Importes de un ítem | `financierosDe()` en el backend, `importesDe()` en `wizardData.ts`. **Una función por lado**, no dieciocho |
| Monto abonado | `registerPayment` y `deletePayment` suman desde `pagos_venta` dentro de la transacción |
| Que lo pagado no supere el total | `registerPayment` calcula el saldo pendiente y rechaza (409) lo que lo exceda, o cualquier pago si el saldo ya es cero. `SELECT ... FOR UPDATE` sobre la venta serializa dos registros casi simultáneos del mismo pago |
| Total de un paquete | `agregarPorPadre()` lo deriva de sus filas de pago y sus servicios vinculados. **No se guarda** |

`detalle_venta.costo_proveedor`, `ta` y `ta_cre` de un paquete se mantienen **iguales a la
suma de sus `pagos_proveedor`**. Eso es deliberado: deja intactos los totales de la venta,
el agregado por paquete y la guarda de totales de Siigo, que siguen sumando detalles.

Los campos `currentPaidAmount`, `currentPayments` y `saleTotal` se siguen aceptando en el
body por compatibilidad, pero **ya no deciden nada**.

## Cómo verificarlo

El total de cada venta tiene que ser la suma de sus detalles:

```sql
SELECT v.id, v.monto_total,
       (SELECT sum(costo_proveedor + ta + ta_cre) FROM detalle_venta WHERE venta_id = v.id) AS suma
FROM ventas v
WHERE v.monto_total IS DISTINCT FROM
      (SELECT COALESCE(sum(costo_proveedor + ta + ta_cre),0) FROM detalle_venta WHERE venta_id = v.id);
```

Y un paquete con pagos tiene que cuadrar al peso con ellos: esa comprobación está dentro de
`backend/db-manual/backfill_pagos_proveedor_paquetes.sql`, que aborta si algo no cuadra.

## Lo que queda abierto

- **El `useEffect` de totales del wizard sigue escribiendo estado derivado.** Ahora que el
  servidor calcula el que persiste, ese cálculo es solo vista previa; reescribirlo arrastra
  la comisión, que también se escribe desde `Step3Payment` y `Step1Client`.
- **`monto_pagado_credito` difiere de la suma de pagos en varias ventas `pagado` y
  `anulado`** (39 y 2 al 17 de septiembre). Ahí queda en cero y la suma de pagos es el
  total, lo que es coherente con que esa columna siga solo los abonos a crédito, no un pago
  completo al vender. Si esa lectura no es la correcta, hay que revisarlo.
- **La venta 64 queda por encima del total** (ver arriba): es el único caso conocido, y se
  decidió no corregirlo. Conviene repetir esta consulta de vez en cuando por si aparece
  otro, ya que el guardarraíl es nuevo y no repara lo que pasó antes de él:

  ```sql
  SELECT id, status, monto_total, monto_pagado_credito FROM ventas
   WHERE monto_pagado_credito > monto_total;
  ```
