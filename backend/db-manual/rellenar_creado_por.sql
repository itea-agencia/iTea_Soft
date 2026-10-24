-- Rellena `creado_por_id` de responsables, comisionistas y usuarios que ya existian cuando
-- se agrego la columna (migracion 20261024120000_creado_por_id). Es el "Propios" de esos
-- modulos en los permisos por accion (docs/designs/permisos-por-rol-2026-10.md).
--
-- Criterio (decisiones 9, 14 y 21 del diseno):
--   responsables y comisionistas  -> el usuario de la PRIMERA venta donde figuran (por
--                                    fecha, y por id si empatan). Sin ventas, quedan en
--                                    null: solo los alcanza quien tenga "Todos".
--   usuarios                      -> el admin con id 1. El propio id 1 queda en null.
-- Solo toca filas en null: no pisa lo que ya guardo la aplicacion. Es idempotente.
--
-- Uso:
--   produccion:  ./rellenar_creado_por.sh
--   local:       docker exec -i itea_postgres psql -U postgres -d samtur-development \
--                  -v ON_ERROR_STOP=1 < backend/db-manual/rellenar_creado_por.sql
-- Va despues de la migracion: sin la columna, falla en la primera consulta y no cambia nada.

\set ON_ERROR_STOP on
BEGIN;

\echo '== Antes: total y con dueno'
SELECT 'responsables' AS tabla, count(*) AS total, count(creado_por_id) AS con_dueno FROM responsables
UNION ALL SELECT 'comisionistas', count(*), count(creado_por_id) FROM comisionistas
UNION ALL SELECT 'usuarios', count(*), count(creado_por_id) FROM usuarios;

-- Guarda: el duenio de los usuarios existentes tiene que ser un admin que exista.
DO $$
DECLARE v_rol text;
BEGIN
  SELECT r.nombre INTO v_rol FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = 1;
  IF v_rol IS NULL THEN
    RAISE EXCEPTION 'no existe el usuario 1: no hay a quien asignar los usuarios existentes';
  END IF;
  IF v_rol <> 'admin' THEN
    RAISE EXCEPTION 'el usuario 1 no es admin (es %): revisar a quien asignar los usuarios', v_rol;
  END IF;
END $$;

UPDATE responsables r
   SET creado_por_id = primera.usuario_id
  FROM (SELECT DISTINCT ON (v.responsable_id) v.responsable_id, v.usuario_id
          FROM ventas v
         WHERE v.responsable_id IS NOT NULL
         ORDER BY v.responsable_id, v.creado_at, v.id) primera
 WHERE r.id = primera.responsable_id AND r.creado_por_id IS NULL;

UPDATE comisionistas c
   SET creado_por_id = primera.usuario_id
  FROM (SELECT DISTINCT ON (v.comisionista_id) v.comisionista_id, v.usuario_id
          FROM ventas v
         WHERE v.comisionista_id IS NOT NULL
         ORDER BY v.comisionista_id, v.creado_at, v.id) primera
 WHERE c.id = primera.comisionista_id AND c.creado_por_id IS NULL;

UPDATE usuarios SET creado_por_id = 1 WHERE creado_por_id IS NULL AND id <> 1;

-- Guardas sobre el resultado: cada dueno asignado coincide con su criterio.
DO $$
DECLARE v_mal int;
BEGIN
  SELECT count(*) INTO v_mal FROM responsables r
   WHERE r.creado_por_id IS NOT NULL AND NOT EXISTS (
     SELECT 1 FROM ventas v WHERE v.responsable_id = r.id AND v.usuario_id = r.creado_por_id);
  IF v_mal > 0 THEN RAISE EXCEPTION '% responsables con un dueno que no figura en sus ventas', v_mal; END IF;

  SELECT count(*) INTO v_mal FROM comisionistas c
   WHERE c.creado_por_id IS NOT NULL AND NOT EXISTS (
     SELECT 1 FROM ventas v WHERE v.comisionista_id = c.id AND v.usuario_id = c.creado_por_id);
  IF v_mal > 0 THEN RAISE EXCEPTION '% comisionistas con un dueno que no figura en sus ventas', v_mal; END IF;

  SELECT count(*) INTO v_mal FROM responsables r
   WHERE r.creado_por_id IS NULL AND EXISTS (SELECT 1 FROM ventas v WHERE v.responsable_id = r.id);
  IF v_mal > 0 THEN RAISE EXCEPTION '% responsables con ventas quedaron sin dueno', v_mal; END IF;

  SELECT count(*) INTO v_mal FROM comisionistas c
   WHERE c.creado_por_id IS NULL AND EXISTS (SELECT 1 FROM ventas v WHERE v.comisionista_id = c.id);
  IF v_mal > 0 THEN RAISE EXCEPTION '% comisionistas con ventas quedaron sin dueno', v_mal; END IF;

  SELECT count(*) INTO v_mal FROM usuarios WHERE creado_por_id IS NULL AND id <> 1;
  IF v_mal > 0 THEN RAISE EXCEPTION '% usuarios quedaron sin dueno', v_mal; END IF;
END $$;

\echo '== Despues: total y con dueno (los responsables y comisionistas sin ventas quedan sin dueno)'
SELECT 'responsables' AS tabla, count(*) AS total, count(creado_por_id) AS con_dueno FROM responsables
UNION ALL SELECT 'comisionistas', count(*), count(creado_por_id) FROM comisionistas
UNION ALL SELECT 'usuarios', count(*), count(creado_por_id) FROM usuarios;

COMMIT;
