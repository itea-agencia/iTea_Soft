-- Agrega los permisos por accion del catalogo (backend/src/config/permisos.js) y les da a
-- asesor y freelancer el valor del permiso del que se separan. NO BORRA NADA: las claves
-- viejas (sales.edit, sales.delete...) se quedan, porque el codigo actual las sigue usando.
-- Las quita quitar_permisos_viejos.sql, cuando el codigo nuevo ya este en produccion.
--
-- Diseno: docs/designs/permisos-por-rol-2026-10.md ("Datos" y "Despliegue").
--
-- Herencia (nadie gana ni pierde un permiso):
--   sales.pay, sales.invoice, sales.review   <- sales.edit
--   sales.void                               <- sales.delete   (anular no borra nada)
--   clients.toggle                           <- clients.edit
--   responsables.toggle                      <- responsables.delete
--   commissions.settle                       <- commissions.create
--   config.delete                            <- config.edit
-- `responsables.delete` y `commissions.view/edit/delete` siguen con sus filas: pasan de
-- si/no a alcance, y el backend lee su 'true' viejo como 'all', que es lo que valia.
--
-- Uso:
--   produccion:  ./agregar_permisos_por_accion.sh
--   local:       docker exec -i itea_postgres psql -U postgres -d samtur-development \
--                  -v ON_ERROR_STOP=1 < backend/db-manual/agregar_permisos_por_accion.sql
-- Es idempotente: una fila que ya existe no se toca.

\set ON_ERROR_STOP on
BEGIN;

\echo '== Antes: filas de permisos por rol'
SELECT r.nombre AS rol, count(*) AS filas
  FROM permisos_rol pr JOIN roles r ON r.id = pr.rol_id
 GROUP BY r.nombre ORDER BY r.nombre;

CREATE TEMP TABLE herencia (destino_modulo text, destino_accion text, origen_modulo text, origen_accion text, destino_tipo text) ON COMMIT DROP;
INSERT INTO herencia VALUES
  ('sales', 'pay', 'sales', 'edit', 'alcance'),
  ('sales', 'invoice', 'sales', 'edit', 'alcance'),
  ('sales', 'review', 'sales', 'edit', 'alcance'),
  ('sales', 'void', 'sales', 'delete', 'alcance'),
  ('clients', 'toggle', 'clients', 'edit', 'alcance'),
  ('responsables', 'toggle', 'responsables', 'delete', 'alcance'),
  ('commissions', 'settle', 'commissions', 'create', 'alcance'),
  ('config', 'delete', 'config', 'edit', 'sino');

-- Lectura vieja (la de utils/permisosValor.js antes del catalogo), llevada a all/own/none
-- para comparar: los `edit` de los modulos con alcance leian 'true' como 'own'; los `view`
-- de esos modulos, como 'all'; todo lo demas era si/no ('true' = valia sobre todo).
CREATE FUNCTION pg_temp.lectura_vieja(modulo text, accion text, valor text) RETURNS text AS $$
  SELECT CASE
    WHEN accion = 'edit' AND modulo IN ('sales', 'clients', 'responsables', 'itineraries') THEN
      CASE valor WHEN 'all' THEN 'all' WHEN 'own' THEN 'own' WHEN 'true' THEN 'own' ELSE 'none' END
    WHEN accion = 'view' AND modulo IN ('dashboard', 'sales', 'clients', 'responsables', 'itineraries') THEN
      CASE valor WHEN 'all' THEN 'all' WHEN 'own' THEN 'own' WHEN 'true' THEN 'all' ELSE 'none' END
    ELSE CASE WHEN valor IN ('true', 'all') THEN 'all' WHEN valor = 'own' THEN 'own' ELSE 'none' END
  END
$$ LANGUAGE sql IMMUTABLE;

-- Lectura nueva (leerValor de config/permisos.js), llevada a all/own/none: un si/no true
-- cuenta como 'all'.
CREATE FUNCTION pg_temp.lectura_nueva(modulo text, accion text, valor text, tipo text) RETURNS text AS $$
  SELECT CASE
    WHEN tipo = 'sino' THEN CASE WHEN valor = 'true' THEN 'all' ELSE 'none' END
    WHEN valor IN ('all', 'own', 'none') THEN valor
    WHEN valor = 'true' THEN
      CASE WHEN accion = 'edit' AND modulo IN ('sales', 'clients', 'responsables', 'itineraries') THEN 'own' ELSE 'all' END
    ELSE 'none'
  END
$$ LANGUAGE sql IMMUTABLE;

-- 1. Las filas del catalogo que falten. `permisos` no tiene unico por (modulo, accion),
--    asi que se comprueba a mano.
INSERT INTO permisos (modulo, accion, descripcion)
SELECT DISTINCT h.destino_modulo, h.destino_accion, h.destino_modulo || ' - ' || h.destino_accion
  FROM herencia h
 WHERE NOT EXISTS (SELECT 1 FROM permisos p WHERE p.modulo = h.destino_modulo AND p.accion = h.destino_accion);

