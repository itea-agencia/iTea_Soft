-- Agrega el permiso `commissions.toggle` (Activar/Desactivar) y le da a cada rol no-admin el
-- valor que tenia en `commissions.delete`, que el catalogo deja de tener: eliminar un
-- comisionista pasa a ser desactivarlo. Nadie gana ni pierde un permiso.
-- La fila vieja de `commissions.delete` se queda: el backend ignora acciones fuera del
-- catalogo (permisos.js, leerValor), y asi el codigo anterior sigue funcionando si se revierte.
--
-- Diseno: docs/designs/comisionistas-desactivar-en-vez-de-borrar.md
--
-- Uso:
--   produccion:  ./add_commissions_toggle_permission.sh
--   local:       docker exec -i itea_postgres psql -U postgres -d samtur-development \
--                  -v ON_ERROR_STOP=1 < backend/db-manual/add_commissions_toggle_permission.sql
-- Es idempotente: si la fila ya existe no se toca. Va ANTES del deploy del codigo nuevo.

\set ON_ERROR_STOP on
BEGIN;

\echo '== Antes: commissions.delete y commissions.toggle por rol'
SELECT r.nombre AS rol, p.accion, pr.valor
  FROM permisos_rol pr JOIN permisos p ON p.id = pr.permiso_id JOIN roles r ON r.id = pr.rol_id
 WHERE p.modulo = 'commissions' AND p.accion IN ('delete', 'toggle') ORDER BY 1, 2;

INSERT INTO permisos (modulo, accion, descripcion)
SELECT 'commissions', 'toggle', 'commissions - toggle'
 WHERE NOT EXISTS (SELECT 1 FROM permisos WHERE modulo = 'commissions' AND accion = 'toggle');

-- 'true'/'false' son filas anteriores al catalogo: en una accion con alcance que no es `edit`,
-- 'true' se lee como 'all' (leerValor). Se guarda ya traducido.
INSERT INTO permisos_rol (rol_id, permiso_id, valor)
SELECT pr.rol_id,
       (SELECT id FROM permisos WHERE modulo = 'commissions' AND accion = 'toggle'),
       CASE pr.valor WHEN 'true' THEN 'all' WHEN 'false' THEN 'none' ELSE pr.valor END
  FROM permisos_rol pr
  JOIN permisos p ON p.id = pr.permiso_id AND p.modulo = 'commissions' AND p.accion = 'delete'
  JOIN roles r ON r.id = pr.rol_id AND r.nombre <> 'admin'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Guarda: cada rol no-admin con `delete` tiene que tener `toggle`, y valer lo mismo.
DO $$
DECLARE v_mal int;
BEGIN
  SELECT count(*) INTO v_mal
    FROM permisos_rol d
    JOIN permisos pd ON pd.id = d.permiso_id AND pd.modulo = 'commissions' AND pd.accion = 'delete'
    JOIN roles r ON r.id = d.rol_id AND r.nombre <> 'admin'
    LEFT JOIN permisos pt ON pt.modulo = 'commissions' AND pt.accion = 'toggle'
    LEFT JOIN permisos_rol t ON t.rol_id = d.rol_id AND t.permiso_id = pt.id
   WHERE t.id IS NULL
      OR t.valor IS DISTINCT FROM CASE d.valor WHEN 'true' THEN 'all' WHEN 'false' THEN 'none' ELSE d.valor END;
  IF v_mal > 0 THEN
    RAISE EXCEPTION '% roles quedarian con commissions.toggle distinto de commissions.delete', v_mal;
  END IF;
END $$;

\echo '== Despues'
SELECT r.nombre AS rol, p.accion, pr.valor
  FROM permisos_rol pr JOIN permisos p ON p.id = pr.permiso_id JOIN roles r ON r.id = pr.rol_id
 WHERE p.modulo = 'commissions' AND p.accion IN ('delete', 'toggle') ORDER BY 1, 2;

COMMIT;
