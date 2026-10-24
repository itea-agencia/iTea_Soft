// Registro de acciones sensibles en `logs_usuarios`: quien cambio los permisos de un rol,
// dio de baja a alguien, anulo, facturo o liquido. La tabla existia y nadie la escribia, asi
// que no quedaba rastro de nada de eso.
//
// Se llama con el `tx` de la transaccion de la accion: si la accion falla no queda registro,
// y si el registro falla la accion no se confirma. `descripcion` identifica el registro por
// id (sin datos personales) y lo que cambio. Se consulta con SQL; no tiene pantalla
// (decision 27 del diseno de permisos).
function auditar(tx, usuarioId, modulo, accion, descripcion) {
  return tx.logsUsuarios.create({ data: { usuarioId, modulo, accion, descripcion } });
}

module.exports = { auditar };
