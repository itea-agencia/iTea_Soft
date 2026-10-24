const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { buildMeta } = require('../utils/paginationHelper');
const { completarPersona } = require('../utils/personas');
const { auditar } = require('../utils/auditoria');

exports.list = async (req, res, next) => {
  try {
    const { page, perPage, skip } = req.pagination;
    const { search, sortBy, sortOrder } = req;
    const { status } = req.query;

    const where = { deletedAt: null };
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
    if (status) where.status = status;
    // "Propios" son los que creo ese usuario. Antes el panel ofrecia el alcance pero aca no se
    // aplicaba: cualquiera con permiso de ver llegaba a todos.
    if (req.permissionScope === 'own') where.creadoPorId = req.user.id;
    const ownCondition = req.permissionScope === 'own' ? Prisma.sql`AND r.creado_por_id = ${req.user.id}` : Prisma.empty;

    // Parametros, no interpolacion: `search` y `status` vienen del request.
    const like = `%${search}%`;
    const searchCondition = search
      ? Prisma.sql`AND (p.nombres ILIKE ${like} OR p.apellidos ILIKE ${like} OR p.documento ILIKE ${like} OR p.email ILIKE ${like})`
      : Prisma.empty;
    const statusCondition = status ? Prisma.sql`AND r.status::text = ${String(status)}` : Prisma.empty;

    const sortFieldMapSQL = { 'creadoAt': 'r.creado_at', 'name': 'p.nombres', 'date': 'r.creado_at' };
    const sqlOrderBy = sortFieldMapSQL[sortBy] || 'r.creado_at';

    const [total, responsablesRaw] = await Promise.all([
      prisma.responsables.count({ where }),
      prisma.$queryRaw(Prisma.sql`
        SELECT 
          r.id,
          r.creado_at as "creadoAt",
          p.id as "personaId",
          p.nombres as "firstName",
          p.apellidos as "lastName",
          p.documento as "docNumber",
          p.telefono as "phone",
          p.email,

          r.status,
          r.creado_por_id as "creadoPorId",
          td.abreviatura as "docType",
          COALESCE(
            (SELECT SUM(v.monto_total - COALESCE(v.monto_pagado_credito, 0))
             FROM ventas v
             WHERE v.responsable_id = r.id AND v.status IN ('credito', 'abonado')), 0
          ) as "deudaTotal"
        FROM responsables r
        JOIN personas p ON r.persona_id = p.id
        LEFT JOIN tipos_documento td ON p.tipo_documento_id = td.id
        WHERE r.deleted_at IS NULL ${searchCondition} ${statusCondition} ${ownCondition}
        ORDER BY ${Prisma.raw(sqlOrderBy)} ${Prisma.raw(sortOrder === 'desc' ? 'DESC' : 'ASC')}
        LIMIT ${perPage} OFFSET ${skip}
      `)
    ]);

    const data = responsablesRaw.map(r => ({
      id: r.id,
      personaId: r.personaId,
      firstName: r.firstName,
      lastName: r.lastName,
      name: `${r.firstName} ${r.lastName}`,
      docType: r.docType || null,
      docNumber: r.docNumber,
      phone: r.phone,
      email: r.email,

      status: r.status,
      creadoAt: r.creadoAt,
      createdBy: r.creadoPorId,
      deudaTotal: parseFloat(r.deudaTotal)
    }));

    success(res, data, buildMeta(total, page, perPage));
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const includeSales = req.query.includeSales === 'true';

    const responsable = await prisma.responsables.findUnique({
      where: { id },
      include: {
        persona: { include: { tipoDocumento: true } },
        ventas: includeSales ? {
          where: { status: { in: ['credito', 'abonado'] } },
          orderBy: { creadoAt: 'desc' },
          take: 50
        } : false
      }
    });

    if (!responsable || responsable.deletedAt) return error(res, 'Responsable no encontrado', 404);

    let deudaTotal = 0;
    let ventasDetalladas = [];
    if (includeSales && responsable.ventas) {
      ventasDetalladas = responsable.ventas.map(v => {
        const saldoPendiente = v.montoTotal - (v.montoPagadoCredito || 0);
        deudaTotal += saldoPendiente;
        return {
          id: v.id,
          date: v.creadoAt,
          montoTotal: v.montoTotal,
          montoPagadoCredito: v.montoPagadoCredito || 0,
          saldoPendiente,
          status: v.status
        };
      });
    }

    const data = {
      id: responsable.id,
      personaId: responsable.persona.id,
      firstName: responsable.persona.nombres,
      lastName: responsable.persona.apellidos,
      name: `${responsable.persona.nombres} ${responsable.persona.apellidos}`,
      docTypeId: responsable.persona.tipoDocumento?.id || null,
      docType: responsable.persona.tipoDocumento?.abreviatura || null,
      docNumber: responsable.persona.documento,
      phone: responsable.persona.telefono,
      email: responsable.persona.email,

      status: responsable.status,
      creadoAt: responsable.creadoAt,
      deudaTotal,
      ventas: ventasDetalladas
    };

    success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const { firstName, lastName, docType, docTypeId: rawDocTypeId, docNumber, phone, email } = req.body;

    // Resolve docTypeId from abbreviation if not provided as integer
    let docTypeId = rawDocTypeId ? parseInt(rawDocTypeId) : null;
    if (!docTypeId && docType) {
      const tipoDoc = await prisma.tiposDocumento.findFirst({ where: { abreviatura: docType } });
      docTypeId = tipoDoc ? tipoDoc.id : null;
    }

    const result = await prisma.$transaction(async (tx) => {
      let persona = docNumber ? await tx.personas.findFirst({
        where: { documento: docNumber }
      }) : null;

      if (!persona) {
        persona = await tx.personas.create({
          data: {
            nombres: firstName,
            apellidos: lastName,
            tipoDocumentoId: docTypeId || null,
            documento: docNumber || null,
            telefono: phone,
            email: email,
          }
        });
      } else {
        const existingResponsable = await tx.responsables.findFirst({
          where: { personaId: persona.id }
        });
        if (existingResponsable) {
          if (!existingResponsable.deletedAt) {
            throw new Error('Ya existe un responsable con este documento');
          } else {
            // Restore it
            await tx.responsables.update({
              where: { id: existingResponsable.id },
              data: { deletedAt: null, status: 'active' }
            });
            await tx.personas.update({
              where: { id: persona.id },
              data: {
                nombres: firstName,
                apellidos: lastName,
                tipoDocumentoId: docTypeId || persona.tipoDocumentoId,
                telefono: phone || persona.telefono,
                email: email || persona.email
              }
            });
            return existingResponsable;
          }
        }
        // La persona existe pero no era responsable: solo se completa lo que no tiene. Antes
        // se le sobrescribian nombre, correo y telefono (ver utils/personas.js).
        await tx.personas.update({
          where: { id: persona.id },
          data: completarPersona(persona, {
            nombres: firstName,
            apellidos: lastName,
            tipoDocumentoId: docTypeId,
            telefono: phone,
            email
          })
        });
      }

      const responsable = await tx.responsables.create({
        data: {
          personaId: persona.id,
          status: 'active',
          creadoPorId: req.user.id
        }
      });

      return responsable;
    });

    success(res, result, null, 201);
  } catch (err) {
    if (err.message === 'Ya existe un responsable con este documento') {
      return error(res, err.message, 400);
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { firstName, lastName, docType, docTypeId: rawDocTypeId, docNumber, phone, email, status } = req.body;

    // Resolve docTypeId from abbreviation if not provided as integer
    let docTypeId = rawDocTypeId ? parseInt(rawDocTypeId) : null;
    if (!docTypeId && docType) {
      const tipoDoc = await prisma.tiposDocumento.findFirst({ where: { abreviatura: docType } });
      docTypeId = tipoDoc ? tipoDoc.id : null;
    }

    const responsable = await prisma.responsables.findUnique({ where: { id }, include: { persona: true } });
    if (!responsable || responsable.deletedAt) return error(res, 'Responsable no encontrado', 404);

    if (status === 'inactive' && responsable.status === 'active') {
      const debtCheck = await prisma.$queryRawUnsafe(`
        SELECT SUM(v.monto_total - COALESCE(v.monto_pagado_credito, 0)) as "deuda"
        FROM ventas v
        WHERE v.responsable_id = $1 AND v.status IN ('credito', 'abonado')
      `, id);
      const pendingDebt = Number(debtCheck[0]?.deuda) || 0;
      if (pendingDebt > 0) {
        return error(res, `No se puede desactivar: El responsable tiene una deuda de $${pendingDebt.toLocaleString('es-CO')}`, 400);
      }
    }

    if (docNumber && docNumber !== responsable.persona.documento) {
      const existingPersona = await prisma.personas.findFirst({ where: { documento: docNumber } });
      if (existingPersona && existingPersona.id !== responsable.personaId) {
        return error(res, 'El documento ya está registrado en otra persona', 400);
      }
    }

    await prisma.$transaction([
      prisma.personas.update({
        where: { id: responsable.personaId },
        data: {
          nombres: firstName,
          apellidos: lastName,
          tipoDocumentoId: docTypeId,
          documento: docNumber,
          telefono: phone,
          email: email
        }
      }),
      prisma.responsables.update({
        where: { id },
        data: {
          status: status || responsable.status
        }
      })
    ]);

    success(res, { id, message: 'Responsable actualizado exitosamente' });
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const responsable = await prisma.responsables.findUnique({ where: { id } });
    if (!responsable || responsable.deletedAt) return error(res, 'Responsable no encontrado', 404);

    // Desactivar ya lo comprobaba; eliminar no, y un responsable con deuda quedaba borrado
    // con sus ventas a credito sin nadie a quien reclamarlas.
    const deuda = await prisma.$queryRaw`
      SELECT SUM(v.monto_total - COALESCE(v.monto_pagado_credito, 0)) AS "deuda"
      FROM ventas v
      WHERE v.responsable_id = ${id} AND v.status IN ('credito', 'abonado')`;
    const pendiente = Number(deuda[0]?.deuda) || 0;
    if (pendiente > 0) {
      return error(res, `No se puede eliminar: el responsable tiene una deuda de $${pendiente.toLocaleString('es-CO')}`, 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.responsables.update({
        where: { id },
        data: { deletedAt: new Date() }
      });
      await auditar(tx, req.user.id, 'responsables', 'delete', `responsable ${id}: eliminado`);
    });

    success(res, { message: 'Responsable eliminado exitosamente' });
  } catch (err) {
    next(err);
  }
};

exports.toggleStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const responsable = await prisma.responsables.findUnique({ where: { id } });
    if (!responsable || responsable.deletedAt) return error(res, 'Responsable no encontrado', 404);

    if (status === 'inactive' && responsable.status === 'active') {
      const debtCheck = await prisma.$queryRawUnsafe(`
        SELECT SUM(v.monto_total - COALESCE(v.monto_pagado_credito, 0)) as "deuda"
        FROM ventas v
        WHERE v.responsable_id = $1 AND v.status IN ('credito', 'abonado')
      `, id);
      const pendingDebt = Number(debtCheck[0]?.deuda) || 0;
      if (pendingDebt > 0) {
        return error(res, `No se puede desactivar: El responsable tiene una deuda de $${pendingDebt.toLocaleString('es-CO')}`, 400);
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const guardado = await tx.responsables.update({
        where: { id },
        data: { status }
      });
      if (status !== responsable.status) {
        await auditar(tx, req.user.id, 'responsables', 'toggle',
          `responsable ${id}: ${status === 'inactive' ? 'desactivado' : 'reactivado'}`);
      }
      return guardado;
    });

    success(res, updated);
  } catch (err) {
    next(err);
  }
};
