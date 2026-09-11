const prisma = require('../config/db');
const { success, error } = require('../utils/apiResponse');

const CATEGORIES = {
  ticket: 'tiqueteria', hotel: 'hoteleria', insurance: 'seguros_viaje',
  plan: 'planes', checkin: 'checkin', migration: 'documentacion_migratoria',
  simcard: 'simcard', baggage: 'equipaje', carRental: 'renta_vehiculos', finca: 'renta_fincas',
  tour: 'tours', convention: 'centros_convencion', restaurant: 'restaurantes',
  visa: 'visa', passport: 'pasaporte', petService: 'servicio_mascotas',
  landTravel: 'viajes_terrestres'
};

// Debe mantenerse en sintonia con sales.controller.js: las dos rutas de escritura
// (POST /sales y POST /sales/:id/products/*) crean pasajeros y no pueden divergir.
const CATEGORIAS_CON_PASAJERO_IMPLICITO = [
  'checkin', 'documentacion_migratoria', 'simcard', 'tours',
  'servicio_mascotas', 'renta_vehiculos', 'viajes_terrestres'
];

// Un array vacio cuenta como ausencia de pasajeros, no como presencia.
function getPassengerList(data) {
  if (Array.isArray(data.passengers) && data.passengers.length > 0) return data.passengers;
  if (data.passengerInfo) return [data.passengerInfo];
  if (Array.isArray(data.guests) && data.guests.length > 0) return data.guests;
  return null;
}

async function findOrCreatePersona(tx, name, docType, docNumber, defaultPersonaId) {
  if (!name && !docNumber) {
    return defaultPersonaId || null;
  }
  
  if (docNumber) {
    const match = await tx.personas.findUnique({
      where: { documento: String(docNumber) }
    });
    if (match) return match.id;
  }

  const nameParts = (name || '').trim().split(/\s+/);
  const nombres = nameParts[0] || 'Pasajero';
  const apellidos = nameParts.slice(1).join(' ') || 'Temporal';

  let tipoDocumentoId = null;
  if (docType) {
    const td = await tx.tiposDocumento.findUnique({
      where: { abreviatura: String(docType) }
    });
    if (td) tipoDocumentoId = td.id;
  }

  const newPersona = await tx.personas.create({
    data: {
      nombres,
      apellidos,
      tipoDocumentoId,
      documento: docNumber ? String(docNumber) : null,
      status: 'active'
    }
  });
  return newPersona.id;
}

async function getSale(saleId) {
  const id = parseInt(saleId);
  return prisma.ventas.findUnique({ where: { id } });
}

// El proveedor llega con tres nombres segun el formulario: `supplier` (tiqueteria,
// hoteleria, planes, seguros), `supplierName` (los trece que usan FinancialSection) o
// `supplierId`. Puede venir como id numerico o como nombre.
async function resolverProveedorId(tx, data) {
  const bruto = data.supplierId ?? data.supplier ?? data.supplierName;
  if (bruto === undefined || bruto === null || bruto === '') return null;

  const id = parseInt(bruto, 10);
  if (!Number.isNaN(id)) return id;

  const match = await tx.proveedores.findFirst({ where: { nombre: String(bruto) } });
  return match?.id || null;
}

// El metodo de pago puede llegar como id o como nombre. Este controlador solo aceptaba
// el id (`parseInt(data.supplierPaymentMethod)`) mientras sales.controller resuelve por
// nombre, que es lo que manda el formulario; aca se aceptan los dos.
async function resolverMetodoPagoId(tx, bruto) {
  if (bruto === undefined || bruto === null || bruto === '') return null;
  const id = parseInt(bruto, 10);
  if (!Number.isNaN(id)) return id;
  const match = await tx.metodosPago.findFirst({ where: { nombre: String(bruto) } });
  return match?.id || null;
}

/**
 * Concepto de pago valido, o null si viene cualquier otra cosa.
 */
const CONCEPTOS_PAGO = ['transporte', 'hotel', 'seguro', 'paquete'];

/**
 * Filas de pago a proveedor de un servicio, listas para un create anidado.
 *
 * Un paquete se le compra a varios proveedores a la vez y a cada uno se le paga aparte.
 * Una fila sin importe y sin proveedor no es un pago y no se guarda.
 */
