-- Quita las claves de permiso que el catalogo ya no tiene (backend/src/config/permisos.js):
-- sales.edit y sales.delete (se repartieron en pay/invoice/review/void), clients.delete,
-- itineraries.create/delete y dashboard.create/edit/delete (nunca tuvieron ruta).
--
-- Va DESPUES de que el codigo de los permisos por accion este en produccion: el codigo
-- anterior todavia usa sales.edit y sales.delete, y sin ellos los asesores perderian pagar,
-- facturar y anular. Y despues de agregar_permisos_por_accion.sql: la guarda de abajo aborta
-- si alguna clave vieja no tiene todavia su reemplazo.
--
-- Diseno: docs/designs/permisos-por-rol-2026-10.md ("Datos" y "Despliegue").
--
-- Uso:
--   produccion:  ./quitar_permisos_viejos.sh
--   local:       docker exec -i itea_postgres psql -U postgres -d samtur-development \
--                  -v ON_ERROR_STOP=1 < backend/db-manual/quitar_permisos_viejos.sql
-- Es idempotente: si ya no estan, no borra nada.

\set ON_ERROR_STOP on
BEGIN;

CREATE TEMP TABLE viejas (modulo text, accion text) ON COMMIT DROP;
INSERT INTO viejas VALUES
  ('sales', 'edit'), ('sales', 'delete'), ('clients', 'delete'),
  ('itineraries', 'create'), ('itineraries', 'delete'),
  ('dashboard', 'create'), ('dashboard', 'edit'), ('dashboard', 'delete');

CREATE TEMP TABLE catalogo (clave text) ON COMMIT DROP;
INSERT INTO catalogo VALUES
  ('sales.view'), ('sales.create'), ('sales.pay'), ('sales.invoice'), ('sales.void'), ('sales.review'),
  ('clients.view'), ('clients.create'), ('clients.edit'), ('clients.toggle'),
  ('responsables.view'), ('responsables.create'), ('responsables.edit'), ('responsables.toggle'), ('responsables.delete'),
  ('itineraries.view'), ('itineraries.edit'),
  ('commissions.view'), ('commissions.create'), ('commissions.edit'), ('commissions.delete'), ('commissions.settle'),
  ('dashboard.view'),
  ('users.view'), ('users.create'), ('users.edit'), ('users.toggle'), ('users.delete'),
  ('config.view'), ('config.create'), ('config.edit'), ('config.delete');

\echo '== Antes: filas de claves viejas por rol'
SELECT r.nombre AS rol, p.modulo || '.' || p.accion AS permiso, pr.valor
  FROM permisos_rol pr
  JOIN permisos p ON p.id = pr.permiso_id
  JOIN roles r ON r.id = pr.rol_id
  JOIN viejas v ON v.modulo = p.modulo AND v.accion = p.accion
 ORDER BY 1, 2;

-- Guarda: cada rol no-admin con sales.edit / sales.delete / clients.edit tiene ya sus
-- reemplazos. Si no, agregar_permisos_por_accion.sql no corrio y borrar le quitaria permisos.
DO $$
DECLARE v_faltan int;
BEGIN
  SELECT count(*) INTO v_faltan
    FROM (VALUES ('sales', 'edit', 'sales', 'pay'), ('sales', 'edit', 'sales', 'invoice'),
                 ('sales', 'edit', 'sales', 'review'), ('sales', 'delete', 'sales', 'void')) h(om, oa, dm, da)
    JOIN permisos po ON po.modulo = h.om AND po.accion = h.oa
    JOIN permisos_rol pr ON pr.permiso_id = po.id
    JOIN roles r ON r.id = pr.rol_id AND r.nombre <> 'admin'
   WHERE NOT EXISTS (
     SELECT 1 FROM permisos_rol x JOIN permisos pd ON pd.id = x.permiso_id
      WHERE x.rol_id = pr.rol_id AND pd.modulo = h.dm AND pd.accion = h.da);
  IF v_faltan > 0 THEN
    RAISE EXCEPTION '% claves viejas sin su reemplazo: correr antes agregar_permisos_por_accion.sql', v_faltan;
  END IF;
END $$;

DELETE FROM permisos_rol pr USING permisos p, viejas v
 WHERE pr.permiso_id = p.id AND p.modulo = v.modulo AND p.accion = v.accion;

DELETE FROM permisos p USING viejas v
 WHERE p.modulo = v.modulo AND p.accion = v.accion;

-- Guarda: no queda ninguna clave fuera del catalogo. Si aparece una que no esta en la lista
-- de viejas, se aborta para mirarla en vez de borrarla a ciegas.
DO $$
DECLARE v_fuera text;
BEGIN
  SELECT string_agg(p.modulo || '.' || p.accion, ', ') INTO v_fuera
    FROM permisos p WHERE p.modulo || '.' || p.accion NOT IN (SELECT clave FROM catalogo);
  IF v_fuera IS NOT NULL THEN
    RAISE EXCEPTION 'quedan claves fuera del catalogo: %', v_fuera;
  END IF;
END $$;

\echo '== Despues: filas por rol'
SELECT r.nombre AS rol, count(*) AS filas
  FROM permisos_rol pr JOIN roles r ON r.id = pr.rol_id
 GROUP BY r.nombre ORDER BY r.nombre;

COMMIT;
