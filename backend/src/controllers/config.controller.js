const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

const SECTION_MAP = {
  'cards': {
    model: 'tarjetasAgencia', idField: 'id', include: { metodoPago: true },
    transform: (r) => ({ id: r.id, name: r.nombre, paymentMethod: r.metodoPago?.nombre || null, lastFourDigits: r.ultimosCuatro, description: r.descripcion, status: r.status === 'active' || r.status === 'Activo' ? 'Activo' : 'Inactivo' })
  },
  'payment-methods': {
    model: 'metodosPago', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre })
  },
  'document-types': {
    model: 'tiposDocumento', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, abreviatura: r.abreviatura })
  },
  'airlines': {
    model: 'aerolineas', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, code: r.codigoIata, type: r.tipo, website: r.web })
  },
  'suppliers': {
    model: 'proveedores', idField: 'id', include: { tipoDocumento: true },
    transform: (r) => ({
      id: r.id,
      name: r.nombre,
      type: r.tipo,
      // docType/docNumber: mismos nombres que expone la API para clientes y pasajeros.
      docType: r.tipoDocumento?.abreviatura || null,
      docNumber: r.documento || null,
      email: r.emailContacto,
      phone: r.telefono,
      website: r.web,
      observations: r.observaciones || ''
    })
  },
  'airports': {
    model: 'aeropuertos', idField: 'id',
    transform: (r) => ({ id: r.id, name: r.nombre, abbreviation: r.codigoIata, city: r.ciudad, country: r.pais, location: [r.ciudad, r.pais].filter(Boolean).join(', '), type: r.tipo, status: r.status === 'active' || r.status === 'Activo' ? 'Activo' : 'Inactivo' })
  },
  'baggage': {
    model: 'politicasEquipaje', idField: 'id', include: { aerolinea: true },
    transform: (r) => ({ id: r.id, airlineName: r.aerolinea?.nombre || null, fareType: r.tipoTarifa, personalItem: r.articuloPersonal, carryOn: r.equipajeMano, checkedBag: r.equipajeBodega, notes: r.notas })
  },
  'packages': {
    model: 'paquetes', idField: 'id',
    include: { paqueteHotel: true, paqueteTarifas: true, paqueteAsistenciaMedica: true, paqueteVuelo: { include: { aerolinea: true } }, paqueteProveedor: { include: { proveedor: true } } },
    transform: (r) => ({
      id: r.id,
      name: r.nombre,
      destination: r.destino,
      includedServices: r.serviciosIncluidos,
      notIncluded: r.noIncluido,
      flight: r.paqueteVuelo?.[0] ? {
        airline: r.paqueteVuelo[0].aerolinea?.nombre || null,
        route: r.paqueteVuelo[0].nroVuelo || null,
        flightMode: r.paqueteVuelo[0].modoVuelo || 'round_trip',
        transportType: r.paqueteVuelo[0].tipoTransporte || 'Aéreo',
        baggagePlan: r.paqueteVuelo[0].planEquipaje || '',
        legs: r.paqueteVuelo[0].trayectos?.legs || undefined,
        returnLeg: r.paqueteVuelo[0].trayectos?.returnLeg || undefined
      } : undefined,
      accommodation: r.paqueteHotel?.[0] ? {
        hotel: r.paqueteHotel[0].hotelNombre,
        hotelType: r.paqueteHotel[0].tipoHotel,
        mealPlan: r.paqueteHotel[0].regimen,
        supplier: r.paqueteProveedor?.[0]?.proveedor?.nombre || ''
      } : undefined,
      nights: r.paqueteHotel?.[0]?.noches || 0,
      rates: r.paqueteTarifas?.[0] ? {
        adult: r.paqueteTarifas[0].tarifaAdulto,
        child: r.paqueteTarifas[0].tarifaMenor || 0
      } : undefined,
      medicalAssistance: r.paqueteAsistenciaMedica ? {
        amountUsd: r.paqueteAsistenciaMedica.coberturaUsd,
        coverageDays: r.paqueteAsistenciaMedica.diasCobertura
      } : undefined
    })
  },
};

exports.getAll = async (req, res, next) => {
  try {
    const entries = Object.entries(SECTION_MAP);
    const results = await Promise.all(
      entries.map(([, config]) =>
        prisma[config.model].findMany({ include: config.include || undefined })
      )
    );
    const data = {};
    entries.forEach(([key, config], i) => {
      data[key] = config.transform ? results[i].map(config.transform) : results[i];
    });
    success(res, data);
  } catch (err) {
    next(err);
  }
};