async function armarPagosProveedor(tx, data) {
  const pagos = Array.isArray(data.supplierPayments) ? data.supplierPayments : [];
  const out = [];
  for (let i = 0; i < pagos.length; i++) {
    const pago = pagos[i];
    if (!CONCEPTOS_PAGO.includes(pago.concept)) continue;

    const costoProveedor = Number(pago.supplierCost) || 0;
    const ta = Number(pago.ta) || 0;
    const taCre = Number(pago.taCre) || 0;
    if (costoProveedor === 0 && ta === 0 && taCre === 0 && !pago.supplier) continue;

    out.push({
      concepto: pago.concept,
      proveedorId: await resolverProveedorId(tx, { supplier: pago.supplier }),
      costoProveedor,
      ta,
      taCre,
      metodoPagoProveedorId: await resolverMetodoPagoId(tx, pago.paymentMethod),
      orden: i + 1,
    });
  }
  return out;
}

/**
 * Los importes de un servicio. Si se pago a varios proveedores, son la suma de sus filas
 * de pago: el detalle guarda el total para que los totales de la venta, el agregado por
 * paquete y la guarda de totales de Siigo sigan valiendo sin cambios.
 */
function financierosDe(data, pagos) {
  if (!pagos || pagos.length === 0) {
    return {
      costoProveedor: Number(data.supplierCost) || 0,
      ta: Number(data.ta) || 0,
      taCre: Number(data.taCre) || 0,
    };
  }
  const suma = (campo) => pagos.reduce((t, p) => t + (Number(p[campo]) || 0), 0);
  return { costoProveedor: suma('costoProveedor'), ta: suma('ta'), taCre: suma('taCre') };
}

async function createDetalleProducto(tx, ventaId, categoria, data) {
  const pagosProveedorData = await armarPagosProveedor(tx, data);
  const fin = financierosDe(data, pagosProveedorData);

  return tx.detalleVenta.create({
    data: {
      ventaId,
      categoria,
      nombreServicio: data.nombreServicio || null,
      subtotal: fin.costoProveedor + fin.ta + fin.taCre,
      ta: fin.ta,
      taCre: fin.taCre,
      costoProveedor: fin.costoProveedor,
      ...(pagosProveedorData.length > 0 ? { pagosProveedor: { create: pagosProveedorData } } : {}),
      // Mismo criterio que sales.controller: el proveedor llega como `supplier`,
      // `supplierName` o `supplierId` segun el formulario.
      proveedorId: await resolverProveedorId(tx, data),
      metodoPagoProveedorId: await resolverMetodoPagoId(tx, data.supplierPaymentMethod),
      voucherUrl: data.voucherUrl || null,
      fechaInicioViaje: data.startDate ? new Date(data.startDate) : null,
      fechaFinViaje: data.endDate ? new Date(data.endDate) : null,
      origen: data.origin || null,
      destino: data.destination || null,
      observaciones: data.observations || null
    }
  });
}

/**
 * Recalcula los totales de la venta desde sus filas.
 *
 * Agregar, editar o borrar un producto por estos endpoints creaba, cambiaba o quitaba un
 * `detalle_venta` pero no tocaba `ventas.monto_total`, asi que el total de la venta se
 * desfasaba en silencio. La venta 133 en local llego a decir $60.000 con filas que sumaban
 * $11.990.000. Y Siigo factura contra `monto_total`.
 *
 * Se derivan de las filas y no del payload: un request que agrega un solo producto no
 * puede saber el total de la venta.
 */
async function recalcularTotalesVenta(tx, ventaId) {
  const filas = await tx.detalleVenta.findMany({
    where: { ventaId },
    select: { costoProveedor: true, ta: true, taCre: true },
  });
  const suma = (campo) => filas.reduce((t, f) => t + (Number(f[campo]) || 0), 0);
  const costoProveedorTotal = suma('costoProveedor');
  const taTotal = suma('ta');
  const taCreTotal = suma('taCre');
  await tx.ventas.update({
    where: { id: ventaId },
    data: {
      costoProveedorTotal,
      taTotal,
      taCreTotal,
      montoTotal: costoProveedorTotal + taTotal + taCreTotal,
    },
  });
}

