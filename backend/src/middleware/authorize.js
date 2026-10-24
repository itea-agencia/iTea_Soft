const { error } = require('../utils/apiResponse');
const { existeAccion, permisosEfectivos, alcanceDe } = require('../config/permisos');

// La base de datos es la unica fuente de los permisos de un rol no-admin: las filas de
// `permisos_rol`. Los permisos son GLOBALES por rol: no hay permisos propios por usuario.
// Aqui NO hay valores por defecto: sin fila no hay permiso.
//
// Antes habia una tabla de defaults en el codigo que se usaba como base y la BD solo la
// sobrescribia parcialmente, lo que rompia lo que el admin configuraba. Y la tabla del
// admin estaba escrita a mano aparte del catalogo. Ahora las dos cosas salen de
// config/permisos.js.

// Una ruta que pide una accion que no existe se descubre al arrancar, no en produccion
// cuando alguien la usa: un typo en `authorize('sales', 'pya')` dejaba la ruta cerrada para
// todos menos el admin, sin ningun aviso.
function exigirAccion(modulo, accion) {
  if (!existeAccion(modulo, accion)) {
    throw new Error(`Permiso desconocido en una ruta: ${modulo}.${accion}. No esta en config/permisos.js.`);
  }
}

function authorize(modulo, accion) {
  exigirAccion(modulo, accion);
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401);
    }

    const actionScope = alcanceDe(permisosEfectivos(req.user), modulo, accion);
    if (actionScope === false) {
      return error(res, 'No tienes permiso para realizar esta acción', 403);
    }

    req.permissionScope = actionScope;
    next();
  };
}

// Pasa si el usuario tiene AL MENOS UNA de las acciones. Para un listado que sirve a dos
// pantallas con permisos distintos: p. ej. el asistente de ventas necesita ver los
// comisionistas para elegir uno sin que su asesor tenga el modulo de comisiones.
function authorizeAny(...pares) {
  for (const [modulo, accion] of pares) exigirAccion(modulo, accion);
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401);
    }

    const mapa = permisosEfectivos(req.user);
    for (const [modulo, accion] of pares) {
      const actionScope = alcanceDe(mapa, modulo, accion);
      if (actionScope !== false) {
        req.permissionScope = actionScope;
        return next();
      }
    }
    return error(res, 'No tienes permiso para realizar esta acción', 403);
  };
}

// Para lo que no es un permiso configurable: las herramientas de inspeccion de Siigo y
// decidir quien puede que (ver y cambiar los permisos de un rol).
function requireAdmin(req, res, next) {
  if (!req.user) {
    return error(res, 'No autenticado', 401);
  }
  if (req.user.role !== 'admin') {
    return error(res, 'No tienes permiso para realizar esta acción', 403);
  }
  next();
}

module.exports = { authorize, authorizeAny, requireAdmin };