exports.getSection = async (req, res, next) => {
  try {
    const { section } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    let sectionData = await prisma[config.model].findMany({
      include: config.include || undefined
    });

    if (config.transform) sectionData = sectionData.map(config.transform);
    success(res, sectionData);
  } catch (err) {
    next(err);
  }
};

// Helper asíncrono para des-mapear (untransform) el body del frontend al esquema de base de datos
// Validacion en servidor. El cliente tambien valida, pero la API no puede confiar en eso:
// cualquiera puede llamar al endpoint directamente.
function validarProveedor(body) {
  const fallas = [];

  if (!body.name || String(body.name).trim().length === 0) {
    fallas.push({ campo: 'name', mensaje: 'El nombre es obligatorio' });
  }
  if (!body.type || String(body.type).trim().length === 0) {
    fallas.push({ campo: 'type', mensaje: 'El tipo de proveedor es obligatorio' });
  }
  if (!body.docType || String(body.docType).trim().length === 0) {
    fallas.push({ campo: 'docType', mensaje: 'El tipo de documento es obligatorio' });
  }

  const docNumber = String(body.docNumber || '').trim();
  if (docNumber.length === 0) {
    fallas.push({ campo: 'docNumber', mensaje: 'El numero de documento es obligatorio' });
  } else if (!/^[0-9A-Za-z-]+$/.test(docNumber)) {
    fallas.push({ campo: 'docNumber', mensaje: 'El documento solo admite letras, numeros y guiones' });
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email).trim())) {
    fallas.push({ campo: 'email', mensaje: 'El correo electronico no es valido' });
  }

  if (fallas.length > 0) {
    throw Object.assign(new Error(fallas.map((f) => f.mensaje).join('. ')), {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      fallas
    });
  }
}

// Se verifica antes de escribir para poder devolver un 409 que diga con quien choca.
// La restriccion UNIQUE de la base tambien lo atrapa, pero con un mensaje generico.
async function verificarDocumentoProveedorLibre(tx, documento, idExcluido) {
  if (!documento) return;

  const existente = await tx.proveedores.findFirst({
    where: {
      documento,
      ...(idExcluido ? { id: { not: idExcluido } } : {})
    },
    select: { id: true, nombre: true }
  });

  if (existente) {
    throw Object.assign(
      new Error(`El documento ${documento} ya esta registrado para el proveedor "${existente.nombre}"`),
      { statusCode: 409, code: 'DUPLICATE_SUPPLIER_DOCUMENT' }
    );
  }
}

const untransformBody = async (section, body) => {
  const data = {};
  switch (section) {
    case 'cards':
      data.nombre = body.name;
      data.ultimosCuatro = body.lastFourDigits || '';
      data.descripcion = body.description || '';
      data.status = body.status === 'Activo' || body.status === 'active' ? 'active' : 'inactive';
      
      if (body.paymentMethod) {
        // Optimización extrema: usamos connectOrCreate para evitar roundtrips adicionales al buscar/crear relaciones únicas
        data.metodoPago = {
          connectOrCreate: {
            where: { nombre: body.paymentMethod },
            create: { nombre: body.paymentMethod }
          }
        };
      }
      break;

    case 'payment-methods':
      data.nombre = body.name;
      break;

    case 'document-types':
      data.nombre = body.name;
      data.abreviatura = body.abreviatura || body.name.slice(0, 3).toUpperCase();
      break;

    case 'airlines':
      data.nombre = body.name;
      data.codigoIata = body.code || null;
      data.tipo = body.type || 'Internacional';
      data.web = body.website || null;
      break;

    case 'suppliers': {
      data.nombre = body.name;
      data.tipo = body.type || 'Hotel';
      data.emailContacto = body.email || '';
      data.telefono = body.phone || '';
      data.web = body.website || null;
      data.observaciones = body.observations || null;

      // La identificacion del proveedor es obligatoria: Siigo referencia al Tercero de la
      // linea de factura por su `identification`.
      const docNumber = String(body.docNumber || '').trim();
      data.documento = docNumber || null;

      if (body.docType) {
        const tipoDoc = await prisma.tiposDocumento.findUnique({
          where: { abreviatura: String(body.docType) }
        });
        if (!tipoDoc) {
          throw Object.assign(
            new Error(`El tipo de documento "${body.docType}" no existe`),
            { statusCode: 400, code: 'INVALID_DOCUMENT_TYPE' }
          );
        }
        data.tipoDocumentoId = tipoDoc.id;
      } else {
        data.tipoDocumentoId = null;
      }
      break;
    }

    case 'airports':
      data.nombre = body.name;
      data.codigoIata = body.abbreviation || '';
      data.tipo = body.type || 'Ambos';
      data.status = body.status === 'Activo' || body.status === 'active' ? 'active' : 'inactive';
      data.ciudad = body.city || '';
      data.pais = body.country || '';
      break;

    case 'baggage':
      data.tipoTarifa = body.fareType || '';
      data.articuloPersonal = body.personalItem || '';
      data.equipajeMano = body.carryOn || '';
      data.equipajeBodega = body.checkedBag || '';
      data.notas = body.notes || null;
      
      if (body.airlineName) {
        // Corrección de integridad: Usamos findFirst porque 'nombre' no es una llave única estricta en el modelo de aerolineas
        let airline = await prisma.aerolineas.findFirst({ where: { nombre: body.airlineName } });
        if (!airline) {
          airline = await prisma.aerolineas.create({ data: { nombre: body.airlineName, codigoIata: body.airlineName.slice(0, 2).toUpperCase() } });
        }
        data.aerolineaId = airline.id;
      }
      break;

    case 'packages':
      data.nombre = body.name;
      data.destino = body.destination;
      data.serviciosIncluidos = body.includedServices || '';
      data.noIncluido = body.notIncluded || '';
      data.status = 'activo';
      break;
  }
  return data;
};