const productHandler = (category, tableName, transformData) => ({
  create: async (req, res, next) => {
    try {
      const venta = await getSale(req.params.saleId);
      if (!venta) return error(res, 'Venta no encontrada', 404);

      const data = req.body;
      const result = await prisma.$transaction(async (tx) => {
        const detalle = await createDetalleProducto(tx, venta.id, category, data);
        const transformed = transformData ? transformData(data, detalle.id) : { detalleVentaId: detalle.id, ...data };
        const product = await tx[tableName].create({ data: transformed });

        const pasajerosDetalleData = [];
        const cliente = await tx.clientes.findUnique({
          where: { id: venta.clienteId },
          select: { personaId: true }
        });
        const defaultPersonaId = cliente?.personaId;

        const listaPasajeros = getPassengerList(data);
        if (listaPasajeros) {
          for (const p of listaPasajeros) {
            const resolvedPid = await findOrCreatePersona(tx, p.name || p.passengerName || p.fullName, p.docType, p.docNumber, defaultPersonaId);
            pasajerosDetalleData.push({
              personaId: resolvedPid,
              esTitular: p.esTitular ?? true,
              asiento: p.asiento || p.seat || null,
              asientoRegreso: p.asientoRegreso || null,
              nroReserva: p.nroReserva || null,
              nroTiquete: p.nroTiquete || null
            });
          }
        } else {
          const passengerName = data.passengerName || data.mainDriver || data.responsibleName || data.ownerName || data.fullName || data.reservationName || data.contactName;
          const docType = data.docType;
          const docNumber = data.docNumber || data.licenseNumber || data.passportNumber || data.idNumber;

          if (passengerName || docNumber || CATEGORIAS_CON_PASAJERO_IMPLICITO.includes(category)) {
            const resolvedPid = await findOrCreatePersona(tx, passengerName, docType, docNumber, defaultPersonaId);
            pasajerosDetalleData.push({
              personaId: resolvedPid,
              esTitular: true,
              asiento: data.seat || data.seatNumber || null,
              asientoRegreso: null,
              nroReserva: null,
              nroTiquete: null
            });
          }
        }

        for (const passengerData of pasajerosDetalleData) {
          await tx.pasajerosDetalle.create({
            data: {
              detalleVentaId: detalle.id,
              personaId: passengerData.personaId,
              esTitular: passengerData.esTitular,
              asiento: passengerData.asiento,
              asientoRegreso: passengerData.asientoRegreso,
              nroReserva: passengerData.nroReserva,
              nroTiquete: passengerData.nroTiquete
            }
          });
        }

        if (tableName === 'prodTiqueteria') {
          const allLegs = [...(data.legs || [])];
          if (data.returnLeg) allLegs.push(data.returnLeg);
          for (let i = 0; i < allLegs.length; i++) {
            const leg = allLegs[i];
            if (!leg.origin || !leg.destination) continue;
            const originAirport = await tx.aeropuertos.findFirst({ where: { codigoIata: leg.origin } });
            const destAirport = await tx.aeropuertos.findFirst({ where: { codigoIata: leg.destination } });
            if (!originAirport || !destAirport) continue;

            let aerolineaId = null;
            const legAirline = leg.airline || data.airline;
            if (legAirline) {
              const parsedId = parseInt(legAirline);
              if (!isNaN(parsedId)) {
                aerolineaId = parsedId;
              } else {
                const match = await tx.aerolineas.findFirst({ where: { nombre: legAirline } });
                aerolineaId = match?.id || null;
              }
            }

            let planEquipajeId = null;
            const legBaggagePlan = leg.baggagePlan || data.baggagePlan;
            if (legBaggagePlan) {
              const parsedId = parseInt(legBaggagePlan);
              if (!isNaN(parsedId)) {
                planEquipajeId = parsedId;
              } else {
                const parts = legBaggagePlan.split(' - ');
                if (parts.length >= 2) {
                  const airlineName = parts[0];
                  const fareType = parts.slice(1).join(' - ');
                  const match = await tx.politicasEquipaje.findFirst({
                    where: {
                      AND: [
                        { aerolinea: { nombre: airlineName } },
                        { tipoTarifa: fareType }
                      ]
                    }
                  });
                  if (match) planEquipajeId = match.id;
                }
                if (!planEquipajeId) {
                  const match = await tx.politicasEquipaje.findFirst({ where: { tipoTarifa: legBaggagePlan } });
                  planEquipajeId = match?.id || null;
                }
              }
            }

            await tx.tramosVuelo.create({
              data: {
                prodTiqueteriaId: product.id,
                aeropuertoOrigenId: originAirport.id,
                aeropuertoDestinoId: destAirport.id,
                salida: leg.date ? new Date(leg.date) : new Date(),
                llegada: leg.date ? new Date(leg.date) : new Date(),
                nroVueloTramo: leg.flightNumber || null,
                asiento: leg.seat || null,
                nroTiquete: leg.ticketNumber || null,
                aerolineaId,
                planEquipajeId,
                orden: i + 1
              }
            });
          }
        }

        await recalcularTotalesVenta(tx, venta.id);
        return { detalle, product };
      });

      success(res, result, null, 201);
    } catch (err) {
      next(err);
    }
  },
  update: async (req, res, next) => {
    try {
      const ventaId = parseInt(req.params.saleId);
      const id = req.params.id;

      const venta = await getSale(ventaId);
      if (!venta) return error(res, 'Venta no encontrada', 404);

      const data = req.body;
      const product = await prisma.$transaction(async (tx) => {
        const prod = await tx[tableName].update({
          where: { id },
          data: transformData ? transformData(data) : data
        });

        if (data.passengers || data.passengerInfo || data.guests) {
          const passengers = data.passengers ? data.passengers : (data.passengerInfo ? [data.passengerInfo] : (data.guests || []));
          
          await tx.pasajerosDetalle.deleteMany({ where: { detalleVentaId: prod.detalleVentaId } });

          const cliente = await tx.clientes.findUnique({
            where: { id: venta.clienteId },
            select: { personaId: true }
          });
          const defaultPersonaId = cliente?.personaId;

          const pasajerosDetalleData = [];
          for (const p of passengers) {
            const resolvedPid = await findOrCreatePersona(tx, p.name || p.passengerName || p.fullName, p.docType, p.docNumber, defaultPersonaId);
            pasajerosDetalleData.push({
              personaId: resolvedPid,
              esTitular: p.esTitular ?? true,
              asiento: p.asiento || p.seat || null,
              // Faltaba: este handler borra los pasajeros y los vuelve a crear, asi que
              // sin esta linea una edicion por aca perdia el asiento de regreso.
              asientoRegreso: p.asientoRegreso || null,
              nroReserva: p.nroReserva || null,
              nroTiquete: p.nroTiquete || null
            });
          }

          for (const passengerData of pasajerosDetalleData) {
            await tx.pasajerosDetalle.create({
              data: {
                detalleVentaId: prod.detalleVentaId,
                personaId: passengerData.personaId,
                esTitular: passengerData.esTitular,
                asiento: passengerData.asiento,
                asientoRegreso: passengerData.asientoRegreso,
                nroReserva: passengerData.nroReserva,
                nroTiquete: passengerData.nroTiquete
              }
            });
          }
        }

        await recalcularTotalesVenta(tx, venta.id);
        return prod;
      });

      success(res, product);
    } catch (err) {
      next(err);
    }
  },
  delete: async (req, res, next) => {
    try {
      const id = req.params.id;
      const product = await prisma[tableName].findUnique({ where: { id } });
      if (!product) return error(res, 'Producto no encontrado', 404);

      await prisma.$transaction(async (tx) => {
        await tx[tableName].delete({ where: { id } });
        await tx.detalleVenta.delete({ where: { id: product.detalleVentaId } });
        await recalcularTotalesVenta(tx, parseInt(req.params.saleId));
      });

      success(res, { message: 'Producto eliminado' });
    } catch (err) {
      next(err);
    }
  }
});

