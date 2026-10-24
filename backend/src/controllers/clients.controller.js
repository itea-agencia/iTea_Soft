const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { buildMeta } = require('../utils/paginationHelper');
const siigoService = require('../services/siigo.service');
const ciudadesDane = require('../config/ciudades-dane');
const { permisosEfectivos, alcanceDe } = require('../config/permisos');
const { completarPersona } = require('../utils/personas');
const { auditar } = require('../utils/auditoria');

// Sincroniza el tercero en Siigo y guarda su id en la persona, para no volver a buscarlo
// por documento en cada emision de factura. Se ejecuta en segundo plano: si Siigo esta
// caido, el cliente ya quedo creado en iTea y `siigo_customer_id` queda nulo, lo que
// permite detectar los pendientes y reintentar.
// Opcionales, pero si llega un codigo de ciudad tiene que ser uno real: Siigo rechaza
// codigos DANE invalidos y su mensaje de error no dice cual fue el problema.
function validarCiudad(cityCode) {
  if (cityCode === undefined || cityCode === null || cityCode === '') return null;
  if (!ciudadesDane.existe(cityCode)) {
    throw Object.assign(
      new Error(`La ciudad con código "${cityCode}" no está en el catálogo DANE`),
      { statusCode: 400, code: 'INVALID_CITY_CODE' },
    );
  }
  return String(cityCode);
}

function sincronizarConSiigo(persona, contexto) {
  if (!persona?.documento) return;

  siigoService.getOrCreateCustomer(persona)
    .then(async (customerSiigo) => {
      if (customerSiigo?.id && customerSiigo.id !== persona.siigoCustomerId) {
        await prisma.personas.update({
          where: { id: persona.id },
          data: { siigoCustomerId: String(customerSiigo.id) }
        });
      }
    })
    .catch((siigoError) => {
      console.error(`Siigo: fallo la sincronizacion del cliente (${contexto}):`, siigoError.message);
    });
}

