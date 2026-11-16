-- Asigna la tarjeta de la agencia a los pagos a proveedores hechos antes de que se guardara.
--
-- Hasta 2026-11 el formulario mostraba las tarjetas de la agencia, pero se guardaba solo su
-- metodo generico y se perdia con que tarjeta se pago. La migracion
-- 20261116120000_tarjeta_agencia_en_pagos_proveedor agrega tarjeta_agencia_id; este script la
-- llena en las ventas viejas con la regla que dio el usuario (2026-11-16): la mayoria se pago
-- con "Samtur Bancolombia Negocios" y lo de Clic Air con "PRECOMPRAS CLIC AIR". Solo toca las
-- filas donde el proveedor y el metodo guardado coinciden con esa regla; las de Efectivo,
-- CTA CTE 2060 y la de Tarjeta de Debito de VIAJES COLOMBIA ONLINE quedan como estan.
--
-- A las filas que reciben tarjeta se les deja el metodo vacio: el metodo se deduce de la
-- tarjeta al leer, asi que corregir el metodo de la tarjeta en Configuracion corrige todas.
-- Los conteos esperados son los medidos en produccion el 2026-11-16; si no coinciden, aborta.
-- Diseño docs/designs/catalogo-por-id-2026-11.md.

\set ON_ERROR_STOP on

BEGIN;

\echo '--- ANTES: filas sin tarjeta por proveedor y metodo (productos sin pagos de paquete)'
SELECT coalesce(pr.nombre, '(sin proveedor)') AS proveedor, coalesce(m.nombre, '(sin metodo)') AS metodo, count(*)
  FROM detalle_venta d
  LEFT JOIN proveedores pr ON pr.id = d.proveedor_id
  LEFT JOIN metodos_pago m ON m.id = d.metodo_pago_proveedor_id
 WHERE d.tarjeta_agencia_id IS NULL
   AND d.metodo_pago_proveedor_id IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = d.id)
 GROUP BY 1, 2 ORDER BY 1, 3 DESC;

DO $$
DECLARE
  v_samtur int; v_precompras int; v_clic int; v_vco int;
  v_n int;
BEGIN
  SELECT id INTO STRICT v_samtur FROM tarjetas_agencia WHERE nombre = 'Samtur Bancolombia Negocios';
  SELECT id INTO STRICT v_precompras FROM tarjetas_agencia WHERE nombre = 'PRECOMPRAS CLIC AIR';
  SELECT id INTO STRICT v_clic FROM proveedores WHERE nombre = 'Clic Air';
  SELECT id INTO STRICT v_vco FROM proveedores WHERE nombre = 'VIAJES COLOMBIA ONLINE';

  -- Clic Air, pagado con Tarjeta de Debito o Transferencia: PRECOMPRAS CLIC AIR.
  UPDATE detalle_venta d SET tarjeta_agencia_id = v_precompras, metodo_pago_proveedor_id = NULL
   WHERE d.tarjeta_agencia_id IS NULL
     AND d.proveedor_id = v_clic
     AND d.metodo_pago_proveedor_id IN (SELECT id FROM metodos_pago WHERE nombre IN ('Tarjeta de Débito', 'Transferencia'))
     AND NOT EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = d.id);
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> 45 THEN RAISE EXCEPTION 'PRECOMPRAS: se esperaban 45 productos y son %', v_n; END IF;

  -- Otro proveedor (o ninguno) con Transferencia, y VIAJES COLOMBIA ONLINE con "Tarjeta de
  -- Bancolombia": Samtur Bancolombia Negocios.
  UPDATE detalle_venta d SET tarjeta_agencia_id = v_samtur, metodo_pago_proveedor_id = NULL
   WHERE d.tarjeta_agencia_id IS NULL
     AND NOT EXISTS (SELECT 1 FROM pagos_proveedor pp WHERE pp.detalle_venta_id = d.id)
     AND (
       (d.metodo_pago_proveedor_id = (SELECT id FROM metodos_pago WHERE nombre = 'Transferencia')
        AND d.proveedor_id IS DISTINCT FROM v_clic)
       OR (d.proveedor_id = v_vco
        AND d.metodo_pago_proveedor_id = (SELECT id FROM metodos_pago WHERE nombre = 'Tarjeta de Bancolombia'))
     );
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> 130 THEN RAISE EXCEPTION 'Samtur (productos): se esperaban 130 y son %', v_n; END IF;

  -- Filas de pago de los paquetes con Transferencia: Samtur Bancolombia Negocios.
  UPDATE pagos_proveedor p SET tarjeta_agencia_id = v_samtur, metodo_pago_proveedor_id = NULL
   WHERE p.tarjeta_agencia_id IS NULL
     AND p.metodo_pago_proveedor_id = (SELECT id FROM metodos_pago WHERE nombre = 'Transferencia');
  GET DIAGNOSTICS v_n = ROW_COUNT;
  IF v_n <> 2 THEN RAISE EXCEPTION 'Samtur (pagos de paquete): se esperaban 2 y son %', v_n; END IF;
END $$;

\echo '--- DESPUES: filas por tarjeta (productos y pagos de paquete)'
SELECT 'detalle_venta' AS tabla, coalesce(t.nombre, '(sin tarjeta)') AS tarjeta, count(*)
  FROM detalle_venta d LEFT JOIN tarjetas_agencia t ON t.id = d.tarjeta_agencia_id
 WHERE d.tarjeta_agencia_id IS NOT NULL OR d.metodo_pago_proveedor_id IS NOT NULL
 GROUP BY 1, 2
UNION ALL
SELECT 'pagos_proveedor', coalesce(t.nombre, '(sin tarjeta)'), count(*)
  FROM pagos_proveedor p LEFT JOIN tarjetas_agencia t ON t.id = p.tarjeta_agencia_id
 GROUP BY 1, 2
 ORDER BY 1, 3 DESC;

COMMIT;