// Helper para crear handlers para cada categoría
const H = productHandler;

// =========================================================
// Tiquetería
// =========================================================
exports.createTicket = H(CATEGORIES.ticket, 'prodTiqueteria', (d, detalleId) => ({
  detalleVentaId: detalleId,
  aerolineaId: d.airline ? parseInt(d.airline) : null,
  nroReserva: d.reservationNumber || null,
  nroVuelo: d.flightNumber || null,
  nroTiquete: d.ticketNumber || null,
  modoVuelo: d.flightMode || 'one_way',
  planEquipajeId: d.baggagePlan ? parseInt(d.baggagePlan) : null,
  checkinStatus: 'pendiente'
})).create;

exports.updateTicket = H(CATEGORIES.ticket, 'prodTiqueteria').update;
exports.deleteTicket = H(CATEGORIES.ticket, 'prodTiqueteria').delete;

// =========================================================
// Hotelería
// =========================================================
exports.createHotel = H(CATEGORIES.hotel, 'prodHoteleria', (d, detalleId) => ({
  detalleVentaId: detalleId,
  hotelNombre: d.hotelName || null,
  tipoHotel: d.hotelType || 'hotel',
  destino: d.destination || null,
  nroReserva: d.reservationNumber || null,
  fechaEntrada: d.startDate ? new Date(d.startDate) : null,
  fechaSalida: d.endDate ? new Date(d.endDate) : null,
  observaciones: d.observations || null
})).create;

