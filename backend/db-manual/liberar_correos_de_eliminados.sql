-- Libera el correo de los usuarios que se "eliminaron" con el modelo VIEJO.
--
-- Antes, "Eliminar" dejaba al usuario en status = inactive y marcaba deleted_at solo en la
-- PERSONA; el usuario conservaba su correo para siempre, asi que ese correo no se podia dar a
-- nadie. Ahora "eliminar" marca `usuarios.deleted_at` y libera el correo, pero los que se
-- eliminaron antes quedaron como estaban. Este script los pone al dia.
--
-- Corre DESPUES de la migracion usuarios_deleted_at (agrega la columna).
--
-- Solo toca los que se pueden identificar SIN AMBIGUEDAD: inactivos, sin deleted_at en el
-- usuario, y con la PERSONA eliminada. Los inactivos cuya persona NO esta eliminada no se
-- pueden distinguir de un "Desactivar" normal (una persona que tambien es cliente o
-- comisionista no se eliminaba nunca): se LISTAN al final para revisarlos a mano y no se
-- tocan. No hace falta cerrar sesiones: un inactivo ya no puede entrar.

\set ON_ERROR_STOP on

BEGIN;

\echo '--- CANDIDATOS: inactivos con la persona eliminada'
SELECT u.id, u.email, r.nombre AS rol, p.deleted_at AS persona_eliminada_at,
       (SELECT count(*) FROM ventas v WHERE v.usuario_id = u.id) AS ventas
  FROM usuarios u
  JOIN personas p ON p.id = u.persona_id
  JOIN roles r ON r.id = u.rol_id
 WHERE u.status = 'inactive' AND u.deleted_at IS NULL AND p.deleted_at IS NOT NULL
 ORDER BY u.id;

\echo '--- ANTES'
SELECT (SELECT count(*) FROM usuarios WHERE deleted_at IS NOT NULL) AS eliminados,
       (SELECT count(*) FROM usuarios) AS usuarios_total,
       (SELECT count(*) FROM ventas) AS ventas_total;

-- Nunca a un admin: un admin no se da de baja por aqui (ver baja_de_admin.sql).
DO $$
DECLARE v_admins int;
BEGIN
  SELECT count(*) INTO v_admins
    FROM usuarios u JOIN personas p ON p.id = u.persona_id JOIN roles r ON r.id = u.rol_id
   WHERE u.status = 'inactive' AND u.deleted_at IS NULL AND p.deleted_at IS NOT NULL AND r.nombre = 'admin';
  IF v_admins > 0 THEN
    RAISE EXCEPTION 'hay % admin(s) entre los candidatos: revisarlos a mano, este script no los toca', v_admins;
  END IF;
END $$;

-- La fecha de la baja es la que ya tenia la persona. El correo real queda en personas.email.
UPDATE usuarios u
   SET deleted_at = p.deleted_at,
       email = 'eliminado+' || u.id || '@itea.invalid'
  FROM personas p
 WHERE p.id = u.persona_id
   AND u.status = 'inactive' AND u.deleted_at IS NULL AND p.deleted_at IS NOT NULL;

\echo '--- DESPUES (eliminados sube; usuarios y ventas NO cambian)'
SELECT (SELECT count(*) FROM usuarios WHERE deleted_at IS NOT NULL) AS eliminados,
       (SELECT count(*) FROM usuarios) AS usuarios_total,
       (SELECT count(*) FROM ventas) AS ventas_total;

\echo '--- A REVISAR A MANO: inactivos cuya persona NO esta eliminada (desactivados, o eliminados que tambien son cliente/comisionista)'
SELECT u.id, u.email, r.nombre AS rol, u.status,
       EXISTS (SELECT 1 FROM clientes c WHERE c.persona_id = u.persona_id) AS es_cliente,
       EXISTS (SELECT 1 FROM comisionistas c WHERE c.persona_id = u.persona_id) AS es_comisionista
  FROM usuarios u JOIN roles r ON r.id = u.rol_id
 WHERE u.status = 'inactive' AND u.deleted_at IS NULL
 ORDER BY u.id;

COMMIT;