// Helper asíncrono para crear las relaciones de los paquetes turísticos en las tablas relacionales correspondientes
const createPackageRelations = async (tx, paqueteId, body) => {
  // 1. Relación de Vuelo
  if (body.flight) {
    let aerolineaId = null;
    if (body.flight.airline) {
      let airline = await tx.aerolineas.findFirst({ where: { nombre: body.flight.airline } });
      if (!airline) {
        airline = await tx.aerolineas.create({ data: { nombre: body.flight.airline, codigoIata: body.flight.airline.slice(0, 2).toUpperCase() } });
      }
      aerolineaId = airline.id;
    }
    await tx.paqueteVuelo.create({
      data: {
        paqueteId,
        aerolineaId,
        nroVuelo: body.flight.route || null,
        modoVuelo: body.flight.flightMode || 'round_trip',
        tipoTransporte: body.flight.transportType || 'Aéreo',
        planEquipaje: body.flight.baggagePlan || null,
        trayectos: body.flight.legs || body.flight.returnLeg ? {
          legs: body.flight.legs || [],
          returnLeg: body.flight.returnLeg || null
        } : null
      }
    });
  }

  // 2. Relación de Hotel / Alojamiento
  if (body.accommodation) {
    await tx.paqueteHotel.create({
      data: {
        paqueteId,
        hotelNombre: body.accommodation.hotel || '',
        tipoHotel: body.accommodation.hotelType || 'hotel',
        regimen: body.accommodation.mealPlan || 'todo_incluido',
        noches: body.nights || 0
      }
    });

    if (body.accommodation.supplier) {
      let proveedor = await tx.proveedores.findFirst({ where: { nombre: body.accommodation.supplier } });
      if (!proveedor) {
        proveedor = await tx.proveedores.create({ data: { nombre: body.accommodation.supplier, tipo: 'Hotel' } });
      }
      await tx.paqueteProveedor.create({
        data: { paqueteId, proveedorId: proveedor.id }
      });
    }
  }

  // 3. Relación de Tarifas
  if (body.rates) {
    await tx.paqueteTarifas.create({
      data: {
        paqueteId,
        tarifaAdulto: parseFloat(body.rates.adult) || 0,
        tarifaMenor: parseFloat(body.rates.child) || 0
      }
    });
  }

  // 4. Relación de Asistencia Médica
  if (body.medicalAssistance) {
    await tx.paqueteAsistenciaMedica.create({
      data: {
        paqueteId,
        coberturaUsd: parseFloat(body.medicalAssistance.amountUsd) || 0,
        diasCobertura: parseInt(body.medicalAssistance.coverageDays) || 0
      }
    });
  }
};