exports.updateHotel = H(CATEGORIES.hotel, 'prodHoteleria').update;
exports.deleteHotel = H(CATEGORIES.hotel, 'prodHoteleria').delete;

// =========================================================
// Seguros
// =========================================================
// `contactoEmergencia`, `telefonoEmergencia` y `direccionAsegurado` no existen en
// ProdSeguros, asi que este endpoint reventaba con "Unknown argument" en todo intento:
// nunca sirvio para crear un seguro suelto. Los nombres reales son los que ya usa el
// transform de sales.controller.
exports.createInsurance = H(CATEGORIES.insurance, 'prodSeguros', (d, detalleId) => ({
  detalleVentaId: detalleId,
  tipoSeguro: d.insuranceType || 'basico',
  coberturaUsd: Number(d.coverageAmount) || 0,
  diasCobertura: Number(d.coverageDays) || 0,
  fechaInicioVigencia: d.startDate ? new Date(d.startDate) : null,
  fechaFinVigencia: d.endDate ? new Date(d.endDate) : null,
  telefonoContacto: d.phone || null
})).create;

exports.updateInsurance = H(CATEGORIES.insurance, 'prodSeguros').update;
exports.deleteInsurance = H(CATEGORIES.insurance, 'prodSeguros').delete;

// =========================================================
// Planes
// =========================================================
exports.createPlan = H(CATEGORIES.plan, 'prodPlanes', (d, detalleId) => ({
  detalleVentaId: detalleId,
  paqueteId: d.packageId ? parseInt(d.packageId) : null,
  nombrePlan: d.planName || null,
  aerolineaId: d.airline ? parseInt(d.airline) : null,
  fechaViajeInicio: d.startDate ? new Date(d.startDate) : null,
  fechaViajeFin: d.endDate ? new Date(d.endDate) : null,
  // Los dos tramos completos: salida, llegada y numero de vuelo de cada uno. Este
  // transform es mas corto que el de sales.controller y no guardaba el numero de vuelo
  // ni las llegadas, asi que un paquete creado por aca perdia la mitad del transporte.
  fechaSalidaVuelo: d.flightDepartureDate ? new Date(d.flightDepartureDate) : null,
  fechaLlegadaVuelo: d.flightDepartureArrivalDate ? new Date(d.flightDepartureArrivalDate) : null,
  fechaRegresoVuelo: d.flightReturnDate ? new Date(d.flightReturnDate) : null,
  fechaLlegadaRegresoVuelo: d.flightReturnArrivalDate ? new Date(d.flightReturnArrivalDate) : null,
  adultosCount: d.adultsCount || 0,
  menoresCount: d.childrenCount || 0,
  nroVuelo: d.flightNumber || null,
  nroVueloRegreso: d.flightReturnNumber || null,
  nroReservaVuelo: d.flightReservationNumber || null,
  // Estos cuatro faltaban, asi que un paquete creado por este endpoint perdia el nombre
  // del hotel —y el detalle y el voucher mostraban el bloque de hotel vacio— y caia en
  // los valores por defecto de tipo de paquete y de transporte, que a su vez deciden las
  // etiquetas de la interfaz y con que codigo se factura el transporte en Siigo.
  nombreHotel: d.hotelName || null,
  paqueteTarifaId: d.packageRateId ? parseInt(d.packageRateId) : null,
  tipoPaquete: d.packageType || 'own',
  tipoTransporte: d.transportType || 'Aéreo',
  referenciaHotel: d.hotelReference || d.confirmationNumber || null,
  observaciones: d.observations || null
})).create;

