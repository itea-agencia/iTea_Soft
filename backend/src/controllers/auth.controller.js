const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { generateToken, getExpiryTime } = require('../utils/tokenUtils');
const { success, error } = require('../utils/apiResponse');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const { validarPassword } = require('../utils/passwordPolicy');

// key: email (lowercase), value: { code, expiresAt, attempts, sentAt }
const resetCodes = new Map();

// Un codigo de 6 digitos son un millon de combinaciones: sin limite de intentos se agota en
// minutos. Con 5 intentos por codigo, y un codigo nuevo cada 60 s como minimo, no.
const RESET_MAX_ATTEMPTS = 5;
const RESET_RESEND_MS = 60 * 1000;
const RESET_TTL_MS = 15 * 60 * 1000;
const CODIGO_INVALIDO = 'Código inválido o expirado. Solicita uno nuevo';

// Hash de relleno para que login tarde lo mismo exista o no el correo: sin esto, la
// respuesta rapida delata que el usuario no existe. Costo 12, el de las contrasenas que
// crea este backend. Se calcula al arrancar: hacerlo en el primer login lo volvia lento
// justo para el primer correo inexistente, que es el que se quiere disimular.
const dummyHash = bcrypt.hash('relleno-para-igualar-tiempos', 12);

// Devuelve el registro si el codigo es correcto. Si no, cuenta el intento y, al agotarlos,
// borra el codigo. Las tres salidas de error son el mismo mensaje a proposito: distinguir
// "no hay codigo" de "codigo incorrecto" le dice a un atacante si el correo existe.
function comprobarCodigo(email, code) {
  const key = String(email).toLowerCase();
  const record = resetCodes.get(key);
  if (!record) return null;

  if (Date.now() > record.expiresAt) {
    resetCodes.delete(key);
    return null;
  }

  // Agotados los intentos el registro SE QUEDA (bloqueado) en vez de borrarse: borrarlo
  // tambien borraba `sentAt`, y con el pedir un codigo nuevo dejaba de esperar los 60 s, asi
  // que se podian encadenar rondas de 5 intentos sin pausa.
  if (record.attempts >= RESET_MAX_ATTEMPTS) return null;

  const dado = Buffer.from(String(code).trim());
  const real = Buffer.from(record.code);
  const coincide = dado.length === real.length && crypto.timingSafeEqual(dado, real);
  if (!coincide) {
    record.attempts += 1;
    return null;
  }
  return record;
}


