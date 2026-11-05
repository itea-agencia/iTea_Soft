-- Rellena `tipo_tramo` en los tramos de vuelo que quedaron en NULL al agregar la columna
-- (migracion 20261105124614_tipo_tramo, docs/designs/escalas-por-tramo-2026-11.md).
--
-- Son ventas creadas antes de esa migracion: el servidor no les guardo que seccion del
-- formulario armo cada tramo, asi que no se puede saber cual fue escala (invariante 4).
-- Por eso esta migracion, segun la decision D1 del plan, solo les pone el sentido con la
-- MISMA regla que ya usaba `flights.controller.js` para adivinarlo en pantalla: ninguna
-- queda marcada como escala.
--
-- La regla (ver flights.controller.js, bloque "Venta anterior a esa migracion"):
--   - Si el producto no es round_trip: todos sus tramos son 'ida'.
--   - Si es round_trip y tiene mas de una fecha local (America/Bogota) entre sus tramos:
--     los del primer dia son 'ida', el resto 'regreso'.
--   - Si es round_trip y todos sus tramos caen el mismo dia: el tramo de menor `orden` es
--     'ida', el resto 'regreso'.
--
-- `salida` es `timestamp without time zone`: se guardo sin zona horaria, tratando el valor
-- como UTC (asi lo escribe el driver). Para agrupar por el mismo dia que ve el asesor en
-- pantalla hay que reproducir la misma conversion que hace el codigo: tratarla como UTC y
-- pasarla a America/Bogota antes de truncar a fecha. Si esta cuenta no coincidiera con la
-- que ya ve `flights.list`, la comprobacion del paso 4 lo muestra antes del COMMIT.
--
-- Solo toca filas con tipo_tramo IS NULL: no vuelve a tocar nada si se corre dos veces.

BEGIN;

-- 0. Snapshot del total para la guarda del final (esta transaccion no inserta ni borra
-- filas, solo actualiza; esto lo prueba en vez de suponerlo).
CREATE TEMP TABLE _snapshot_total AS SELECT count(*) AS total FROM tramos_vuelo;

-- 1. Antes
SELECT 'antes' AS momento, count(*) AS total, count(*) FILTER (WHERE tipo_tramo IS NULL) AS nulos
FROM tramos_vuelo;

WITH tramos_fecha AS (
  SELECT
    tv.id,
    tv.prod_tiqueteria_id,
    tv.orden,
    pt.modo_vuelo,
    (tv.salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date AS fecha_local
  FROM tramos_vuelo tv
  JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
  WHERE tv.tipo_tramo IS NULL
),
primer_tramo AS (
  -- El tramo de menor `orden` de cada producto: equivale a `ptramos[0]` despues de
  -- ordenar por orden, que es lo que usa `flights.controller.js` para decidir el "primer
  -- dia" y, si todos caen el mismo dia, cual es la ida.
  SELECT DISTINCT ON (prod_tiqueteria_id) prod_tiqueteria_id, orden AS orden_min, fecha_local AS fecha_ida
  FROM tramos_fecha
  ORDER BY prod_tiqueteria_id, orden ASC
),
resumen AS (
  SELECT prod_tiqueteria_id, count(DISTINCT fecha_local) AS fechas_distintas
  FROM tramos_fecha
  GROUP BY prod_tiqueteria_id
)
UPDATE tramos_vuelo tv
SET tipo_tramo = (CASE
  WHEN tf.modo_vuelo IS DISTINCT FROM 'round_trip' THEN 'ida'
  WHEN r.fechas_distintas >= 2 THEN (CASE WHEN tf.fecha_local = p.fecha_ida THEN 'ida' ELSE 'regreso' END)
  ELSE (CASE WHEN tf.orden = p.orden_min THEN 'ida' ELSE 'regreso' END)
END)::"TipoTramo"
FROM tramos_fecha tf
JOIN resumen r USING (prod_tiqueteria_id)
JOIN primer_tramo p USING (prod_tiqueteria_id)
WHERE tv.id = tf.id;

-- 2. Despues: por tipo, y 0 esperado en escala_ida/escala_regreso
SELECT 'despues' AS momento, tipo_tramo, count(*)
FROM tramos_vuelo
GROUP BY tipo_tramo
ORDER BY tipo_tramo;

-- 3. Guarda: 0 en NULL, y el total de tramos no cambio (solo se actualizo, no se movio nada)
DO $$
DECLARE
  nulos int;
  total_antes int;
  total_despues int;
BEGIN
  SELECT count(*) INTO nulos FROM tramos_vuelo WHERE tipo_tramo IS NULL;
  IF nulos > 0 THEN
    RAISE EXCEPTION 'Quedaron % tramo(s) en NULL; no deberia pasar', nulos;
  END IF;

  SELECT total INTO total_antes FROM _snapshot_total;
  SELECT count(*) INTO total_despues FROM tramos_vuelo;
  IF total_antes <> total_despues THEN
    RAISE EXCEPTION 'El total de tramos cambio (% -> %); este script no deberia crear ni borrar filas', total_antes, total_despues;
  END IF;
END $$;

-- 4. Comprobacion manual antes de confiar en el COMMIT: comparar el tipo asignado contra
-- lo que ya mostraba `flights.list` (ver flights.controller.js) para una muestra de
-- productos con mas de un tramo. Los dos deben coincidir fila por fila.
SELECT dv.venta_id, pt.id AS prod_tiqueteria_id, pt.modo_vuelo, tv.orden, tv.tipo_tramo,
       (tv.salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date AS fecha_local_tramo
FROM tramos_vuelo tv
JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
JOIN detalle_venta dv ON dv.id = pt.detalle_venta_id
WHERE pt.id IN (
  SELECT prod_tiqueteria_id FROM tramos_vuelo GROUP BY prod_tiqueteria_id HAVING count(*) > 1
)
ORDER BY dv.venta_id, tv.orden;

COMMIT;