-- 2. Herencia: para cada rol no-admin que tenga el permiso de origen y no el de destino.
--    Sin fila de origen no se crea la de destino: sin fila no hay permiso, igual que antes.
INSERT INTO permisos_rol (rol_id, permiso_id, valor)
SELECT pr.rol_id,
       pd.id,
       CASE WHEN h.destino_tipo = 'sino'
            THEN CASE WHEN pg_temp.lectura_vieja(h.origen_modulo, h.origen_accion, pr.valor) = 'all' THEN 'true' ELSE 'false' END
            ELSE pg_temp.lectura_vieja(h.origen_modulo, h.origen_accion, pr.valor)
       END
  FROM herencia h
  JOIN permisos po ON po.modulo = h.origen_modulo AND po.accion = h.origen_accion
  JOIN permisos_rol pr ON pr.permiso_id = po.id
  JOIN roles r ON r.id = pr.rol_id AND r.nombre <> 'admin'
  JOIN permisos pd ON pd.modulo = h.destino_modulo AND pd.accion = h.destino_accion
 WHERE NOT EXISTS (SELECT 1 FROM permisos_rol x WHERE x.rol_id = pr.rol_id AND x.permiso_id = pd.id);

-- 3. Guardas: si algo no cuadra, se aborta y no cambia nada.
DO $$
DECLARE
  v_faltan int;
  v_distintos int;
  v_cambian int;
BEGIN
  -- Todo rol con el permiso de origen tiene ahora el de destino.
  SELECT count(*) INTO v_faltan
    FROM herencia h
    JOIN permisos po ON po.modulo = h.origen_modulo AND po.accion = h.origen_accion
    JOIN permisos_rol pr ON pr.permiso_id = po.id
    JOIN roles r ON r.id = pr.rol_id AND r.nombre <> 'admin'
   WHERE NOT EXISTS (
     SELECT 1 FROM permisos_rol x JOIN permisos pd ON pd.id = x.permiso_id
      WHERE x.rol_id = pr.rol_id AND pd.modulo = h.destino_modulo AND pd.accion = h.destino_accion);
  IF v_faltan > 0 THEN
    RAISE EXCEPTION '% herencias sin fila de destino', v_faltan;
  END IF;

  -- La accion nueva vale lo mismo que valia la vieja.
  SELECT count(*) INTO v_distintos
    FROM herencia h
    JOIN permisos po ON po.modulo = h.origen_modulo AND po.accion = h.origen_accion
    JOIN permisos_rol pro ON pro.permiso_id = po.id
    JOIN roles r ON r.id = pro.rol_id AND r.nombre <> 'admin'
    JOIN permisos pd ON pd.modulo = h.destino_modulo AND pd.accion = h.destino_accion
    JOIN permisos_rol prd ON prd.permiso_id = pd.id AND prd.rol_id = pro.rol_id
   WHERE pg_temp.lectura_vieja(h.origen_modulo, h.origen_accion, pro.valor)
         IS DISTINCT FROM pg_temp.lectura_nueva(h.destino_modulo, h.destino_accion, prd.valor, h.destino_tipo);
  IF v_distintos > 0 THEN
    RAISE EXCEPTION '% acciones nuevas no valen lo mismo que la vieja de la que heredan', v_distintos;
  END IF;

  -- Las filas que se quedan se leen igual con la lectura nueva. Excepcion a proposito: el
  -- dashboard con 'all'/'true', que antes se leia como 'own' para un no-admin y ahora vale
  -- 'all' (decision 17 del diseno). Las claves que salen del catalogo no se comparan.
  SELECT count(*) INTO v_cambian
    FROM permisos_rol pr
    JOIN permisos p ON p.id = pr.permiso_id
    JOIN roles r ON r.id = pr.rol_id AND r.nombre <> 'admin'
   WHERE (p.modulo, p.accion) NOT IN (('sales', 'edit'), ('sales', 'delete'), ('clients', 'delete'),
                                      ('itineraries', 'create'), ('itineraries', 'delete'),
                                      ('dashboard', 'create'), ('dashboard', 'edit'), ('dashboard', 'delete'))
     AND NOT (p.modulo = 'dashboard' AND pr.valor IN ('all', 'true'))
     AND pg_temp.lectura_vieja(p.modulo, p.accion, pr.valor)
         IS DISTINCT FROM pg_temp.lectura_nueva(p.modulo, p.accion, pr.valor,
                                                CASE WHEN p.modulo = 'config' OR p.accion = 'create' THEN 'sino' ELSE 'alcance' END);
  IF v_cambian > 0 THEN
    RAISE EXCEPTION '% filas existentes se leerian distinto con el catalogo', v_cambian;
  END IF;
END $$;

\echo '== Despues: filas de permisos por rol'
SELECT r.nombre AS rol, count(*) AS filas
  FROM permisos_rol pr JOIN roles r ON r.id = pr.rol_id
 GROUP BY r.nombre ORDER BY r.nombre;

\echo '== Acciones nuevas por rol'
SELECT r.nombre AS rol, p.modulo || '.' || p.accion AS permiso, pr.valor
  FROM permisos_rol pr
  JOIN permisos p ON p.id = pr.permiso_id
  JOIN roles r ON r.id = pr.rol_id
  JOIN herencia h ON h.destino_modulo = p.modulo AND h.destino_accion = p.accion
 WHERE r.nombre <> 'admin'
 ORDER BY 1, 2;

COMMIT;