exports.updatePlan = H(CATEGORIES.plan, 'prodPlanes').update;
exports.deletePlan = H(CATEGORIES.plan, 'prodPlanes').delete;

// =========================================================
// Check-in
// =========================================================
exports.createCheckin = H(CATEGORIES.checkin, 'prodCheckins', (d, detalleId) => ({
  detalleVentaId: detalleId,
  nroVueloReserva: d.flightOrReservation || null,
  fechaViaje: d.travelDate ? new Date(d.travelDate) : null,
  asiento: d.seat || null,
  maletasContadas: d.baggage || null,
  telefonoContacto: d.phone || null,
  necesidadesEspeciales: d.specialNeeds || null,
  usaSillaRuedas: d.needsWheelchair || false
})).create;

exports.updateCheckin = H(CATEGORIES.checkin, 'prodCheckins').update;
exports.deleteCheckin = H(CATEGORIES.checkin, 'prodCheckins').delete;

// =========================================================
// Migración
// =========================================================
exports.createMigration = H(CATEGORIES.migration, 'prodMigracion', (d, detalleId) => ({
  detalleVentaId: detalleId,
  tipoTramiteMigratorio: d.requestedDocType || null,
  nacionalidad: d.nationality || null,
  pasaporteNro: d.passportNumber || null,
  pasaporteVence: d.passportExpiry ? new Date(d.passportExpiry) : null,
  paisDestino: d.destinationCountry || null
})).create;

exports.updateMigration = H(CATEGORIES.migration, 'prodMigracion').update;
exports.deleteMigration = H(CATEGORIES.migration, 'prodMigracion').delete;

// =========================================================
// SIM Card
// =========================================================
exports.createSimcard = H(CATEGORIES.simcard, 'prodSimcards', (d, detalleId) => ({
  detalleVentaId: detalleId,
  paisDestino: d.destinationCountry || null,
  fechaLlegada: d.arrivalDate ? new Date(d.arrivalDate) : null,
  duracionViaje: d.tripDuration || null,
  planDatos: d.dataPlan || null,
  tipoSim: d.simType || null,
  metodoEntrega: d.deliveryMethod || null
})).create;

exports.updateSimcard = H(CATEGORIES.simcard, 'prodSimcards').update;
exports.deleteSimcard = H(CATEGORIES.simcard, 'prodSimcards').delete;

// =========================================================
// Renta de Autos
// =========================================================
exports.createCarRental = H(CATEGORIES.carRental, 'prodAutos', (d, detalleId) => ({
  detalleVentaId: detalleId,
  conductorNombre: d.mainDriver || null,
  licenciaNro: d.licenseNumber || null,
  fechaRecogida: d.pickupDate ? new Date(d.pickupDate) : null,
  fechaDevolucion: d.returnDate ? new Date(d.returnDate) : null,
  lugarRecogida: d.pickupLocation || null,
  categoriaAuto: d.vehicleCategory || null,
  conductoresAdicionales: d.additionalDrivers || 0,
  tipoSeguro: d.insuranceType || null,
  tarjetaGarantiaInfo: d.guaranteeCreditCard || null
})).create;

exports.updateCarRental = H(CATEGORIES.carRental, 'prodAutos').update;
exports.deleteCarRental = H(CATEGORIES.carRental, 'prodAutos').delete;

// =========================================================
// Fincas
// =========================================================
exports.createFinca = H(CATEGORIES.finca, 'prodFincas', (d, detalleId) => ({
  detalleVentaId: detalleId,
  responsableNombre: d.responsibleName || null,
  documentoResponsable: d.docNumber || null,
  fechaEntrada: d.checkInDate ? new Date(d.checkInDate) : null,
  fechaSalida: d.checkOutDate ? new Date(d.checkOutDate) : null,
  adultosCount: d.adultsCount || 0,
  ninosCount: d.childrenCount || 0,
  tieneMascotas: d.hasPets || false,
  tipoMascota: d.petType || null,
  serviciosExtra: d.additionalServices?.join(', ') || null
})).create;

exports.updateFinca = H(CATEGORIES.finca, 'prodFincas').update;
exports.deleteFinca = H(CATEGORIES.finca, 'prodFincas').delete;

