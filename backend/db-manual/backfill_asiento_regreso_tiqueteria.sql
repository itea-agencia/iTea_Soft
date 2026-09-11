-- Rescata el asiento de regreso que quedo guardado en el tramo.
--
-- Antes de este cambio, tiqueteria no tenia asiento de regreso por pasajero, asi que ese
-- dato se guardaba en `tramos_vuelo.asiento` del tramo 2, donde es uno solo para todos
-- los pasajeros del tiquete. Ahora vive en `pasajeros_detalle.asiento_regreso`.
--
-- Solo se migra donde no hay ambiguedad: tiquetes de UN pasajero. Si el tiquete tiene
-- varios, el asiento del tramo no dice de quien es y lo tiene que resolver una persona;
-- esos casos se listan al final y no se tocan.

BEGIN;

-- 1. Antes
SELECT 'antes' AS momento,
       count(*) FILTER (WHERE pd.asiento_regreso IS NOT NULL AND pd.asiento_regreso <> '') AS con_asiento_regreso
FROM pasajeros_detalle pd
JOIN detalle_venta dv ON dv.id = pd.detalle_venta_id
WHERE dv.categoria = 'tiqueteria';

-- 2. Migrar los tiquetes de un solo pasajero
UPDATE pasajeros_detalle pd
SET asiento_regreso = tv.asiento
FROM detalle_venta dv, prod_tiqueteria pt, tramos_vuelo tv
WHERE pd.detalle_venta_id = dv.id
  AND pt.detalle_venta_id = dv.id
  AND tv.prod_tiqueteria_id = pt.id
  AND tv.orden = 2
  AND dv.categoria = 'tiqueteria'
  AND tv.asiento IS NOT NULL AND tv.asiento <> ''
  AND (pd.asiento_regreso IS NULL OR pd.asiento_regreso = '')
  AND (SELECT count(*) FROM pasajeros_detalle x WHERE x.detalle_venta_id = dv.id) = 1;

-- 2b. Venta 142, resuelta por el usuario.
--
-- Los dos pasajeros comparten los tramos 12B (ida) y 7A (regreso), asi que el asiento del
-- tramo no dice de quien es. Ademas Diana tenia los dos asientos escritos en el campo de
-- ida como "12A - 7B", porque no habia donde poner el de regreso.
--
--   Sandis Gabriel Martinez Ramos (98655169)  ida 12B   regreso 7A
--   Diana Cristina Cardona        (43918065)  ida 12A   regreso 7B
--
-- Se escriben valores absolutos, asi que correr esto dos veces no hace daño.
UPDATE pasajeros_detalle pd
SET asiento = v.ida, asiento_regreso = v.regreso
FROM detalle_venta dv, personas pe,
     (VALUES ('98655169', '12B', '7A'),
             ('43918065', '12A', '7B')) AS v(documento, ida, regreso)
WHERE pd.detalle_venta_id = dv.id
  AND pe.id = pd.persona_id
  AND dv.venta_id = 142
  AND dv.categoria = 'tiqueteria'
  AND pe.documento = v.documento;

-- 3. Despues
SELECT 'despues' AS momento,
       count(*) FILTER (WHERE pd.asiento_regreso IS NOT NULL AND pd.asiento_regreso <> '') AS con_asiento_regreso
FROM pasajeros_detalle pd
JOIN detalle_venta dv ON dv.id = pd.detalle_venta_id
WHERE dv.categoria = 'tiqueteria';

-- 4. Lo que queda para revisar a mano
SELECT dv.venta_id,
       (SELECT count(*) FROM pasajeros_detalle x WHERE x.detalle_venta_id = dv.id) AS pasajeros,
       string_agg(DISTINCT tv.orden || ':' || tv.asiento, ' | ' ORDER BY tv.orden || ':' || tv.asiento) AS asientos_en_tramos,
       (SELECT string_agg(COALESCE(x.asiento,'(vacio)') || '/' || COALESCE(x.asiento_regreso,'(vacio)'), ', ')
          FROM pasajeros_detalle x WHERE x.detalle_venta_id = dv.id) AS pasajeros_ida_regreso
FROM tramos_vuelo tv
JOIN prod_tiqueteria pt ON pt.id = tv.prod_tiqueteria_id
JOIN detalle_venta dv ON dv.id = pt.detalle_venta_id
WHERE tv.asiento IS NOT NULL AND tv.asiento <> ''
  AND (SELECT count(*) FROM pasajeros_detalle x WHERE x.detalle_venta_id = dv.id) > 1
GROUP BY dv.id, dv.venta_id
ORDER BY dv.venta_id;

COMMIT;