exports.login = async (req, res, next) => {
  try {
    const { email, password, remember } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      return error(res, 'Correo y contraseña requeridos', 400);
    }

    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        persona: { include: { tipoDocumento: true } },
        rol: { include: { permisosRol: { include: { permiso: true } } } }
      }
    });

    // Mismo mensaje y mismo tiempo para "no existe" y "contrasena incorrecta": si no, el
    // login sirve para averiguar que correos estan registrados.
    const validPassword = await bcrypt.compare(password, usuario?.passwordHash || (await dummyHash));
    if (!usuario || !validPassword) {
      return error(res, 'Correo o contraseña incorrectos', 401);
    }

    if (usuario.status === 'inactive') {
      return error(res, 'Usuario inactivo. Contacte al administrador', 401);
    }

    const token = generateToken({ userId: usuario.id, role: usuario.rol.nombre }, remember);
    const expiresAt = new Date(getExpiryTime(remember));

    await prisma.sesiones.create({
      data: {
        usuarioId: usuario.id,
        tokenHash: token,
        expiresAt,
        userAgent: req.headers['user-agent'] || null
      }
    });

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { ultimoLogin: new Date() }
    });

    const permisos = usuario.rol.permisosRol.map(pr => ({
      modulo: pr.permiso.modulo, accion: pr.permiso.accion, valor: pr.valor
    }));

    const maxAge = remember ? 1000 * 60 * 60 * 24 * 7 : 1000 * 60 * 60 * 24;
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge
    });

    success(res, {
      user: {
        id: usuario.id,
        personaId: usuario.personaId,
        name: `${usuario.persona.nombres} ${usuario.persona.apellidos}`,
        firstName: usuario.persona.nombres,
        lastName: usuario.persona.apellidos,
        email: usuario.email,
        role: usuario.rol.nombre,
        phone: usuario.persona.telefono,
        status: usuario.status,
        docType: usuario.persona.tipoDocumento?.abreviatura || null,
        docNumber: usuario.persona.documento,
        lastLogin: usuario.ultimoLogin,
        permisos
      },
      token,
      expiresAt
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      await prisma.sesiones.deleteMany({ where: { tokenHash: token } });
    }
    
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    });

    success(res, { message: 'Sesión cerrada' });
  } catch (err) {
    next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: req.user.id },
      include: {
        persona: { include: { tipoDocumento: true } },
        rol: { include: { permisosRol: { include: { permiso: true } } } }
      }
    });

    const permisos = usuario.rol.permisosRol.map(pr => ({
      modulo: pr.permiso.modulo, accion: pr.permiso.accion, valor: pr.valor
    }));

    success(res, {
      id: usuario.id,
      personaId: usuario.personaId,
      name: `${usuario.persona.nombres} ${usuario.persona.apellidos}`,
      firstName: usuario.persona.nombres,
      lastName: usuario.persona.apellidos,
      email: usuario.email,
      role: usuario.rol.nombre,
      phone: usuario.persona.telefono,
      status: usuario.status,
      docType: usuario.persona.tipoDocumento?.abreviatura || null,
      docNumber: usuario.persona.documento,
      lastLogin: usuario.ultimoLogin,
      permisos
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (typeof email !== 'string' || !email) {
      return error(res, 'El correo electrónico es requerido', 400);
    }

    const key = email.toLowerCase();
    // Respuesta identica exista o no el correo (y este activo o no): antes decia "no existe
    // ningun usuario con este correo", con lo que cualquiera podia listar los registrados.
    const respuesta = () => success(res, {
      message: 'Si el correo está registrado, enviamos un código de recuperación'
    });

    const usuario = await prisma.usuarios.findUnique({
      where: { email: key },
      include: { persona: true }
    });

    if (!usuario || usuario.status === 'inactive') {
      return respuesta();
    }

    // Sin esto, repetir la peticion manda un correo por cada una a la bandeja de la victima.
    const previo = resetCodes.get(key);
    if (previo && Date.now() - previo.sentAt < RESET_RESEND_MS) {
      return respuesta();
    }

    // randomInt es criptograficamente seguro; Math.random es predecible.
    const code = crypto.randomInt(100000, 1000000).toString();
    resetCodes.set(key, { code, expiresAt: Date.now() + RESET_TTL_MS, attempts: 0, sentAt: Date.now() });

    // Send email using emailService
    const enviado = await emailService.sendEmail({
      to: email.toLowerCase(),
      subject: 'iTea Travel - Código de recuperación de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #0f172a; padding: 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">iTea Travel</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px;">Hola <strong>${usuario.persona.nombres}</strong>,</p>
            <p style="font-size: 16px;">Has solicitado restablecer tu contraseña. Utiliza el siguiente código para completar el proceso:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background-color: #f1f5f9; padding: 15px 30px; border-radius: 8px; border: 1px dashed #cbd5e1; display: inline-block;">
                ${code}
              </span>
            </div>
            <p style="font-size: 14px; color: #64748b;">Este código es válido por 15 minutos. Si no has solicitado este cambio, por favor ignora este correo.</p>
          </div>
        </div>
      `
    });

    if (!enviado.success) {
      // No se le dice al cliente (seria la misma fuga de "el correo existe"), pero queda en
      // el log: antes se respondia "enviado" aunque Resend hubiera fallado.
      console.error('[forgotPassword] no se pudo enviar el correo de recuperacion');
    }
    respuesta();
  } catch (err) {
    next(err);
  }
};

exports.verifyCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (typeof email !== 'string' || typeof code !== 'string' || !email || !code) {
      return error(res, 'Correo y código son requeridos', 400);
    }

    if (!comprobarCodigo(email, code)) {
      return error(res, CODIGO_INVALIDO, 400);
    }

    success(res, { message: 'Código verificado correctamente' });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;

    if (typeof email !== 'string' || typeof code !== 'string' || !email || !code || !newPassword) {
      return error(res, 'Todos los campos son requeridos', 400);
    }

    // Antes que el codigo: una contrasena floja no debe gastar un intento del codigo.
    const problema = validarPassword(newPassword);
    if (problema) {
      return error(res, problema, 400, 'WEAK_PASSWORD');
    }

    if (!comprobarCodigo(email, code)) {
      return error(res, CODIGO_INVALIDO, 400);
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);

    const usuario = await prisma.usuarios.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return error(res, CODIGO_INVALIDO, 400);
    }

    await prisma.usuarios.update({
      where: { id: usuario.id },
      data: { passwordHash }
    });

    // Un codigo sirve una sola vez.
    resetCodes.delete(email.toLowerCase());

    // Se limpian las sesiones registradas, pero OJO: esto NO cierra las sesiones abiertas.
    // auth.js valida el JWT y nunca consulta la tabla `sesiones`, asi que un token ya emitido
    // sigue valiendo hasta que venza (1 dia, o 7 con "recordarme"). Lo mismo pasa con el
    // logout. Revocar de verdad exige que auth.js compruebe la sesion.
    await prisma.sesiones.deleteMany({ where: { usuarioId: usuario.id } });

    success(res, { message: 'Contraseña restablecida exitosamente' });
  } catch (err) {
    next(err);
  }
};