// =========================================================
// Tours
// =========================================================
exports.createTour = H(CATEGORIES.tour, 'prodTours', (d, detalleId) => ({
  detalleVentaId: detalleId,
  tourNombre: d.selectedTour || null,
  fechaPreferida: d.preferredDate ? new Date(d.preferredDate) : null,
  adultosCount: d.adultsCount || 1,
  menoresCount: d.childrenCount || 0,
  edadesMenores: d.childrenAges || null,
  idiomaGuia: d.guideLanguage || null,
  requiereTransporte: d.needsTransport || false,
  puntoEncuentro: d.pickupPoint || null,
  condicionesMedicas: d.medicalConditions || null,
  telefonoContacto: d.phone || null
})).create;

exports.updateTour = H(CATEGORIES.tour, 'prodTours').update;
exports.deleteTour = H(CATEGORIES.tour, 'prodTours').delete;

// =========================================================
// Centros de Convención
// =========================================================
exports.createConvention = H(CATEGORIES.convention, 'prodEventos', (d, detalleId) => ({
  detalleVentaId: detalleId,
  organizacion: d.organization || null,
  nombreContacto: d.contactName || null,
  emailContacto: d.email || null,
  fechaInicio: d.startDate ? new Date(d.startDate) : null,
  fechaFin: d.endDate ? new Date(d.endDate) : null,
  asistenciaEstimada: d.estimatedAttendance || 0,
  espacioRequerido: d.requiredSpace || null,
  tipoEvento: d.eventType || null,
  equiposAv: d.avEquipment?.join(', ') || null,
  requiereCatering: d.hasCatering || false,
  notasCatering: d.cateringNotes || null
})).create;

exports.updateConvention = H(CATEGORIES.convention, 'prodEventos').update;
exports.deleteConvention = H(CATEGORIES.convention, 'prodEventos').delete;

// =========================================================
// Restaurantes
// =========================================================
exports.createRestaurant = H(CATEGORIES.restaurant, 'prodRestaurantes', (d, detalleId) => ({
  detalleVentaId: detalleId,
  nombreReserva: d.reservationName || null,
  fechaHoraReserva: d.dateTime ? new Date(d.dateTime) : null,
  personasCount: d.peopleCount || 0,
  preferenciaMesa: d.tablePreference || null,
  tipoMenu: d.menuType || null,
  restriccionesDieta: d.dietaryRestrictions?.join(', ') || null,
  ocasionEspecial: d.specialOccasion || null,
  telefonoContacto: d.phone || null
})).create;

exports.updateRestaurant = H(CATEGORIES.restaurant, 'prodRestaurantes').update;
exports.deleteRestaurant = H(CATEGORIES.restaurant, 'prodRestaurantes').delete;

// =========================================================
// Visa
// =========================================================
exports.createVisa = H(CATEGORIES.visa, 'prodVisas', (d, detalleId) => ({
  detalleVentaId: detalleId,
  nombreCompleto: d.fullName || null,
  fechaNacimiento: d.birthDate ? new Date(d.birthDate) : null,
  nacionalidad: d.nationality || null,
  nroPasaporte: d.passportNumber || null,
  vencimientoPasaporte: d.passportExpiration ? new Date(d.passportExpiration) : null,
  paisAplicacion: d.countryApplying || null,
  tipoVisa: d.visaType || null,
  fechaEstimadaViaje: d.estimatedTravelDate ? new Date(d.estimatedTravelDate) : null,
  emailContacto: d.email || null
})).create;

exports.updateVisa = H(CATEGORIES.visa, 'prodVisas').update;
exports.deleteVisa = H(CATEGORIES.visa, 'prodVisas').delete;

// =========================================================
// Pasaporte
// =========================================================
exports.createPassport = H(CATEGORIES.passport, 'prodPasaportes', (d, detalleId) => ({
  detalleVentaId: detalleId,
  nombreCompleto: d.fullName || null,
  nroDocumento: d.idNumber || null,
  fechaNacimiento: d.birthDate ? new Date(d.birthDate) : null,
  ciudadResidencia: d.residenceCity || null,
  tipoTramite: d.processType || null,
  fechaEstimadaViaje: d.estimatedTravelDate ? new Date(d.estimatedTravelDate) : null,
  telefonoContacto: d.phone || null
})).create;

exports.updatePassport = H(CATEGORIES.passport, 'prodPasaportes').update;
exports.deletePassport = H(CATEGORIES.passport, 'prodPasaportes').delete;

