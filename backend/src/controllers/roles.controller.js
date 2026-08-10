const { success } = require('../utils/apiResponse');
const rolesService = require('../services/roles.service');
const { AUTH_CACHE } = require('../middleware/auth');

exports.getPermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const permissions = await rolesService.getRolePermissions(role);
    success(res, permissions);
  } catch (err) {
    next(err);
  }
};

exports.updatePermissions = async (req, res, next) => {
  try {
    const { role } = req.params;
    const { permissions } = req.body;
    
    const result = await rolesService.updateRolePermissions(role, permissions);
    
    // Limpiar toda la caché de autenticación en RAM para que todos los usuarios
    // del rol recarguen sus permisos en la próxima petición
    AUTH_CACHE.clear();

    success(res, result);
  } catch (err) {
    next(err);
  }
};
