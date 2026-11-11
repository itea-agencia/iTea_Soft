const prisma = require('../config/db');
const { Prisma } = require('@prisma/client');
const { success, error } = require('../utils/apiResponse');
const { buildMeta } = require('../utils/paginationHelper');
const { formatName } = require('../utils/stringUtils');
const { fillMissingPersonFields, isDocNumberOutOfRange, normalizeDocNumber } = require('../utils/persons');
const { diaColombia } = require('../utils/fechas');

// Una liquidacion guarda la fecha que manda el formulario ('YYYY-MM-DD', queda a 00:00 UTC) o,
// sin ella, el instante de creacion. La primera ya es el dia; el instante hay que leerlo en
// Colombia. getDate() usaba la hora del servidor (UTC) y una liquidacion de las 20:00 salia
// con fecha de manana.
const diaDeLiquidacion = (d) =>
  d.toISOString().endsWith('T00:00:00.000Z') ? d.toISOString().slice(0, 10) : diaColombia(d);
const { auditar } = require('../utils/auditoria');

// Venta cuya comision todavia no se le pago al comisionista. Mismo criterio que rechaza
// createSettlement: ni liquidada, ni anulada, ni eliminada. Va sin alias para que sirva dentro
// de cualquier subconsulta sobre `ventas`.
const PENDING_COMMISSION_SALE = Prisma.sql`comision_liquidada = false
  AND status::text <> 'anulado' AND deleted_at IS NULL`;

const splitFullName = (fullName) => {
  const parts = fullName ? fullName.trim().split(/\s+/) : [];
  let firstName = fullName || '';
  let lastName = '';
  if (parts.length > 1) {
    if (parts.length === 2) {
      firstName = parts[0];
      lastName = parts[1];
    } else if (parts.length === 3) {
      firstName = parts.slice(0, 2).join(' ');
      lastName = parts[2];
    } else {
      firstName = parts.slice(0, 2).join(' ');
      lastName = parts.slice(2).join(' ');
    }
  }
  return { firstName, lastName };
};