// =========================================================
// Servicio de Mascotas
// =========================================================
exports.createPetService = H(CATEGORIES.petService, 'prodMascotas', (d, detalleId) => ({
  detalleVentaId: detalleId,
  mascotaNombre: d.petName || null,
  especie: d.species || null,
  raza: d.breed || null,
  pesoKg: d.weight || 0,
  tamanoMascota: d.size === "pequeño" ? "pequeno" : (d.size || null),
  transporteTipo: d.travelType || null,
  fechaViaje: d.travelDate ? new Date(d.travelDate) : null,
  paisDestino: d.destinationCountry || null,
  condicionesMedicas: d.medicalConditions || null,
  telefonoContacto: d.phone || null
})).create;

exports.updatePetService = H(CATEGORIES.petService, 'prodMascotas').update;
exports.deletePetService = H(CATEGORIES.petService, 'prodMascotas').delete;

// =========================================================
// Equipaje
// =========================================================
exports.createBaggage = H(CATEGORIES.baggage, 'prodEquipajes', (d, detalleId) => ({
  detalleVentaId: detalleId,
  aerolineaId: d.airline ? parseInt(d.airline) : (d.airlineId ? parseInt(d.airlineId) : null),
  nroReserva: d.reservationNumber || d.nroReserva || null,
  pasajeroNombre: d.passengerName || d.pasajeroNombre || null,
  tipoTarifa: d.fareType || d.tipoTarifa || null,
  articuloPersonal: d.personalItem || d.articuloPersonal || null,
  equipajeMano: d.carryOn || d.equipajeMano || null,
  equipajeBodega: d.checkedBag || d.equipajeBodega || null,
  observaciones: d.notes || d.observaciones || null
})).create;

exports.updateBaggage = H(CATEGORIES.baggage, 'prodEquipajes').update;
exports.deleteBaggage = H(CATEGORIES.baggage, 'prodEquipajes').delete;

// =========================================================
// Viajes Terrestres
// =========================================================
exports.createLandTravel = H(CATEGORIES.landTravel, 'prodViajesTerrestres', (d, detalleId) => ({
  detalleVentaId: detalleId,
  empresaTransporte: d.transportCompany || null,
  origen: d.origin || null,
  destino: d.destination || null,
  fechaSalida: d.departureDate ? new Date(d.departureDate) : null,
  horaSalida: d.departureTime || null,
  localizadorTicket: d.ticketLocator || null,
  esIdaYVuelta: d.isRoundTrip || false,
  fechaRegreso: d.returnDate ? new Date(d.returnDate) : null,
  horaRegreso: d.returnTime || null
})).create;

exports.updateLandTravel = H(CATEGORIES.landTravel, 'prodViajesTerrestres').update;
exports.deleteLandTravel = H(CATEGORIES.landTravel, 'prodViajesTerrestres').delete;

// =========================================================
// Voucher Upload
// =========================================================
exports.uploadVoucher = async (req, res, next) => {
  try {
    const { saleId, category, productId } = req.params;
    if (!req.file) return error(res, 'Archivo requerido', 400);

    const productTables = {
      ticket: 'prodTiqueteria', hotel: 'prodHoteleria', insurance: 'prodSeguros',
      plan: 'prodPlanes', checkin: 'prodCheckins', migration: 'prodMigracion',
      simcard: 'prodSimcards', baggage: 'prodEquipajes', equipaje: 'prodEquipajes',
      carRental: 'prodAutos', finca: 'prodFincas',
      tour: 'prodTours', convention: 'prodEventos', restaurant: 'prodRestaurantes',
      visa: 'prodVisas', passport: 'prodPasaportes', petService: 'prodMascotas',
      landTravel: 'prodViajesTerrestres', viajes_terrestres: 'prodViajesTerrestres'
    };

    const tableName = productTables[category];
    if (!tableName) return error(res, 'Categoría inválida', 400);

    const product = await prisma[tableName].findUnique({ where: { id: productId } });
    if (!product) return error(res, 'Producto no encontrado', 404);
    const voucherUrl = `/uploads/${req.file.filename}`;

    await prisma.detalleVenta.update({
      where: { id: product.detalleVentaId },
      data: { voucherUrl }
    });

    success(res, { voucherUrl });
  } catch (err) {
    next(err);
  }
};
