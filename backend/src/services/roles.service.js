const prisma = require('../config/db');

const MODULE_ACTIONS = {
  dashboard: ['view'],
  sales: ['view', 'create', 'edit'],
  clients: ['view', 'create', 'edit'],
  responsables: ['view', 'create', 'edit', 'delete'],
  itineraries: ['view', 'edit'],
  commissions: ['view', 'create', 'edit', 'delete'],
  config: ['view', 'create', 'edit'],
};

const SCOPED_VIEW_MODULES = ['dashboard', 'sales', 'clients', 'responsables', 'itineraries'];
const SCOPED_EDIT_MODULES = ['sales', 'clients', 'responsables', 'itineraries'];

const DEFAULT_ROLE_VALUES = {
  asesor: {
    dashboard: { view: 'own' },
    sales: { view: 'own', create: 'true', edit: 'own' },
    clients: { view: 'own', create: 'true', edit: 'own' },
    responsables: { view: 'own', create: 'true', edit: 'own', delete: 'false' },
    itineraries: { view: 'own', edit: 'own' },
    commissions: { view: 'false', create: 'false', edit: 'false', delete: 'false' },
    config: { view: 'false', create: 'false', edit: 'false' },
  },
  freelancer: {
    dashboard: { view: 'own' },
    sales: { view: 'own', create: 'true', edit: 'own' },
    clients: { view: 'own', create: 'true', edit: 'own' },
    responsables: { view: 'own', create: 'true', edit: 'own', delete: 'false' },
    itineraries: { view: 'own', edit: 'own' },
    commissions: { view: 'false', create: 'false', edit: 'false', delete: 'false' },
    config: { view: 'false', create: 'false', edit: 'false' },
  },
};

function parseValor(accion, modulo, valor, role) {
  // Módulos con vista jerárquica (all/own/none)
  if (accion === 'view' && SCOPED_VIEW_MODULES.includes(modulo)) {
    if (valor === 'all') {
      if (modulo === 'dashboard' && role !== 'admin') return 'own';
      return 'all';
    }
    if (valor === 'own') return 'own';
    if (valor === 'true') return modulo === 'dashboard' ? 'own' : 'all';
    return 'none';
  }
  // Módulos con edición jerárquica (all/own/none)
  if (accion === 'edit' && SCOPED_EDIT_MODULES.includes(modulo)) {
    if (valor === 'all') return 'all';
    if (valor === 'own') return 'own';
    if (valor === 'true') return 'own';
    return 'none';
  }
  // boolean value (create, delete, view en commissions/config, edit en commissions/config)
  return valor === 'true' || valor === true;
}

function encodeValor(value) {
  if (value === 'all' || value === 'own' || value === 'none') return value;
  if (value === true) return 'true';
  if (value === false) return 'false';
  return String(value);
}

class RolesService {
  async getRolePermissions(role) {
    const validRoles = ['asesor', 'freelancer'];
    if (!validRoles.includes(role)) {
      const error = new Error('Rol inválido. Use: asesor, freelancer');
      error.statusCode = 400;
      throw error;
    }

    const permisos = await prisma.permisosRol.findMany({
      where: { rol: { nombre: role } },
      include: { permiso: true }
    });

    const MODULES = Object.keys(MODULE_ACTIONS);
    const defaults = DEFAULT_ROLE_VALUES[role] || DEFAULT_ROLE_VALUES.asesor;
    const grouped = {};

    for (const mod of MODULES) {
      grouped[mod] = {};
      const actions = MODULE_ACTIONS[mod] || [];
      for (const act of actions) {
        const defVal = defaults[mod]?.[act];
        grouped[mod][act] = parseValor(act, mod, defVal ?? 'false', role);
      }
    }

    for (const pr of permisos) {
      const m = pr.permiso.modulo;
      const a = pr.permiso.accion;
      const v = pr.valor != null ? pr.valor : 'true';
      if (!grouped[m]) grouped[m] = {};
      grouped[m][a] = parseValor(a, m, v, role);
    }

    return grouped;
  }

  async updateRolePermissions(role, permissions) {
    const rol = await prisma.roles.findUnique({ where: { nombre: role } });
    if (!rol) {
      const error = new Error('Rol no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await prisma.permisosRol.deleteMany({ where: { rolId: rol.id } });

    for (const [modulo, accs] of Object.entries(permissions)) {
      for (const [accion, value] of Object.entries(accs)) {
        const encoded = encodeValor(value);

        let permiso = await prisma.permisos.findFirst({ where: { modulo, accion } });
        if (!permiso) {
          permiso = await prisma.permisos.create({
            data: { modulo, accion, descripcion: `${modulo} - ${accion}` }
          });
        }

        await prisma.permisosRol.create({
          data: { rolId: rol.id, permisoId: permiso.id, valor: encoded }
        });
      }
    }

    return { message: 'Permisos de rol actualizados' };
  }
}

module.exports = new RolesService();
