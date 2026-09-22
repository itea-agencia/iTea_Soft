const crypto = require('crypto');
const prisma = require('../config/db');

// Sesiones: el JWT dice quien eres, la fila de `sesiones` dice que esa sesion sigue viva.
// auth.js exige las dos cosas. Antes solo miraba el JWT, asi que cerrar sesion, cambiar la
// contrasena o inactivar al usuario no invalidaban un token ya emitido hasta que vencia
// (1 dia, o 7 con "recordarme").

// La cache evita ir a la base (Supabase, lejos) en cada clic. Va indexada por TOKEN y no por
// usuario: cerrar una sesion no debe cerrar las de los otros dispositivos del mismo usuario.
// Dura poco y se invalida a mano en cada cambio que importa; el TTL es solo la red de
// seguridad para lo que cambie por fuera del proceso (un script de db-manual).
//
// Vive en la memoria de UNA instancia del backend. Con varias, revocar en una no se veria en
// las otras hasta que venza el TTL.
const CACHE_TTL_MS = 5 * 60 * 1000;
const cache = new Map(); // tokenHash -> { user, userId, expiresAt }

// En la base se guarda el SHA-256 del token, no el token: una filtracion de la tabla no debe
// entregar sesiones validas. (La columna ya se llamaba `token_hash`; antes guardaba el JWT.)
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function leerCache(tokenHash) {
  const entrada = cache.get(tokenHash);
  if (!entrada) return null;
  if (entrada.expiresAt <= Date.now()) {
    cache.delete(tokenHash);
    return null;
  }
  return entrada;
}

// La entrada no puede vivir mas que la sesion que respalda.
function guardarCache(tokenHash, user, sesionExpiraAt) {
  cache.set(tokenHash, {
    user,
    userId: user.id,
    expiresAt: Math.min(Date.now() + CACHE_TTL_MS, new Date(sesionExpiraAt).getTime()),
  });
}

// Saca de la cache TODAS las entradas de un usuario (sin tocar la base): para cuando cambia
// algo que se lee al autenticar, como su rol.
function invalidarCacheDeUsuario(userId) {
  for (const [hash, entrada] of cache) {
    if (entrada.userId === userId) cache.delete(hash);
  }
}

// Cuando cambian los permisos de un rol, cualquier usuario de ese rol tiene los suyos viejos.
function limpiarCache() {
  cache.clear();
}

// Cierra las sesiones de un usuario: borra sus filas y saca sus entradas de la cache.
// `exceptoHash` deja viva una (la actual de quien cambia su propia contrasena).
async function revocarSesionesDeUsuario(userId, { exceptoHash } = {}) {
  const where = { usuarioId: userId };
  if (exceptoHash) where.tokenHash = { not: exceptoHash };
  const { count } = await prisma.sesiones.deleteMany({ where });
  for (const [hash, entrada] of cache) {
    if (entrada.userId === userId && hash !== exceptoHash) cache.delete(hash);
  }
  return count;
}

// Logout: solo la sesion de este token.
async function revocarSesion(tokenHash) {
  cache.delete(tokenHash);
  await prisma.sesiones.deleteMany({ where: { tokenHash } });
}

module.exports = {
  hashToken,
  leerCache,
  guardarCache,
  invalidarCacheDeUsuario,
  limpiarCache,
  revocarSesionesDeUsuario,
  revocarSesion,
};