exports.createItem = async (req, res, next) => {
  try {
    const { section } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    if (section === 'suppliers') validarProveedor(req.body);

    // Mapear el cuerpo de la petición de entrada al formato de la base de datos
    const dbData = await untransformBody(section, req.body);

    // Inyectar el ID del usuario creador si es un Paquete Turístico
    if (section === 'packages' && req.user && req.user.id) {
      dbData.creadoPorId = req.user.id;
    }

    // Ejecutar creación transaccional optimizada (Carga Relaciones Eager e Inmediata)
    let createdResponse = await prisma.$transaction(async (tx) => {
      // Para aerolíneas: verificar duplicados de nombre e IATA antes de insertar
      if (section === 'airlines') {
        if (dbData.nombre) {
          const existing = await tx.aerolineas.findFirst({ where: { nombre: { equals: dbData.nombre, mode: 'insensitive' } } });
          if (existing) throw Object.assign(new Error(`Ya existe una aerolínea con el nombre "${dbData.nombre}"`), { statusCode: 409 });
        }
        if (dbData.codigoIata) {
          const existingCode = await tx.aerolineas.findFirst({ where: { codigoIata: dbData.codigoIata } });
          if (existingCode) throw Object.assign(new Error(`El código IATA "${dbData.codigoIata}" ya está registrado para la aerolínea "${existingCode.nombre}"`), { statusCode: 409 });
        }
      }

      if (section === 'suppliers') {
        await verificarDocumentoProveedorLibre(tx, dbData.documento);
      }

      // Crear registro base e incluir sus relaciones en una sola consulta de base de datos
      const createdItem = await tx[config.model].create({
        data: dbData,
        include: config.include || undefined
      });

      // Flujo de creación de relaciones hijas si es un Paquete Turístico
      if (section === 'packages') {
        await createPackageRelations(tx, createdItem.id, req.body);
        // Volvemos a buscar el paquete para retornar todas las relaciones hijas recién creadas
        return await tx[config.model].findUnique({
          where: { [config.idField]: createdItem.id },
          include: config.include
        });
      }

      return createdItem;
    }, { maxWait: 20000, timeout: 20000 });

    if (config.transform) {
      createdResponse = config.transform(createdResponse);
    }

    success(res, createdResponse, null, 201);
  } catch (err) {
    next(err);
  }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    const itemId = parseInt(id);

    if (section === 'suppliers') validarProveedor(req.body);

    // Mapear el cuerpo de la petición de entrada al formato de la base de datos
    const dbData = await untransformBody(section, req.body);

    // Ejecutar actualización transaccional optimizada (Carga Relaciones Eager e Inmediata)
    let updatedResponse = await prisma.$transaction(async (tx) => {
      if (section === 'suppliers') {
        await verificarDocumentoProveedorLibre(tx, dbData.documento, itemId);
      }

      // Actualizar registro base e incluir sus relaciones en una sola consulta de base de datos
      const updatedItem = await tx[config.model].update({
        where: { [config.idField]: itemId },
        data: dbData,
        include: config.include || undefined
      });

      // Si es un Paquete Turístico, limpiar relaciones antiguas y re-crear
      if (section === 'packages') {
        await tx.paqueteVuelo.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteHotel.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteProveedor.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteTarifas.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteAsistenciaMedica.deleteMany({ where: { paqueteId: itemId } });

        await createPackageRelations(tx, itemId, req.body);

        // Volvemos a buscar el paquete para retornar todas las relaciones hijas actualizadas
        return await tx[config.model].findUnique({
          where: { [config.idField]: itemId },
          include: config.include
        });
      }

      return updatedItem;
    }, { maxWait: 20000, timeout: 20000 });

    if (config.transform) {
      updatedResponse = config.transform(updatedResponse);
    }

    success(res, updatedResponse);
  } catch (err) {
    next(err);
  }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { section, id } = req.params;
    const config = SECTION_MAP[section];
    if (!config) return error(res, `Sección "${section}" no válida`, 400);

    const itemId = parseInt(id);

    // Ejecutar eliminación transaccional
    await prisma.$transaction(async (tx) => {
      // Cascada manual previa de sub-tablas para evitar violaciones de llaves foráneas
      if (section === 'packages') {
        await tx.paqueteVuelo.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteHotel.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteProveedor.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteTarifas.deleteMany({ where: { paqueteId: itemId } });
        await tx.paqueteAsistenciaMedica.deleteMany({ where: { paqueteId: itemId } });
      }

      await tx[config.model].delete({
        where: { [config.idField]: itemId }
      });
    }, { maxWait: 20000, timeout: 20000 });

    success(res, { message: 'Elemento eliminado con éxito' });
  } catch (err) {
    next(err);
  }
};
