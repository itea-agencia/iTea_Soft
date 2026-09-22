const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { buildMeta } = require('../utils/paginationHelper');
const emailService = require('../utils/emailService');
const { formatName, escaparHtml } = require('../utils/stringUtils');
const { normalizarEmail, correoDeEliminado } = require('../utils/emailUtils');
const sesiones = require('../services/sesiones.service');

exports.list = async (req, res, next) => {
  try {
    const { page, perPage, skip } = req.pagination;
    const { search, sortBy, sortOrder } = req;
    const { role, status } = req.query;

    // Parametros, no interpolacion: vienen del request.
    const like = `%${search}%`;
    const searchCondition = search
      ? Prisma.sql`AND (p.nombres ILIKE ${like} OR p.apellidos ILIKE ${like} OR u.email ILIKE ${like})`
      : Prisma.empty;
    const roleCondition = role ? Prisma.sql`AND r.nombre = ${String(role)}` : Prisma.empty;
    const statusCondition = status ? Prisma.sql`AND u.status::text = ${String(status)}` : Prisma.empty;

    const where = {};
    if (search) {
      where.OR = [
        { persona: { nombres: { contains: search, mode: 'insensitive' } } },
        { persona: { apellidos: { contains: search, mode: 'insensitive' } } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (role) where.rol = { nombre: role };
    if (status) where.status = status;
    where.persona = { ...where.persona, deletedAt: null };
    where.deletedAt = null;

    // Ejecución paralela: Conteo (Prisma) y Búsqueda (SQL Puro)
    const [total, usuariosRaw] = await Promise.all([
      prisma.usuarios.count({ where }),
      prisma.$queryRaw(Prisma.sql`
        SELECT 
          u.id, 
          u.email, 
          u.status, 
          u.ultimo_login as "ultimoLogin", 
          u.creado_at as "creadoAt",
          p.nombres as "firstName", 
          p.apellidos as "lastName", 
          p.telefono as "phone", 
          p.documento as "docNumber", 
          p.birth_date as "birthDate", 
          td.abreviatura as "docType",
          r.nombre as "role"
        FROM usuarios u
        JOIN personas p ON u.persona_id = p.id
        LEFT JOIN tipos_documento td ON p.tipo_documento_id = td.id
        JOIN roles r ON u.rol_id = r.id
        WHERE p.deleted_at IS NULL AND u.deleted_at IS NULL ${searchCondition} ${roleCondition} ${statusCondition}
        ORDER BY u.id DESC
        LIMIT ${perPage} OFFSET ${skip}
      `)
    ]);

    const data = usuariosRaw.map(u => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      role: u.role,
      phone: u.phone,
      docType: u.docType || null,
      docNumber: u.docNumber,
      status: u.status,
      birthDate: u.birthDate,
      lastLogin: u.ultimoLogin,
      createdAt: u.creadoAt,
    }));

    success(res, data, buildMeta(total, page, perPage));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        persona: { include: { tipoDocumento: true } },
        rol: true
      }
    });
    if (!usuario || usuario.deletedAt) return error(res, 'Usuario no encontrado', 404);
    success(res, {
      id: usuario.id,
      name: `${usuario.persona.nombres} ${usuario.persona.apellidos}`,
      firstName: usuario.persona.nombres,
      lastName: usuario.persona.apellidos,
      email: usuario.email,
      role: usuario.rol.nombre,
      phone: usuario.persona.telefono,
      docType: usuario.persona.tipoDocumento?.abreviatura || null,
      docNumber: usuario.persona.documento,
      status: usuario.status,
      birthDate: usuario.persona.birthDate,
      lastLogin: usuario.ultimoLogin,
      createdAt: usuario.creadoAt,
    });
  } catch (err) {
    next(err);
  }
};

// Lo que devuelven create y update: la misma forma que el listado.
const presentar = (u) => ({
  id: u.id,
  name: `${u.persona.nombres} ${u.persona.apellidos}`,
  firstName: u.persona.nombres,
  lastName: u.persona.apellidos,
  email: u.email,
  role: u.rol.nombre,
  phone: u.persona.telefono,
  docType: u.persona.tipoDocumento?.abreviatura || null,
  docNumber: u.persona.documento,
  status: u.status,
  birthDate: u.persona.birthDate,
  createdAt: u.creadoAt,
  lastLogin: u.ultimoLogin,
});

