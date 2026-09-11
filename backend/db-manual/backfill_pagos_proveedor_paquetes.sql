-- Convierte el costo propio de los paquetes en una fila de pago a proveedor.
--
-- Antes, un paquete llevaba un solo proveedor y un solo costo en `detalle_venta`. Ahora
-- el costo vive en `pagos_proveedor`, una fila por concepto, porque un paquete se le
-- compra a varios proveedores a la vez y a cada uno se le paga aparte.
--
-- Los paquetes que ya existen tienen un unico proveedor, asi que se convierten en una
-- fila de concepto 'paquete', que se factura como IT/IP Paquetes (022/023) con centro de
-- costo Paquetes: exactamente como se facturan hoy. La migracion NO cambia ningun total
-- ni ninguna factura, solo mueve el dato a su lugar nuevo.
--
-- Es idempotente: no toca los paquetes que ya tienen filas de pago.

BEGIN;

-- 1. Antes
SELECT 'antes' AS momento,
       count(*) AS paquetes,
       count(*) FILTER (WHERE EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id)) AS con_pagos
FROM prod_planes pl JOIN detalle_venta dv ON dv.id = pl.detalle_venta_id;

-- 2. Una fila de pago por cada paquete con costo propio y sin pagos todavia
INSERT INTO pagos_proveedor
  (id, detalle_venta_id, concepto, proveedor_id, costo_proveedor, ta, ta_cre, metodo_pago_proveedor_id, orden)
SELECT gen_random_uuid(), dv.id, 'paquete', dv.proveedor_id,
       COALESCE(dv.costo_proveedor, 0), COALESCE(dv.ta, 0), COALESCE(dv.ta_cre, 0),
       dv.metodo_pago_proveedor_id, 1
FROM prod_planes pl
JOIN detalle_venta dv ON dv.id = pl.detalle_venta_id
WHERE (COALESCE(dv.costo_proveedor,0) > 0 OR COALESCE(dv.ta,0) > 0 OR COALESCE(dv.ta_cre,0) > 0)
  AND NOT EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id);

-- 3. Despues: el detalle y sus pagos tienen que coincidir al peso
SELECT dv.venta_id, pl.tipo_paquete,
       COALESCE(pr.nombre,'(sin proveedor)') AS proveedor,
       dv.costo_proveedor AS detalle_costo,
       (SELECT sum(pp.costo_proveedor) FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id) AS pagos_costo,
       dv.ta AS detalle_ta,
       (SELECT sum(pp.ta) FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id) AS pagos_ta
FROM prod_planes pl
JOIN detalle_venta dv ON dv.id = pl.detalle_venta_id
LEFT JOIN proveedores pr ON pr.id = dv.proveedor_id
ORDER BY dv.venta_id;

-- 4. Guarda: si algun detalle no cuadra con sus pagos, se aborta
DO $$
DECLARE descuadres int;
BEGIN
  SELECT count(*) INTO descuadres
  FROM prod_planes pl
  JOIN detalle_venta dv ON dv.id = pl.detalle_venta_id
  WHERE EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id)
    AND ROUND((COALESCE(dv.costo_proveedor,0) + COALESCE(dv.ta,0) + COALESCE(dv.ta_cre,0))::numeric, 2)
      <> ROUND((SELECT COALESCE(sum(pp.costo_proveedor + pp.ta + pp.ta_cre), 0)
                FROM pagos_proveedor pp WHERE pp.detalle_venta_id = dv.id)::numeric, 2);
  IF descuadres > 0 THEN
    RAISE EXCEPTION 'Hay % paquete(s) cuyo detalle no cuadra con sus pagos; no se aplica nada', descuadres;
  END IF;
END $$;

COMMIT;
