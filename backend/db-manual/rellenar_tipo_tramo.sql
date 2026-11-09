-- Rellena `tramos_vuelo.tipo_tramo` en los tramos de ventas anteriores a esa columna.
--
-- Fase 4 de docs/designs/escalas-por-tramo-2026-11.md. Las ventas nuevas ya lo guardan segun la
-- seccion del formulario; las viejas no tienen como saberlo. Por D1, a las viejas solo se les
-- pone el sentido (ida o regreso) con la MISMA regla que hoy aplica `flights.controller.js`
-- cuando el tipo es NULL, y ninguna queda marcada como escala.
--
-- La regla se copia al pie de la letra, o algun tramo cambia de pestana en Itinerarios:
--   - "Dia" es el dia en Bogota (Intl con timeZone America/Bogota en el controller). `salida`
--     es TIMESTAMP en UTC: con `salida::date` un vuelo de las 19:00 o mas tarde cae al dia
--     siguiente y una ida pasaria a regreso.
--   - "El primer dia" es el del tramo de menor `orden` (el controller ordena por `orden` y toma
--     la primera fecha que aparece), no la fecha minima: con las fechas mal digitadas de las
--     ventas 18 y 190 no es lo mismo.
--   - "El tramo 1" es `orden = 1` literal, como en el controller.
--   - `modo_vuelo` NULL o `one_way` es todo ida (el `else` del controller).
--   - Entran tambien las ventas anuladas y eliminadas: Itinerarios no las muestra, pero la
--     Fase 5 (NOT NULL) necesita que ninguna fila quede en NULL.
--
-- Se acepto (2026-11-05) que el detalle de venta de los productos viejos de varios tramos se
-- vea distinto: con tipo, `PaginatedProductTab.tsx` deja de deducir escalas por ruta. La
-- consulta 2 los lista para revisarlos.
--
-- Idempotente: solo toca filas en NULL. Va DESPUES del deploy de la migracion
-- `20261105124614_tipo_tramo` y del codigo que la lee.

BEGIN;

-- 1. Conteo antes
SELECT count(*) AS tramos_total,
       count(*) FILTER (WHERE tipo_tramo IS NULL) AS tramos_sin_tipo
FROM tramos_vuelo;

CREATE TEMP TABLE conteo_antes ON COMMIT DROP AS SELECT count(*) AS total FROM tramos_vuelo;

-- Guarda: un producto con unos tramos con tipo y otros sin tipo no deberia existir (solo
-- `create` escribe tramos, y escribe todos a la vez). Si existe, la regla de abajo lo
-- clasificaria distinto que el controller, que en ese caso tambien usa la regla vieja.
DO $$
DECLARE mezclados int;
BEGIN
  SELECT count(*) INTO mezclados FROM (
    SELECT prod_tiqueteria_id FROM tramos_vuelo
    GROUP BY 1
    HAVING count(*) FILTER (WHERE tipo_tramo IS NULL) > 0
       AND count(*) FILTER (WHERE tipo_tramo IS NOT NULL) > 0
  ) x;
  IF mezclados > 0 THEN
    RAISE EXCEPTION 'Hay % producto(s) con tramos con y sin tipo; no se aplica nada', mezclados;
  END IF;
END $$;

CREATE TEMP TABLE calculo ON COMMIT DROP AS
WITH t AS (
  SELECT tv.id, tv.prod_tiqueteria_id, tv.orden, pt.modo_vuelo,
         (tv.salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date AS dia,
         first_value((tv.salida AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date)
           OVER (PARTITION BY tv.prod_tiqueteria_id ORDER BY tv.orden, tv.salida) AS primer_dia
  FROM tramos_vuelo tv
  JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
  WHERE tv.tipo_tramo IS NULL
), dias AS (
  SELECT prod_tiqueteria_id, count(DISTINCT dia) AS n FROM t GROUP BY 1
)
SELECT t.id, t.prod_tiqueteria_id,
  CASE
    WHEN t.modo_vuelo IS DISTINCT FROM 'round_trip' THEN 'ida'
    WHEN d.n >= 2 THEN CASE WHEN t.dia = t.primer_dia THEN 'ida' ELSE 'regreso' END
    ELSE CASE WHEN t.orden = 1 THEN 'ida' ELSE 'regreso' END
  END AS tipo
FROM t JOIN dias d USING (prod_tiqueteria_id);

-- 2. Productos de varios tramos: los que pueden verse distinto en el detalle de venta
SELECT dv.venta_id, pt.modo_vuelo, count(*) AS tramos,
       string_agg(tv.orden || ':' || c.tipo, ' ' ORDER BY tv.orden) AS tipos
FROM calculo c
JOIN tramos_vuelo tv ON tv.id = c.id
JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
JOIN detalle_venta dv ON dv.id = pt.detalle_venta_id
GROUP BY dv.venta_id, pt.id, pt.modo_vuelo
HAVING count(*) > 1
ORDER BY dv.venta_id;

-- 3. Rellenar
UPDATE tramos_vuelo tv
SET tipo_tramo = c.tipo::"TipoTramo"
FROM calculo c
WHERE tv.id = c.id AND tv.tipo_tramo IS NULL;

-- 4. Guarda: nada en NULL, el mismo total de tramos, y ningun solo ida con regreso
DO $$
DECLARE nulos int; total_ahora int; total_antes int; regreso_en_solo_ida int;
BEGIN
  SELECT count(*) FILTER (WHERE tipo_tramo IS NULL), count(*) INTO nulos, total_ahora FROM tramos_vuelo;
  SELECT total INTO total_antes FROM conteo_antes;
  SELECT count(*) INTO regreso_en_solo_ida
  FROM tramos_vuelo tv JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
  WHERE pt.modo_vuelo IS DISTINCT FROM 'round_trip' AND tv.tipo_tramo IN ('regreso', 'escala_regreso');
  IF nulos > 0 THEN
    RAISE EXCEPTION 'Quedaron % tramo(s) sin tipo; no se aplica nada', nulos;
  END IF;
  IF total_ahora <> total_antes THEN
    RAISE EXCEPTION 'El total de tramos cambio (% -> %); no se aplica nada', total_antes, total_ahora;
  END IF;
  IF regreso_en_solo_ida > 0 THEN
    RAISE EXCEPTION 'Hay % tramo(s) de regreso en vuelos solo ida; no se aplica nada', regreso_en_solo_ida;
  END IF;
END $$;

-- 5. Conteo despues
SELECT coalesce(tipo_tramo::text, 'NULL') AS tipo_tramo, count(*) FROM tramos_vuelo GROUP BY 1 ORDER BY 1;

COMMIT;