// Un correo esta ocupado si lo tiene CUALQUIER fila, sin distinguir mayusculas: las filas
// antiguas se guardaron sin normalizar. Un eliminado ya no lo retiene (ver `remove`).
const correoOcupadoPor = (email, exceptoId) => prisma.usuarios.findFirst({
  where: { email: { equals: email, mode: 'insensitive' }, ...(exceptoId ? { id: { not: exceptoId } } : {}) },
  select: { id: true },
});

const esAdmin = (req) => req.user?.role === 'admin';

exports.create = async (req, res, next) => {
  try {
    const data = req.body;

    if (typeof data.password !== 'string' || !data.password) {
      return error(res, 'La contraseña es requerida', 400, 'VALIDATION_ERROR');
    }
    const email = normalizarEmail(data.email);
    if (!email) return error(res, 'El correo no es válido', 400, 'VALIDATION_ERROR');

    const rol = await prisma.roles.findUnique({ where: { nombre: data.role } });
    if (!rol) return error(res, 'Rol no válido', 400, 'VALIDATION_ERROR');
    if (rol.nombre === 'admin' && !esAdmin(req)) {
      return error(res, 'Solo un administrador puede crear a otro administrador', 403, 'ADMIN_PROTEGIDO');
    }

    // La cedula es unica en `personas` y `usuarios.persona_id` tambien: quien ya tuvo cuenta
    // reutiliza su fila. Lo que se hace depende del estado de esa fila.
    let previo = null;
    if (data.docNumber) {
      previo = await prisma.usuarios.findFirst({ where: { persona: { documento: data.docNumber } } });
    }
    if (previo && !previo.deletedAt) {
      return previo.status === 'active'
        ? error(res, 'Este número de documento ya está registrado y activo como usuario', 409, 'DOCUMENTO_EN_USO')
        : error(res, 'Este documento pertenece a un usuario desactivado. Actívalo desde la lista de usuarios', 409, 'USUARIO_DESACTIVADO');
    }

    if (await correoOcupadoPor(email)) {
      return error(res, 'Ese correo ya está en uso por otro usuario', 409, 'EMAIL_EN_USO');
    }

    let tipoDocumentoId = null;
    if (data.docType) {
      const dt = await prisma.tiposDocumento.findUnique({ where: { abreviatura: data.docType } });
      if (dt) tipoDocumentoId = dt.id;
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const status = data.status === 'inactive' ? 'inactive' : 'active';

    // Persona y usuario juntos: si uno falla no debe quedar el otro. Antes la persona se
    // creaba primero y, si el usuario fallaba, quedaba huerfana.
    const usuario = await prisma.$transaction(async (tx) => {
      const existingPersona = data.docNumber
        ? await tx.personas.findUnique({ where: { documento: data.docNumber } })
        : null;

      const nombres = formatName(data.firstName || data.name?.split(' ')[0] || existingPersona?.nombres || '');
      const apellidos = formatName(data.lastName || data.name?.split(' ').slice(1).join(' ') || existingPersona?.apellidos || '');

      const persona = existingPersona
        ? await tx.personas.update({
            where: { id: existingPersona.id },
            data: {
              nombres,
              apellidos,
              tipoDocumentoId: tipoDocumentoId || existingPersona.tipoDocumentoId,
              email,
              telefono: data.phone || existingPersona.telefono,
              birthDate: data.birthDate ? new Date(data.birthDate) : existingPersona.birthDate,
              status,
              deletedAt: null
            }
          })
        : await tx.personas.create({
            data: {
              nombres,
              apellidos,
              tipoDocumentoId,
              documento: data.docNumber || null,
              email,
              telefono: data.phone,
              birthDate: data.birthDate ? new Date(data.birthDate) : null,
              status
            }
          });

      const include = { persona: { include: { tipoDocumento: true } }, rol: true };
      // Reingreso de un eliminado: vuelve SU fila, con su historial, con el correo y la
      // contrasena nuevos. Sus datos personales son los de siempre.
      return previo
        ? tx.usuarios.update({
            where: { id: previo.id },
            data: { email, passwordHash, rolId: rol.id, status, deletedAt: null },
            include
          })
        : tx.usuarios.create({
            data: { personaId: persona.id, email, passwordHash, rolId: rol.id, status },
            include
          });
    });

    try {
      await emailService.sendEmail({
        to: email,
        subject: '¡Bienvenido a Samtur Travel - Cuenta Creada!',
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; overflow: hidden;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px;">¡Bienvenido a Samtur Travel!</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px;">Hola <strong>${escaparHtml(usuario.persona.nombres)}</strong>,</p>
              <p style="font-size: 16px;">Tu cuenta ha sido creada exitosamente en nuestro sistema.</p>
              <p style="font-size: 16px;"><strong>Tus credenciales de acceso temporal son:</strong></p>
              <ul style="font-size: 16px; background: #f8fafc; padding: 15px 30px; border-radius: 6px;">
                <li><strong>Correo:</strong> ${escaparHtml(email)}</li>
                <li><strong>Contraseña:</strong> ${escaparHtml(data.password)}</li>
              </ul>
              <p style="font-size: 16px; margin-top: 20px;">Te recomendamos cambiar tu contraseña una vez inicies sesión por motivos de seguridad.</p>
            </div>
          </div>
        `,
        // La contrasena llega tal cual se escribio, sin pasar por HTML.
        text: [
          '¡Bienvenido a Samtur Travel!',
          '',
          `Hola ${usuario.persona.nombres},`,
          'Tu cuenta ha sido creada exitosamente en nuestro sistema.',
          '',
          'Tus credenciales de acceso temporal son:',
          `Correo: ${email}`,
          `Contraseña: ${data.password}`,
          '',
          'Te recomendamos cambiar tu contraseña una vez inicies sesión por motivos de seguridad.',
        ].join('\n'),
      });
      console.log(`[USER CREATE] Welcome email sent successfully to ${email}`);
    } catch (emailErr) {
      console.error('[ERROR] Sending welcome email:', emailErr.message);
    }

    success(res, { ...presentar(usuario), reactivated: Boolean(previo) }, null, 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;

    const usuario = await prisma.usuarios.findUnique({ where: { id }, include: { persona: true, rol: true } });
    // Un eliminado no existe para la interfaz: no se edita. Volver es reingresar por `create`.
    if (!usuario || usuario.deletedAt) return error(res, 'Usuario no encontrado', 404);

    const objetivoEsAdmin = usuario.rol.nombre === 'admin';

    if (data.status !== undefined && !['active', 'inactive'].includes(data.status)) {
      return error(res, 'Estado no válido', 400, 'VALIDATION_ERROR');
    }
    const desactiva = data.status === 'inactive' && usuario.status !== 'inactive';
    if (desactiva && id === req.user.id) {
      return error(res, 'No puedes desactivar tu propia cuenta', 403, 'AUTOACCION');
    }
    if (desactiva && objetivoEsAdmin) {
      return error(res, 'Un administrador no se puede desactivar desde la aplicación', 403, 'ADMIN_PROTEGIDO');
    }

    let nuevoRol = null;
    if (data.role) {
      nuevoRol = await prisma.roles.findUnique({ where: { nombre: data.role } });
      if (!nuevoRol) return error(res, 'Rol no válido', 400, 'VALIDATION_ERROR');
    }
    const cambiaRol = nuevoRol && nuevoRol.id !== usuario.rolId;
    // Si a un admin se le pudiera cambiar el rol, se lo bajaria a asesor y despues se lo
    // desactivaria: la regla de arriba no serviria de nada.
    if (cambiaRol && objetivoEsAdmin) {
      return error(res, 'No se puede cambiar el rol de un administrador desde la aplicación', 403, 'ADMIN_PROTEGIDO');
    }
    if (cambiaRol && nuevoRol.nombre === 'admin' && !esAdmin(req)) {
      return error(res, 'Solo un administrador puede promover a otro usuario a administrador', 403, 'ADMIN_PROTEGIDO');
    }

    let email;
    if (data.email !== undefined && data.email !== '') {
      email = normalizarEmail(data.email);
      if (!email) return error(res, 'El correo no es válido', 400, 'VALIDATION_ERROR');
      if (email !== usuario.email && await correoOcupadoPor(email, id)) {
        return error(res, 'Ese correo ya está en uso por otro usuario', 409, 'EMAIL_EN_USO');
      }
    }

    const personaUpdate = {};
    if (data.firstName) personaUpdate.nombres = formatName(data.firstName);
    if (data.lastName) personaUpdate.apellidos = formatName(data.lastName);
    if (data.phone !== undefined) personaUpdate.telefono = data.phone;

    if (data.docNumber !== undefined) {
      if (data.docNumber) {
        const existingDoc = await prisma.personas.findUnique({
          where: { documento: data.docNumber }
        });
        if (existingDoc && existingDoc.id !== usuario.personaId) {
          return error(res, 'Este número de documento ya está asignado a otra persona en el sistema', 409, 'DOCUMENTO_EN_USO');
        }
      }
      personaUpdate.documento = data.docNumber;
    }

    if (data.birthDate) personaUpdate.birthDate = new Date(data.birthDate);
    if (email) personaUpdate.email = email;

    if (data.docType) {
      const dt = await prisma.tiposDocumento.findUnique({ where: { abreviatura: data.docType } });
      if (dt) personaUpdate.tipoDocumentoId = dt.id;
    }

    const updateData = {};
    if (email) updateData.email = email;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 12);
    if (cambiaRol) updateData.rolId = nuevoRol.id;
    if (data.status) updateData.status = data.status;

    const updated = await prisma.$transaction(async (tx) => {
      if (Object.keys(personaUpdate).length > 0) {
        personaUpdate.updatedAt = new Date();
        await tx.personas.update({ where: { id: usuario.personaId }, data: personaUpdate });
      }
      return tx.usuarios.update({
        where: { id },
        data: updateData,
        include: { persona: { include: { tipoDocumento: true } }, rol: true }
      });
    });

    // Lo que el usuario ya tiene abierto debe reflejar el cambio en su siguiente clic.
    if (desactiva) {
      // Desactivar cierra sus sesiones al instante.
      await sesiones.revocarSesionesDeUsuario(id);
    } else if (updateData.passwordHash) {
      // Cambiar la contrasena cierra las demas sesiones; la de quien la cambia por si mismo
      // se conserva para no echarlo de la pantalla en la que acaba de guardar.
      await sesiones.revocarSesionesDeUsuario(id, { exceptoHash: id === req.user.id ? req.tokenHash : undefined });
    } else if (cambiaRol || updateData.email) {
      // El rol y el correo se leen al autenticar y se guardan en cache.
      sesiones.invalidarCacheDeUsuario(id);
    }

    success(res, presentar(updated));
  } catch (err) {
    next(err);
  }
};

// "Eliminar" es la baja DEFINITIVA. Sus ventas siguen atribuidas a el (cuelgan de
// `usuario_id`, que no se toca), pero su correo queda libre para darselo a otra persona como
// usuario nuevo. La suspension temporal es `update` con status = 'inactive'.
exports.remove = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const usuario = await prisma.usuarios.findUnique({ where: { id }, include: { persona: true, rol: true } });
    if (!usuario || usuario.deletedAt) return error(res, 'Usuario no encontrado', 404);

    if (id === req.user.id) {
      return error(res, 'No puedes eliminar tu propia cuenta', 403, 'AUTOACCION');
    }
    if (usuario.rol.nombre === 'admin') {
      return error(res, 'Un administrador no se puede eliminar desde la aplicación', 403, 'ADMIN_PROTEGIDO');
    }

    const tieneOtrosRoles = await prisma.clientes.findFirst({ where: { personaId: usuario.personaId } })
      || await prisma.comisionistas.findFirst({ where: { personaId: usuario.personaId } });

    await prisma.$transaction(async (tx) => {
      await tx.usuarios.update({
        where: { id },
        // El correo real NO se pierde: sigue en `personas.email`, que no es unico.
        data: { status: 'inactive', deletedAt: new Date(), email: correoDeEliminado(id) }
      });

      // Si la persona tambien es cliente o comisionista sigue existiendo como tal.
      if (!tieneOtrosRoles) {
        await tx.personas.update({
          where: { id: usuario.personaId },
          data: { deletedAt: new Date(), status: 'inactive' }
        });
      }
    });

    await sesiones.revocarSesionesDeUsuario(id);

    success(res, { message: 'Usuario eliminado' });
  } catch (err) {
    next(err);
  }
};
