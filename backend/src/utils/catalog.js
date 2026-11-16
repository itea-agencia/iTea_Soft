/**
 * Catalogos de la venta (proveedores, aerolineas, metodos de pago, planes de equipaje y
 * aeropuertos) indexados en memoria, para resolver lo que manda el asistente.
 *
 * Antes cada nombre se buscaba exacto en la base y, si no aparecia, el dato se guardaba
 * vacio sin aviso: el Combobox acepta texto libre, asi que "Clic Kiu" en vez de "CLIC KIU"
 * dejaba la venta sin proveedor, y un aeropuerto desconocido descartaba el tramo entero.
 * Ademas parseInt('123 Viajes') se tomaba como el id 123. Ahora un nombre se encuentra aunque
 * cambien mayusculas o espacios, un id tiene que ser un entero completo que exista, y lo que
 * no se encuentra es `undefined` para que el controlador lo rechace.
 * Diseño catalogo-sin-perdida-silenciosa-2026-11.
 */
const AMBIGUOUS = Symbol('ambiguous');
const normalize = (v) => String(v).trim().replace(/\s+/g, ' ').toLowerCase();

function buildIndex(rows) {
  const ids = new Set();
  const byKey = new Map();
  for (const { id, keys } of rows) {
    if (id === null || id === undefined) continue;
    ids.add(id);
    for (const key of keys) {
      if (!key) continue;
      const k = normalize(key);
      const prev = byKey.get(k);
      byKey.set(k, prev === undefined || prev === id ? id : AMBIGUOUS);
    }
  }
  return { ids, byKey };
}

/** null si no hay valor; el id si se encuentra; undefined si no existe o es ambiguo. */
function findId(index, value) {
  if (value === undefined || value === null || String(value).trim() === '') return null;
  const asId = typeof value === 'number' ? value : (/^\d+$/.test(String(value).trim()) ? Number(value) : NaN);
  if (Number.isInteger(asId)) return index.ids.has(asId) ? asId : undefined;
  const found = index.byKey.get(normalize(value));
  return found === AMBIGUOUS ? undefined : found;
}

async function loadCatalog(db) {
  const [suppliers, airlines, methods, cards, plans, airports] = await Promise.all([
    db.proveedores.findMany({ select: { id: true, nombre: true } }),
    db.aerolineas.findMany({ select: { id: true, nombre: true } }),
    db.metodosPago.findMany({ select: { id: true, nombre: true } }),
    db.tarjetasAgencia.findMany({ select: { id: true, nombre: true, metodoPagoId: true } }),
    db.politicasEquipaje.findMany({ select: { id: true, tipoTarifa: true, aerolineaId: true, aerolinea: { select: { nombre: true } } } }),
    db.aeropuertos.findMany({ select: { id: true, codigoIata: true } }),
  ]);
  return {
    suppliers: buildIndex(suppliers.map(s => ({ id: s.id, keys: [s.nombre] }))),
    airlines: buildIndex(airlines.map(a => ({ id: a.id, keys: [a.nombre] }))),
    paymentMethods: buildIndex([
      ...methods.map(m => ({ id: m.id, keys: [m.nombre] })),
      ...cards.map(c => ({ id: c.metodoPagoId, keys: [c.nombre] })),
    ]),
    // Lo que manda el asistente es "<aerolinea> - <tarifa>"; la tarifa sola solo si es unica.
    baggagePlans: buildIndex(plans.map(p => ({
      id: p.id, keys: [`${String(p.aerolinea?.nombre || '').trim()} - ${p.tipoTarifa}`, p.tipoTarifa],
    }))),
    airports: buildIndex(airports.map(a => ({ id: a.id, keys: [a.codigoIata] }))),
    planAirline: new Map(plans.map(p => [p.id, p.aerolineaId])),
    agencyCards: buildIndex(cards.map(c => ({ id: c.id, keys: [c.nombre] }))),
  };
}

/**
 * true si el plan de equipaje es de la aerolinea, o si falta alguno de los dos y no hay con
 * que comparar. Diseño plan-equipaje-de-su-aerolinea-2026-11.
 */
function planMatchesAirline(catalog, planId, airlineId) {
  if (planId === null || planId === undefined || airlineId === null || airlineId === undefined) return true;
  return catalog.planAirline.get(planId) === airlineId;
}

/**
 * Con que se le pago al proveedor. Se guarda la tarjeta de la agencia y el metodo queda vacio:
 * se deduce de la tarjeta al leer, para que corregir el metodo de una tarjeta corrija todas
 * sus ventas. De respaldo (borradores y pestañas con el frontend anterior) llega un nombre:
 * primero se busca como tarjeta y si no como metodo, que se guarda sin tarjeta como antes.
 * Un numero de respaldo es un id de metodo, como lo trataba resolvePaymentMethodId.
 * null si no hay dato; undefined si no existe. Diseño catalogo-por-id-2026-11.
 */
function resolveSupplierPayment(catalog, { cardId, legacyName } = {}) {
  const card = findId(catalog.agencyCards, cardId);
  if (card !== null) return card === undefined ? undefined : { tarjetaAgenciaId: card, metodoPagoProveedorId: null };
  const numeric = legacyName !== undefined && legacyName !== null && /^\d+$/.test(String(legacyName).trim());
  const byCard = numeric ? undefined : findId(catalog.agencyCards, legacyName);
  if (byCard === null) return null;
  if (byCard !== undefined) return { tarjetaAgenciaId: byCard, metodoPagoProveedorId: null };
  const method = findId(catalog.paymentMethods, legacyName);
  return method === undefined ? undefined : { tarjetaAgenciaId: null, metodoPagoProveedorId: method };
}

module.exports = { buildIndex, findId, loadCatalog, planMatchesAirline, resolveSupplierPayment };