exports.getAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const agent = await prisma.comisionistas.findUnique({
      where: { id: parseInt(id) },
      include: {
        persona: { include: { tipoDocumento: true } },
        ventas: {
          include: {
            cliente: { include: { persona: true } },
          },
          orderBy: { creadoAt: 'desc' }
        }
      }
    });

    if (!agent) return error(res, 'Comisionista no encontrado', 404);

    const data = {
      id: agent.id,
      name: `${agent.persona.nombres} ${agent.persona.apellidos}`.trim(),
      firstName: agent.persona.nombres,
      lastName: agent.persona.apellidos,
      type: agent.tipo,
      docType: agent.persona.tipoDocumento?.abreviatura || null,
      docTypeId: agent.persona.tipoDocumento?.id || null,
      docNumber: agent.persona.documento,
      phone: agent.persona.telefono,
      email: agent.persona.email,
      status: agent.status,
      accumulated: await getPendingCommission(prisma, agent.id),
      paymentThreshold: agent.umbralPago,
      observacion: agent.observacion,
      ventas: agent.ventas.map(v => ({
        id: v.id,
        fecha: v.creadoAt,
        cliente: `${v.cliente.persona.nombres} ${v.cliente.persona.apellidos}`,
        montoTotal: v.montoTotal,
        montoComision: v.montoComisionNeto,
        status: v.status
      }))
    };

    success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.listAgents = async (req, res, next) => {
  try {
    // Para elegir comisionista en el asistente de ventas: todos, pero solo lo necesario para
    // elegir. Los datos de contacto y el acumulado son del modulo de comisiones, con su alcance.
    // Del documento van solo los ultimos 4 digitos, para distinguir homonimos sin exponerlo a
    // quien vende sin permiso de comisiones (decision del usuario, 2026-11-10).
    if (req.query.para === 'venta') {
      const agentes = await prisma.comisionistas.findMany({
        select: { id: true, status: true, persona: { select: { nombres: true, apellidos: true, documento: true } } },
        orderBy: { id: 'desc' }
      });
      return success(res, agentes.map(a => ({
        id: a.id,
        name: `${a.persona.nombres} ${a.persona.apellidos}`.trim(),
        docLast4: a.persona.documento ? a.persona.documento.slice(-4) : null,
        status: a.status
      })));
    }

    const { page, perPage, skip } = req.pagination;
    const { search, status } = req.query;

    const where = {};
    if (status) where.status = status;
    // "Propios" son los que creo ese usuario.
    if (req.permissionScope === 'own') where.creadoPorId = req.user.id;
    const ownCondition = req.permissionScope === 'own' ? Prisma.sql`AND c.creado_por_id = ${req.user.id}` : Prisma.empty;
    if (search) {
      where.persona = {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    // Parametros, no interpolacion: `search` y `status` vienen del request.
    const like = `%${search}%`;
    const statusCondition = status ? Prisma.sql`AND c.status::text = ${String(status)}` : Prisma.empty;
    const searchCondition = search
      ? Prisma.sql`AND (p.nombres ILIKE ${like} OR p.apellidos ILIKE ${like})`
      : Prisma.empty;

    const [total, agentsRaw] = await Promise.all([
      prisma.comisionistas.count({ where }),
      prisma.$queryRaw(Prisma.sql`
        SELECT 
          c.id,
          c.tipo as "type",
          c.status,
          pend.accumulated,
          pend."pendingSaleIds",
          c.umbral_pago as "paymentThreshold",
          p.nombres as "firstName",
          p.apellidos as "lastName",
          p.telefono as "phone",
          p.email,
          p.documento as "docNumber",
          td.abreviatura as "docType",
          c.observacion as "observacion",
          c.creado_por_id as "creadoPorId"
        FROM comisionistas c
        JOIN personas p ON c.persona_id = p.id
        LEFT JOIN tipos_documento td ON p.tipo_documento_id = td.id
        -- El acumulado sale de las ventas, no de la columna c.acumulado, que nadie actualiza
        -- despues del alta. pendingSaleIds son las ventas que lo componen: la pantalla liquida
        -- esas mismas, asi se paga lo que se vio (hallazgo 5 de la auditoria del frontend).
        CROSS JOIN LATERAL (
          SELECT COALESCE(SUM(monto_comision_neto), 0) AS accumulated,
                 COALESCE(json_agg(id ORDER BY id), '[]'::json) AS "pendingSaleIds"
          FROM ventas
          WHERE comisionista_id = c.id AND ${PENDING_COMMISSION_SALE}
        ) pend
        WHERE 1=1 ${statusCondition} ${searchCondition} ${ownCondition}
        ORDER BY c.id DESC
        LIMIT ${perPage} OFFSET ${skip}
      `)
    ]);

    const data = agentsRaw.map(a => ({
      id: a.id,
      name: `${a.firstName} ${a.lastName}`.trim(),
      type: a.type,
      docType: a.docType || '',
      docNumber: a.docNumber || '',
      status: a.status,
      accumulated: Number(a.accumulated) || 0,
      pendingSaleIds: a.pendingSaleIds,
      paymentThreshold: a.paymentThreshold,
      phone: a.phone,
      email: a.email,
      observacion: a.observacion,
      createdBy: a.creadoPorId
    }));

    success(res, data, buildMeta(total, page, perPage));
  } catch (err) {
    next(err);
  }
};

exports.createAgent = async (req, res, next) => {
  try {
    const data = req.body;
    data.docNumber = normalizeDocNumber(data.docNumber, data.docType);
    if (data.docNumber && isDocNumberOutOfRange(data.docNumber)) {
      return error(res, 'El documento debe tener entre 6 y 15 caracteres', 400, 'INVALID_DOC_NUMBER');
    }

    let tipoDocumentoId = null;
    if (data.docType) {
      const dt = await prisma.tiposDocumento.findUnique({ where: { abreviatura: data.docType } });
      if (dt) tipoDocumentoId = dt.id;
    }

    // Check if agent with this document already exists
    let existingAgent = null;
    if (data.docNumber) {
      existingAgent = await prisma.comisionistas.findFirst({
        where: { persona: { documento: data.docNumber } }
      });
      if (existingAgent) {
        if (existingAgent.status !== 'Inactivo') {
          return error(res, 'Este número de documento ya está registrado y activo como comisionista', 400);
        }
      }
    }

    let persona;
    if (data.docNumber) {
      const existingPersona = await prisma.personas.findUnique({
        where: { documento: data.docNumber }
      });
      if (existingPersona && existingAgent) {
        // Reactivacion del mismo comisionista: sus datos se actualizan con los del formulario.
        const { firstName, lastName } = splitFullName(data.name || `${existingPersona.nombres} ${existingPersona.apellidos}`);
        persona = await prisma.personas.update({
          where: { id: existingPersona.id },
          data: {
            nombres: formatName(firstName) || existingPersona.nombres,
            apellidos: formatName(lastName) || existingPersona.apellidos,
            tipoDocumentoId: tipoDocumentoId || existingPersona.tipoDocumentoId,
            email: data.email || existingPersona.email,
            telefono: data.phone || existingPersona.telefono,
            status: 'active',
            deletedAt: null
          }
        });
      } else if (existingPersona) {
        // La persona existe pero no era comisionista: solo se completa lo que no tiene. Antes
        // se le sobrescribian nombre, correo y telefono (ver utils/persons.js).
        const { firstName, lastName } = splitFullName(data.name || '');
        persona = await prisma.personas.update({
          where: { id: existingPersona.id },
          data: {
            ...fillMissingPersonFields(existingPersona, {
              nombres: formatName(firstName),
              apellidos: formatName(lastName),
              tipoDocumentoId,
              email: data.email,
              telefono: data.phone,
            }),
            status: 'active',
            deletedAt: null
          }
        });
      }
    }

    if (!persona) {
      const { firstName, lastName } = splitFullName(data.name);
      persona = await prisma.personas.create({
        data: {
          nombres: formatName(firstName),
          apellidos: formatName(lastName),
          tipoDocumentoId,
          documento: data.docNumber || null,
          email: data.email || null,
          telefono: data.phone || null
        }
      });
    }

    let agent;
    if (existingAgent) {
      agent = await prisma.comisionistas.update({
        where: { id: existingAgent.id },
        data: {
          tipo: data.type || existingAgent.tipo,
          umbralPago: parseFloat(data.paymentThreshold) || existingAgent.umbralPago,
          observacion: data.observacion || existingAgent.observacion,
          // Aca tambien se escribia `deletedAt: null`, pero `comisionistas` no tiene esa
          // columna: reactivar a un comisionista inactivo revento siempre.
          status: 'Activo'
        },
        include: { persona: { include: { tipoDocumento: true } } }
      });
    } else {
      agent = await prisma.comisionistas.create({
        data: {
          personaId: persona.id,
          tipo: data.type || null,
          umbralPago: parseFloat(data.paymentThreshold) || 0,
          acumulado: 0,
          observacion: data.observacion || null,
          status: 'Activo',
          creadoPorId: req.user.id
        },
        include: { persona: { include: { tipoDocumento: true } } }
      });
    }

    success(res, {
      id: agent.id,
      name: `${agent.persona.nombres} ${agent.persona.apellidos}`.trim(),
      type: agent.tipo,
      docType: agent.persona.tipoDocumento?.abreviatura || '',
      docNumber: agent.persona.documento || '',
      status: agent.status,
      // Reactivar a un comisionista existente por esta via puede traer ventas pendientes.
      accumulated: await getPendingCommission(prisma, agent.id),
      paymentThreshold: agent.umbralPago,
      phone: agent.persona.telefono,
      email: agent.persona.email,
      observacion: agent.observacion
    }, null, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateAgent = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;
    data.docNumber = normalizeDocNumber(data.docNumber, data.docType);
    if (data.docNumber && isDocNumberOutOfRange(data.docNumber)) {
      return error(res, 'El documento debe tener entre 6 y 15 caracteres', 400, 'INVALID_DOC_NUMBER');
    }
    const agent = await prisma.comisionistas.findUnique({
      where: { id },
      include: { persona: { include: { tipoDocumento: true } } }
    });
    if (!agent) return error(res, 'Comisionista no encontrado', 404);

    const personaUpdate = {};
    if (data.name) {
      const { firstName, lastName } = splitFullName(data.name);
      personaUpdate.nombres = formatName(firstName);
      personaUpdate.apellidos = formatName(lastName);
    }
    
    if (data.docNumber !== undefined) {
      if (data.docNumber) {
        const existingDoc = await prisma.personas.findUnique({
          where: { documento: data.docNumber }
        });
        if (existingDoc && existingDoc.id !== agent.personaId) {
          return error(res, 'Este número de documento ya está asignado a otra persona en el sistema', 400);
        }
      }
      personaUpdate.documento = data.docNumber;
    }

    if (data.phone !== undefined) personaUpdate.telefono = data.phone;
    if (data.email !== undefined) personaUpdate.email = data.email;

    if (data.docType) {
      const dt = await prisma.tiposDocumento.findUnique({ where: { abreviatura: data.docType } });
      if (dt) personaUpdate.tipoDocumentoId = dt.id;
    }

    if (Object.keys(personaUpdate).length > 0) {
      personaUpdate.updatedAt = new Date();
      await prisma.personas.update({
        where: { id: agent.personaId },
        data: personaUpdate
      });
    }

    if (data.type !== undefined) await prisma.comisionistas.update({ where: { id }, data: { tipo: data.type } });
    // El estado no se cambia aca: tiene su propia ruta y su propio permiso (toggleAgentStatus).
    if (data.observacion !== undefined) await prisma.comisionistas.update({ where: { id }, data: { observacion: data.observacion } });
    if (data.paymentThreshold !== undefined) {
      await prisma.comisionistas.update({ where: { id }, data: { umbralPago: parseFloat(data.paymentThreshold) || 0 } });
    }

    success(res, { message: 'Comisionista actualizado' });
  } catch (err) {
    next(err);
  }
};

// Comision neta de las ventas del comisionista que todavia no se le pagaron. Se deriva de las
// ventas y no de la columna `acumulado` ni de lo que suma la pantalla (invariantes 2 y 3).
async function getPendingCommission(tx, agentId) {
  const [row] = await tx.$queryRaw`
    SELECT COALESCE(SUM(monto_comision_neto), 0) AS pending
    FROM ventas
    WHERE comisionista_id = ${agentId} AND ${PENDING_COMMISSION_SALE}`;
  return Number(row.pending) || 0;
}

// Un comisionista no se borra: tiene ventas y liquidaciones que lo referencian, y el borrado
// fisico que habia aca respondia 500 con cualquiera que tuviera ventas. Se desactiva, y solo
// sin comision pendiente: primero se le liquida, como un responsable con deuda.
exports.toggleAgentStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const result = await prisma.$transaction(async (tx) => {
      const agent = await tx.comisionistas.findUnique({ where: { id } });
      if (!agent) return { notFound: true };
      const newStatus = agent.status === 'Activo' ? 'Inactivo' : 'Activo';
      if (newStatus === 'Inactivo') {
        const pending = await getPendingCommission(tx, id);
        if (pending > 0) return { pending };
      }
      await tx.comisionistas.update({ where: { id }, data: { status: newStatus } });
      await auditar(tx, req.user.id, 'commissions', 'toggle',
        `comisionista ${id}: ${newStatus === 'Inactivo' ? 'desactivado' : 'reactivado'}`);
      return { status: newStatus };
    });

    if (result.notFound) return error(res, 'Comisionista no encontrado', 404);
    if (result.pending) {
      return error(res, `No se puede desactivar: el comisionista tiene $${result.pending.toLocaleString('es-CO')} de comisión sin liquidar. Liquídala primero.`, 400, 'COMISION_PENDIENTE');
    }
    success(res, { status: result.status });
  } catch (err) {
    next(err);
  }
};

exports.listSettlements = async (req, res, next) => {
  try {
    const { page, perPage, skip } = req.pagination;
    const { agentId, dateFrom, dateTo } = req.query;

    const where = {};
    if (agentId) where.comisionistaId = parseInt(agentId);
    // Con "Propios", solo las liquidaciones de los comisionistas que creo ese usuario.
    if (req.permissionScope === 'own') where.comisionista = { creadoPorId: req.user.id };
    const ownCondition = req.permissionScope === 'own' ? Prisma.sql`AND c.creado_por_id = ${req.user.id}` : Prisma.empty;
    if (dateFrom || dateTo) {
      where.fecha = {};
      if (dateFrom) where.fecha.gte = new Date(dateFrom);
      if (dateTo) where.fecha.lte = new Date(dateTo);
    }

    const agentCondition = agentId ? Prisma.sql`AND lc.comisionista_id = ${parseInt(agentId)}` : Prisma.empty;
    const dateFromCondition = dateFrom ? Prisma.sql`AND lc.fecha >= ${new Date(dateFrom)}` : Prisma.empty;
    const dateToCondition = dateTo ? Prisma.sql`AND lc.fecha <= ${new Date(dateTo)}` : Prisma.empty;

    const [total, settlementsRaw] = await Promise.all([
      prisma.liquidacionesComision.count({ where }),
      prisma.$queryRaw(Prisma.sql`
        SELECT 
          lc.id,
          lc.comisionista_id as "agentId",
          lc.monto as "amount",
          lc.fecha as "date",
          lc.referencia as "reference",
          lc.notas as "notes",
          p.nombres as "firstName",
          p.apellidos as "lastName",
          mp.nombre as "paymentMethod",
          COALESCE((
            SELECT json_agg(lv.venta_id)
            FROM liquidacion_ventas lv WHERE lv.liquidacion_id = lc.id
          ), '[]'::json) as "salesIds"
        FROM liquidaciones_comision lc
        JOIN comisionistas c ON lc.comisionista_id = c.id
        JOIN personas p ON c.persona_id = p.id
        LEFT JOIN metodos_pago mp ON lc.metodo_pago_id = mp.id
        WHERE 1=1 ${agentCondition} ${dateFromCondition} ${dateToCondition} ${ownCondition}
        ORDER BY lc.creado_at DESC
        LIMIT ${perPage} OFFSET ${skip}
      `)
    ]);

    const data = settlementsRaw.map(s => {
      const d = s.date;
      const dateStr = d ? diaDeLiquidacion(d) : null;

      return {
        id: s.id,
        agentId: s.agentId,
        agentName: `${s.firstName} ${s.lastName}`.trim(),
        amount: s.amount,
        date: dateStr,
        paymentMethod: s.paymentMethod || null,
        reference: s.reference,
        notes: s.notes,
        salesIds: s.salesIds || []
      };
    });

    success(res, data, buildMeta(total, page, perPage));
  } catch (err) {
    next(err);
  }
};

exports.createSettlement = async (req, res, next) => {
  try {
    const data = req.body;
    const agentId = parseInt(data.agentId, 10);
    const salesIds = [...new Set((Array.isArray(data.salesIds) ? data.salesIds : []).map(id => parseInt(id, 10)))];
    if (!Number.isInteger(agentId) || salesIds.length === 0 || salesIds.some(id => !Number.isInteger(id))) {
      return error(res, 'Una liquidación necesita un comisionista y al menos una venta', 400, 'VALIDATION_ERROR');
    }

    // Con "Propios", solo se liquida a los comisionistas que creo ese usuario. El resto de la
    // validacion (que las ventas sean de ese comisionista) va dentro de la transaccion.
    if (req.permissionScope === 'own') {
      const agente = await prisma.comisionistas.findUnique({ where: { id: agentId }, select: { creadoPorId: true } });
      if (!agente || agente.creadoPorId !== req.user.id) {
        return error(res, 'Comisionista no encontrado', 404);
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const metodoPagoId = data.paymentMethod ? parseInt(data.paymentMethod) : null;

      // El monto y las ventas no se toman del navegador tal cual. Antes se guardaba
      // `data.amount` y se marcaban liquidadas las ventas que llegaran, sin mirar de quien
      // eran ni si estaban anuladas: el 2026-09-09 se liquido comision de las ventas 84 y 86,
      // anuladas, porque la pantalla sumaba lo pendiente sin excluirlas.
      //
      // FOR UPDATE: dos liquidaciones casi simultaneas de las mismas ventas (un doble clic)
      // esperan una a la otra, y la segunda ya las ve liquidadas.
      const ventas = await tx.$queryRaw`
        SELECT id, comisionista_id AS "comisionistaId", comision_liquidada AS liquidada,
               status::text AS status, deleted_at AS "deletedAt", monto_comision_neto AS neto
        FROM ventas WHERE id IN (${Prisma.join(salesIds)}) FOR UPDATE`;

      const encontradas = new Set(ventas.map(v => v.id));
      const noLiquidables = [
        ...salesIds.filter(id => !encontradas.has(id)),
        ...ventas
          .filter(v => v.comisionistaId !== agentId || v.liquidada || v.status === 'anulado' || v.deletedAt)
          .map(v => v.id),
      ];
      if (noLiquidables.length > 0) {
        throw Object.assign(
          new Error(`No se pueden liquidar las ventas ${noLiquidables.join(', ')}: no existen, son de otro comisionista, ya están liquidadas o están anuladas`),
          { statusCode: 409, code: 'VENTAS_NO_LIQUIDABLES' }
        );
      }

      const settlement = await tx.liquidacionesComision.create({
        data: {
          comisionistaId: agentId,
          fecha: data.date ? new Date(data.date) : new Date(),
          monto: ventas.reduce((t, v) => t + (Number(v.neto) || 0), 0),
          metodoPagoId,
          referencia: data.reference || null,
          notas: data.notes || null
        }
      });

      await tx.liquidacionVentas.createMany({
        data: salesIds.map(ventaId => ({ liquidacionId: settlement.id, ventaId }))
      });
      await tx.ventas.updateMany({
        where: { id: { in: salesIds } },
        data: { comisionLiquidada: true }
      });
      await auditar(tx, req.user.id, 'commissions', 'settle',
        `liquidacion ${settlement.id}: comisionista ${agentId}, ventas ${salesIds.join(', ')}, monto ${settlement.monto}`);

      const fullSettlement = await tx.liquidacionesComision.findUnique({
        where: { id: settlement.id },
        include: {
          comisionista: { include: { persona: true } },
          metodoPago: true,
        }
      });

      const date = fullSettlement.fecha;
      const dateStr = date ? diaDeLiquidacion(date) : null;

      return {
        id: fullSettlement.id,
        agentId: fullSettlement.comisionistaId,
        agentName: `${fullSettlement.comisionista.persona.nombres} ${fullSettlement.comisionista.persona.apellidos}`.trim(),
        amount: fullSettlement.monto,
        date: dateStr,
        paymentMethod: fullSettlement.metodoPago?.nombre || null,
        reference: fullSettlement.referencia,
        notes: fullSettlement.notas,
        salesIds,
      };
    });

    success(res, result, null, 201);
  } catch (err) {
    next(err);
  }
};
