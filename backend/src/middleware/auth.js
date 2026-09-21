const { verifyToken } = require('../utils/tokenUtils');
const prisma = require('../config/db');
const { error } = require('../utils/apiResponse');
const sesiones = require('../services/sesiones.service');

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      // Sin token no hay identidad. Aqui hubo un bypass de pruebas que asignaba
      // `{ id: 1, role: 'admin' }` a cualquier request sin cabecera, y dejaba TODAS las
      // rutas (ventas, facturas de Siigo, usuarios) abiertas a quien no se autenticara.
      return error(res, 'Autenticación requerida', 401, 'NO_TOKEN');
    }

    const token = header.split(' ')[1];
    const decoded = verifyToken(token);
    const tokenHash = sesiones.hashToken(token);

    const cached = sesiones.leerCache(tokenHash);
    if (cached) {
      req.user = cached.user;
      req.tokenHash = tokenHash;
      return next();
    }

    // Que el JWT sea valido no basta: la sesion tiene que seguir registrada. Un logout, un
    // cambio de contrasena o una baja borran esa fila, y con ella el acceso, aunque el token
    // no haya vencido.
    const sesion = await prisma.sesiones.findFirst({
      where: { tokenHash, expiresAt: { gt: new Date() } },
      include: {
        usuario: {
          include: {
            persona: true,
            rol: { include: { permisosRol: { include: { permiso: true } } } }
          }
        }
      }
    });

    if (!sesion || sesion.usuarioId !== decoded.userId) {
      return error(res, 'La sesión ya no es válida. Inicia sesión de nuevo', 401, 'SESSION_REVOKED');
    }

    const usuario = sesion.usuario;
    if (usuario.status === 'inactive' || usuario.deletedAt) {
      return error(res, 'Usuario no encontrado o inactivo', 401, 'USER_INACTIVE');
    }

    const userData = {
      id: usuario.id,
      personaId: usuario.personaId,
      email: usuario.email,
      nombre: `${usuario.persona.nombres} ${usuario.persona.apellidos}`,
      role: usuario.rol.nombre,
      permisosRol: usuario.rol.permisosRol.map(pr => ({
        modulo: pr.permiso.modulo,
        accion: pr.permiso.accion,
        valor: pr.valor
      })),
    };

    sesiones.guardarCache(tokenHash, userData, sesion.expiresAt);

    req.user = userData;
    req.tokenHash = tokenHash;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return error(res, 'Token inválido o expirado', 401, 'INVALID_TOKEN');
    }
    next(err);
  }
}

module.exports = auth;
