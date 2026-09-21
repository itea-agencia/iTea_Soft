const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');
const { AUTH_CACHE } = require('../middleware/auth');
const { normalizarValor } = require('../utils/permisosValor');

const MODULE_ACTIONS = {
  dashboard: ['view'],
  sales: ['view', 'create', 'edit'],
  clients: ['view', 'create', 'edit'],
  responsables: ['view', 'create', 'edit', 'delete'],
  itineraries: ['view', 'edit'],
  commissions: ['view', 'create', 'edit', 'delete'],
  config: ['view', 'create', 'edit'],
};

function encodeValor(value) {
  if (value === 'all' || value === 'own' || value === 'none') return value;
  if (value === true) return 'true';
  if (value === false) return 'false';
  return String(value);
}

exports.getPermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const validRoles = ['asesor', 'freelancer'];
    if (!validRoles.includes(role)) {
      return error(res, 'Rol inválido. Use: asesor, freelancer', 400);
    }

    const permisos = await prisma.permisosRol.findMany({
      where: { rol: { nombre: role } },
      include: { permiso: true }
    });

    // Build structure for ALL configurable modules
    const MODULES = Object.keys(MODULE_ACTIONS);
    const grouped = {};

    for (const mod of MODULES) {
      grouped[mod] = {};
      const actions = MODULE_ACTIONS[mod] || [];
      for (const act of actions) {
        // Sin fila en la BD no hay permiso: es lo mismo que aplica authorize.js. Mostrar
        // un default del codigo aqui haria que la pantalla dijera una cosa y el servidor otra.
        grouped[mod][act] = normalizarValor(mod, act, 'false');
      }
    }

    // Override with values stored in DB
    for (const pr of permisos) {
      const m = pr.permiso.modulo;
      const a = pr.permiso.accion;
      const v = pr.valor != null ? pr.valor : 'true';
      if (!grouped[m]) grouped[m] = {};
      grouped[m][a] = normalizarValor(m, a, v);
    }

    success(res, grouped);
  } catch (err) {
    next(err);
  }
};

exports.updatePermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;

    if (!['asesor', 'freelancer'].includes(role)) {
      return error(res, 'Rol inválido. Use: asesor, freelancer', 400);
    }
    if (!permissions || typeof permissions !== 'object') {
      return error(res, 'Faltan los permisos a guardar', 400);
    }

    const rol = await prisma.roles.findUnique({ where: { nombre: role } });
    if (!rol) return error(res, 'Rol no encontrado', 404);

    // Todo o nada. Los permisos de un rol se reemplazan borrando y recreando, y como la BD
    // es la unica fuente (sin permiso no hay acceso), un fallo a medias dejaba al rol con
    // solo una parte de sus permisos y al resto de sus usuarios sin acceso.
    await prisma.$transaction(async (tx) => {
      await tx.permisosRol.deleteMany({ where: { rolId: rol.id } });

      for (const [modulo, accs] of Object.entries(permissions)) {
        for (const [accion, value] of Object.entries(accs)) {
          // Buscar o crear el registro en el catálogo de permisos
          let permiso = await tx.permisos.findFirst({ where: { modulo, accion } });
          if (!permiso) {
            permiso = await tx.permisos.create({
              data: { modulo, accion, descripcion: `${modulo} - ${accion}` }
            });
          }

          await tx.permisosRol.create({
            data: { rolId: rol.id, permisoId: permiso.id, valor: encodeValor(value) }
          });
        }
      }
    });

    // Limpiar toda la caché de autenticación en RAM para que todos los usuarios
    // del rol recarguen sus permisos en la próxima petición
    AUTH_CACHE.clear();

    success(res, { message: 'Permisos de rol actualizados' });
  } catch (err) {
    next(err);
  }
};
