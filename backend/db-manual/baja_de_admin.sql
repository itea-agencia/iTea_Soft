-- Da de baja a un ADMINISTRADOR. Es el unico camino: la aplicacion no deja desactivar ni
-- eliminar a un admin (ni cambiarle el rol), para que un admin comprometido no pueda sacar a
-- los demas ni nadie pueda quedarse sin acceso por accidente.
--
-- Uso (lo normal es el .sh, que pone la conexion):
--   psql ... -v email=persona@samtur.com            -f baja_de_admin.sql   # desactiva
--   psql ... -v email=persona@samtur.com -v modo=eliminar -f baja_de_admin.sql
--
--   desactivar (por defecto)  status = inactive. Conserva el correo; se reactiva a mano.
--   eliminar                  baja definitiva: libera el correo (queda eliminado+<id>@itea.invalid,
--                             el real sigue en personas.email) y marca deleted_at. Es la misma
--                             baja que hace la aplicacion con un asesor.
--
-- En los dos casos se cierran sus sesiones y NO se toca ninguna venta.
--
-- OJO: este script no puede limpiar la cache en memoria del backend. Si la persona tiene una
-- sesion abierta, sigue entrando hasta que venza esa cache (5 minutos) o se reinicie el
-- backend. Para que sea inmediato, reiniciar el servicio despues.

\set ON_ERROR_STOP on
\if :{?email}
\else
  \echo 'Falta el correo: psql ... -v email=persona@samtur.com -f baja_de_admin.sql'
  \quit
\endif
\if :{?modo}
\else
  \set modo desactivar
\endif

BEGIN;

SELECT set_config('baja.email', lower(trim(:'email')), true) AS _,
       set_config('baja.modo',  :'modo', true) AS __ \gset

-- Guardas: cualquiera que no se cumpla aborta y no cambia nada.
DO $$
DECLARE
  v_email  text := current_setting('baja.email');
  v_modo   text := current_setting('baja.modo');
  v_n      int;
  v_rol    text;
  v_estado text;
  v_borrado timestamp;
  v_otros  int;
BEGIN
  IF v_modo NOT IN ('desactivar', 'eliminar') THEN
    RAISE EXCEPTION 'modo invalido "%": usar desactivar o eliminar', v_modo;
  END IF;

  SELECT count(*) INTO v_n FROM usuarios WHERE lower(email) = v_email;
  IF v_n <> 1 THEN
    RAISE EXCEPTION 'esperaba exactamente 1 usuario con el correo %, hay %', v_email, v_n;
  END IF;

  SELECT r.nombre, u.status::text, u.deleted_at INTO v_rol, v_estado, v_borrado
    FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE lower(u.email) = v_email;
  IF v_rol <> 'admin' THEN
    RAISE EXCEPTION '% no es admin (es %): un asesor o freelancer se da de baja desde la aplicacion', v_email, v_rol;
  END IF;
  IF v_borrado IS NOT NULL OR v_estado <> 'active' THEN
    RAISE EXCEPTION '% ya no esta activo (estado %, eliminado %)', v_email, v_estado, v_borrado;
  END IF;

  -- Nunca dejar el sistema sin ningun admin activo: sin uno, nadie puede administrar usuarios
  -- ni permisos, y la unica salida seria tocar la base a mano.
  SELECT count(*) INTO v_otros
    FROM usuarios u JOIN roles r ON r.id = u.rol_id
   WHERE r.nombre = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL AND lower(u.email) <> v_email;
  IF v_otros < 1 THEN
    RAISE EXCEPTION 'no queda ningun otro admin activo: % es el unico. Crear otro admin antes', v_email;
  END IF;
END $$;

SELECT u.id AS objetivo_id, u.persona_id AS objetivo_persona
  FROM usuarios u WHERE lower(u.email) = current_setting('baja.email') \gset

\echo '--- ANTES'
SELECT (SELECT count(*) FROM usuarios u JOIN roles r ON r.id = u.rol_id
         WHERE r.nombre = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL) AS admins_activos,
       (SELECT count(*) FROM sesiones WHERE usuario_id = :objetivo_id) AS sesiones_del_objetivo,
       (SELECT count(*) FROM ventas   WHERE usuario_id = :objetivo_id) AS ventas_del_objetivo;

UPDATE usuarios
   SET status = 'inactive'
 WHERE id = :objetivo_id;

UPDATE usuarios
   SET deleted_at = now(), email = 'eliminado+' || id || '@itea.invalid'
 WHERE id = :objetivo_id AND current_setting('baja.modo') = 'eliminar';

-- Igual que la aplicacion: la persona se marca eliminada salvo que tambien sea cliente o
-- comisionista, en cuyo caso sigue existiendo como tal.
UPDATE personas
   SET deleted_at = now(), status = 'inactive'
 WHERE id = :objetivo_persona AND current_setting('baja.modo') = 'eliminar'
   AND NOT EXISTS (SELECT 1 FROM clientes      WHERE persona_id = :objetivo_persona)
   AND NOT EXISTS (SELECT 1 FROM comisionistas WHERE persona_id = :objetivo_persona);

DELETE FROM sesiones WHERE usuario_id = :objetivo_id;

\echo '--- DESPUES'
SELECT (SELECT count(*) FROM usuarios u JOIN roles r ON r.id = u.rol_id
         WHERE r.nombre = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL) AS admins_activos,
       (SELECT count(*) FROM sesiones WHERE usuario_id = :objetivo_id) AS sesiones_del_objetivo,
       (SELECT count(*) FROM ventas   WHERE usuario_id = :objetivo_id) AS ventas_del_objetivo;

SELECT id, email, status, deleted_at IS NOT NULL AS eliminado FROM usuarios WHERE id = :objetivo_id;

COMMIT;

\echo 'Listo. Reiniciar el backend si la persona pudiera tener una sesion abierta (cache de 5 min).'
