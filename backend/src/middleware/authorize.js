const { error } = require('../utils/apiResponse');

// La base de datos es la unica fuente de los permisos de un rol no-admin: filas de
// `permisos_rol`, y encima las de `permisos_usuario`. Aqui NO hay valores por defecto.
//
// Antes habia una tabla de defaults en el codigo que se usaba como base y la BD solo la
// sobrescribia parcialmente. Eso rompia lo que el admin configuraba:
//   - una fila de BD para una accion que el default no listaba (p. ej. responsables.delete)
//     se ignoraba;
//   - el default de `sales.edit` era booleano, y el editor de roles guarda 'own'/'all'/'none':
//     `'own' === 'true'` daba false, asi que "editar solo lo mio" equivalia a "no editar";
//   - una accion sin fila caia al default y quedaba permitida aunque el admin no la diera.
// Ahora, sin fila no hay permiso.

// Vista y edicion son jerarquicas (all/own/none) solo en estos modulos; el resto es booleano.
// Debe coincidir con roles.controller.js, que es quien escribe estas filas.
const SCOPED_VIEW_MODULES = ['dashboard', 'sales', 'clients', 'responsables', 'itineraries'];
const SCOPED_EDIT_MODULES = ['sales', 'clients', 'responsables', 'itineraries'];

const ADMIN_PERMISSIONS = {
  dashboard: { view: 'all' },
  sales: { view: 'all', create: true, edit: 'all', delete: true },
  clients: { view: 'all', create: true, edit: 'all' },
  responsables: { view: 'all', create: true, edit: 'all', delete: true },
  itineraries: { view: 'all', edit: 'all' },
  commissions: { view: true, create: true, edit: true, delete: true },
  users: { view: true, create: true, edit: true, delete: true },
  config: { view: true, create: true, edit: true },
};

function normalizarValor(modulo, accion, valor) {
  if (accion === 'view' && SCOPED_VIEW_MODULES.includes(modulo)) {
    if (valor === 'all') return modulo === 'dashboard' ? 'own' : 'all';
    if (valor === 'own') return 'own';
    if (valor === 'true' || valor === true) return modulo === 'dashboard' ? 'own' : 'all';
    return 'none';
  }
  if (accion === 'edit' && SCOPED_EDIT_MODULES.includes(modulo)) {
    if (valor === 'all') return 'all';
    // 'true' viene de filas antiguas (seed, esquema por defecto): se lee como lo mas
    // restrictivo que sigue dejando editar.
    if (valor === 'own' || valor === 'true' || valor === true) return 'own';
    return 'none';
  }
  return valor === 'true' || valor === true;
}

function getEffectivePermissions(user) {
  if (user.role === 'admin') {
    return { permissions: ADMIN_PERMISSIONS, scope: 'all' };
  }

  const permissions = {};
  // Rol primero, usuario despues: lo puesto a un usuario concreto gana sobre su rol.
  for (const fila of [...(user.permisosRol || []), ...(user.permisosUsuario || [])]) {
    if (!permissions[fila.modulo]) permissions[fila.modulo] = {};
    permissions[fila.modulo][fila.accion] = normalizarValor(fila.modulo, fila.accion, fila.valor);
  }

  return { permissions, scope: 'own' };
}

function getActionScope(permissions, modulo, accion) {
  const val = permissions[modulo]?.[accion];
  if (val === true || val === 'all') return 'all';
  if (val === 'own') return 'own';
  return false;
}

function authorize(modulo, accion) {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401);
    }

    const { permissions } = getEffectivePermissions(req.user);
    const actionScope = getActionScope(permissions, modulo, accion);

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
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'No autenticado', 401);
    }

    const { permissions } = getEffectivePermissions(req.user);
    for (const [modulo, accion] of pares) {
      const actionScope = getActionScope(permissions, modulo, accion);
      if (actionScope !== false) {
        req.permissionScope = actionScope;
        return next();
      }
    }
    return error(res, 'No tienes permiso para realizar esta acción', 403);
  };
}

// Para rutas que no pertenecen a ningun modulo configurable (herramientas de inspeccion
// de Siigo): no hay una fila de permiso a la que atarlas, asi que solo el admin.
function requireAdmin(req, res, next) {
  if (!req.user) {
    return error(res, 'No autenticado', 401);
  }
  if (req.user.role !== 'admin') {
    return error(res, 'No tienes permiso para realizar esta acción', 403);
  }
  next();
}

module.exports = { authorize, authorizeAny, requireAdmin, getEffectivePermissions, getActionScope };