exports.list = async (req, res, next) => {
  try {
    const { page, perPage, skip } = req.pagination;
    const { search, sortBy, sortOrder } = req;
    const { status } = req.query;

    const where = {};
    if (search) {
      where.persona = {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { documento: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    if (status) where.persona = { ...where.persona, status };

    if (req.permissionScope === 'own') {
      where.creadoPorId = req.user.id;
    }

    // Parametros, no interpolacion: `search` y `status` vienen del request.
    const like = `%${search}%`;
    const searchCondition = search
      ? Prisma.sql`AND (p.nombres ILIKE ${like} OR p.apellidos ILIKE ${like} OR p.documento ILIKE ${like} OR p.email ILIKE ${like})`
      : Prisma.empty;
    const statusCondition = status ? Prisma.sql`AND p.status::text = ${String(status)}` : Prisma.empty;
    const ownCondition = req.permissionScope === 'own' ? Prisma.sql`AND c.creado_por_id = ${req.user.id}` : Prisma.empty;

    const sortFieldMapSQL = { 'creadoAt': 'c.fecha_registro', 'name': 'c.persona_id', 'date': 'c.fecha_registro' };
    const sqlOrderBy = sortFieldMapSQL[sortBy] || 'c.fecha_registro';

    const [total, clientesRaw] = await Promise.all([
      prisma.clientes.count({ where }),
      prisma.$queryRaw(Prisma.sql`
        SELECT 
          c.id,
          c.fecha_registro as "fechaRegistro",
          c.creado_por_id as "creadoPorId",
          p.nombres as "firstName",
          p.apellidos as "lastName",
          p.documento as "docNumber",
          p.telefono as "phone",
          p.email,
          p.birth_date as "birthDate",
          p.direccion as "address",
          p.ciudad_codigo_dane as "cityCode",
          p.status,
          td.abreviatura as "docType"
        FROM clientes c
        JOIN personas p ON c.persona_id = p.id
        LEFT JOIN tipos_documento td ON p.tipo_documento_id = td.id
        WHERE 1=1 ${searchCondition} ${statusCondition} ${ownCondition}
        ORDER BY ${Prisma.raw(sqlOrderBy)} ${Prisma.raw(sortOrder === 'desc' ? 'DESC' : 'ASC')}
        LIMIT ${perPage} OFFSET ${skip}
      `)
    ]);

    const data = clientesRaw.map(c => ({
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      name: `${c.firstName} ${c.lastName}`,
      docType: c.docType || null,
      docNumber: c.docNumber,
      phone: c.phone,
      email: c.email,
      birthDate: c.birthDate,
      address: c.address || null,
      cityCode: c.cityCode || null,
      cityName: ciudadesDane.buscar(c.cityCode)?.nombre || null,
      status: c.status,
      registrationDate: c.fechaRegistro,
      createdBy: c.creadoPorId
    }));

    success(res, data, buildMeta(total, page, perPage));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    // Las ventas del cliente se muestran con el alcance de `sales.view`, no con el del cliente:
    // antes esta ficha devolvia hasta 50 ventas de cualquier asesor a quien pudiera ver el
    // cliente, con sus detalles.
    const alcanceVentas = alcanceDe(permisosEfectivos(req.user), 'sales', 'view');
    const includeSales = req.query.includeSales === 'true' && alcanceVentas !== false;

    const cliente = await prisma.clientes.findUnique({
      where: { id },
      include: {
        persona: { include: { tipoDocumento: true } },
        ventas: includeSales ? {
          where: alcanceVentas === 'own' ? { usuarioId: req.user.id } : undefined,
          include: { detalleVentas: true, usuario: { include: { persona: true } } },
          orderBy: { creadoAt: 'desc' },
          take: 50
        } : false
      }
    });

    if (!cliente) return error(res, 'Cliente no encontrado', 404);

    const data = {
      id: cliente.id,
      firstName: cliente.persona.nombres,
      lastName: cliente.persona.apellidos,
      name: `${cliente.persona.nombres} ${cliente.persona.apellidos}`,
      docType: cliente.persona.tipoDocumento?.abreviatura || null,
      docNumber: cliente.persona.documento,
      phone: cliente.persona.telefono,
      email: cliente.persona.email,
      birthDate: cliente.persona.birthDate,
      address: cliente.persona.direccion || null,
      cityCode: cliente.persona.ciudadCodigoDane || null,
      cityName: ciudadesDane.buscar(cliente.persona.ciudadCodigoDane)?.nombre || null,
      status: cliente.persona.status,
      registrationDate: cliente.fechaRegistro,
      createdBy: cliente.creadoPorId,
      sales: includeSales ? cliente.ventas?.map(v => ({
        id: v.id,
        total: v.montoTotal,
        status: v.status,
        date: v.creadoAt,
        asesorName: v.usuario ? `${v.usuario.persona.nombres} ${v.usuario.persona.apellidos}` : null
      })) : undefined
    };

    success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const data = req.body;
    let tipoDocumentoId = null;

    if (data.docType) {
      const tipoDoc = await prisma.tiposDocumento.findUnique({
        where: { abreviatura: data.docType }
      });
      if (tipoDoc) tipoDocumentoId = tipoDoc.id;
    }

    let existingClient = null;
    // Check if client with this document already exists
    if (data.docNumber) {
      existingClient = await prisma.clientes.findFirst({
        where: { persona: { documento: data.docNumber } }
      });
      if (existingClient) {
        if (!existingClient.deletedAt) {
          // Con alcance "Propios" el cliente puede ser de otro usuario y no aparecer en su
          // lista: no se le muestra ni se le deja venderle (decision 6 del diseno de permisos).
          return error(res, 'Este número de documento ya está registrado como cliente. Si no lo ves en tu lista, es de otro usuario: pide la venta a un asesor o administrador.', 400, 'CLIENTE_EXISTENTE');
        }
      }
    }

    let persona;
    if (data.docNumber) {
      const existingPersona = await prisma.personas.findUnique({
        where: { documento: data.docNumber }
      });
      if (existingPersona && existingClient) {
        // Reingreso de un cliente eliminado: sus datos se actualizan con los del formulario.
        persona = await prisma.personas.update({
          where: { id: existingPersona.id },
          data: {
            nombres: data.firstName || existingPersona.nombres,
            apellidos: data.lastName || existingPersona.apellidos,
            tipoDocumentoId: tipoDocumentoId || existingPersona.tipoDocumentoId,
            email: data.email || existingPersona.email,
            telefono: data.phone || existingPersona.telefono,
            birthDate: data.birthDate ? new Date(data.birthDate) : existingPersona.birthDate,
            direccion: data.address !== undefined ? (data.address || null) : existingPersona.direccion,
            ciudadCodigoDane: data.cityCode !== undefined ? validarCiudad(data.cityCode) : existingPersona.ciudadCodigoDane,
            status: 'active',
            deletedAt: null
          }
        });
      } else if (existingPersona) {
        // La persona existe pero no es cliente (un pasajero, un comisionista, un usuario): solo
        // se completa lo que no tiene. Ver utils/personas.js.
        persona = await prisma.personas.update({
          where: { id: existingPersona.id },
          data: {
            ...completarPersona(existingPersona, {
              nombres: data.firstName,
              apellidos: data.lastName,
              tipoDocumentoId,
              email: data.email,
              telefono: data.phone,
              birthDate: data.birthDate ? new Date(data.birthDate) : null,
              direccion: data.address,
              ciudadCodigoDane: validarCiudad(data.cityCode),
            }),
            status: 'active',
            deletedAt: null
          }
        });
      }
    }

    if (!persona) {
      persona = await prisma.personas.create({
        data: {
          nombres: data.firstName || '',
          apellidos: data.lastName || '',
          tipoDocumentoId,
          documento: data.docNumber || null,
          email: data.email,
          telefono: data.phone,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
          direccion: data.address || null,
          ciudadCodigoDane: validarCiudad(data.cityCode),
          status: 'active'
        }
      });
    }

    let cliente;
    if (existingClient) {
      cliente = await prisma.clientes.update({
        where: { id: existingClient.id },
        data: {
          creadoPorId: req.user.id,
          deletedAt: null
        },
        include: { persona: true }
      });
    } else {
      cliente = await prisma.clientes.create({
        data: { personaId: persona.id, creadoPorId: req.user.id },
        include: { persona: true }
      });
    }

    sincronizarConSiigo(persona, 'creacion');

    success(res, {
      id: cliente.id,
      firstName: persona.nombres,
      lastName: persona.apellidos,
      name: `${persona.nombres} ${persona.apellidos}`,
      docType: data.docType,
      docNumber: data.docNumber,
      phone: data.phone,
      email: data.email,
      birthDate: data.birthDate,
      status: 'active',
      registrationDate: cliente.fechaRegistro,
      createdBy: cliente.creadoPorId
    }, null, 201);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;

    const cliente = await prisma.clientes.findUnique({ where: { id }, include: { persona: true } });
    if (!cliente) return error(res, 'Cliente no encontrado', 404);

    const personaData = {};
    if (data.firstName) personaData.nombres = data.firstName;
    if (data.lastName) personaData.apellidos = data.lastName;
    
    if (data.docType) {
      const tipoDoc = await prisma.tiposDocumento.findUnique({
        where: { abreviatura: data.docType }
      });
      if (tipoDoc) personaData.tipoDocumentoId = tipoDoc.id;
    }

    if (data.docNumber) {
      const existingDoc = await prisma.personas.findUnique({
        where: { documento: data.docNumber }
      });
      if (existingDoc && existingDoc.id !== cliente.personaId) {
        return error(res, 'Este número de documento ya está asignado a otra persona en el sistema', 400);
      }
      personaData.documento = data.docNumber;
    }

    if (data.email) personaData.email = data.email;
    if (data.phone) personaData.telefono = data.phone;
    if (data.birthDate) personaData.birthDate = new Date(data.birthDate);
    // Con `!== undefined` en vez de truthy, para poder borrar la direccion enviando ''.
    if (data.address !== undefined) personaData.direccion = data.address || null;
    if (data.cityCode !== undefined) personaData.ciudadCodigoDane = validarCiudad(data.cityCode);

    let updatedPersona = cliente.persona;
    if (Object.keys(personaData).length > 0) {
      personaData.updatedAt = new Date();
      updatedPersona = await prisma.personas.update({
        where: { id: cliente.personaId },
        data: personaData
      });
    }

    sincronizarConSiigo(updatedPersona, 'actualizacion');

    success(res, { message: 'Cliente actualizado' });
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const cliente = await prisma.clientes.findUnique({ where: { id }, include: { persona: true } });
    if (!cliente) return error(res, 'Cliente no encontrado', 404);

    const newStatus = cliente.persona.status === 'active' ? 'inactive' : 'active';
    await prisma.$transaction(async (tx) => {
      await tx.personas.update({
        where: { id: cliente.personaId },
        data: { status: newStatus, updatedAt: new Date() }
      });
      if (newStatus === 'inactive') {
        await auditar(tx, req.user.id, 'clients', 'toggle', `cliente ${id}: desactivado`);
      }
    });

    success(res, { status: newStatus });
  } catch (err) {
    next(err);
  }
};

