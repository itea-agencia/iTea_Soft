-- Quita los permisos propios por usuario: desde ahora los permisos son solo los globales
-- por rol (`permisos_rol`).
--
-- DESTRUYE DATOS. Cada fila de `permisos_usuario` era una excepcion a los permisos del rol
-- de UN usuario. Al desaparecer, ese usuario pasa a tener exactamente los permisos de su
-- rol, que pueden ser MAS de los que tenia (una excepcion podia ser una restriccion).
-- Antes de desplegar, mirar en produccion que usuarios tienen filas:
--
--   SELECT u.email, r.nombre AS rol, p.modulo, p.accion, pu.valor
--   FROM permisos_usuario pu
--   JOIN usuarios u ON u.id = pu.usuario_id JOIN roles r ON r.id = u.rol_id
--   JOIN permisos p ON p.id = pu.permiso_id ORDER BY 1, 3, 4;
--
-- y decidir si alguno necesita otro rol. No hay traslado de datos: nada que mover.

-- DropForeignKey
ALTER TABLE "permisos_usuario" DROP CONSTRAINT "permisos_usuario_permiso_id_fkey";

-- DropForeignKey
ALTER TABLE "permisos_usuario" DROP CONSTRAINT "permisos_usuario_usuario_id_fkey";

-- DropTable
DROP TABLE "permisos_usuario";

