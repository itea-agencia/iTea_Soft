/**
 * Mapeo entre las categorías de iTea y el catálogo de Siigo de Samtur.
 *
 * Verificado contra la API de Siigo el 2026-09-04.
 *
 * El catálogo nuevo (códigos 016-049) tiene un par por cada categoría de iTea:
 *   IT = Ingresos de Terceros  -> lo que se le paga al proveedor. Sin impuestos.
 *   IP = Ingresos Propios      -> la tarifa administrativa de la agencia. IVA 19%.
 *
 * El catálogo anterior (001-015) sigue activo pero no se usa desde aquí: solo cubría
 * tiquetes, transporte terrestre, paquetes y comisiones, y distinguía nacional de
 * internacional, distinción que el catálogo nuevo abandona.
 *
 * Los códigos 'S100', 'TA', 'TKTS' y 'CRE' quedaron INACTIVOS en Siigo; no usarlos.
 */

const env = require('./env');

// categoría de iTea -> { código IT, código IP, centro de costo }
const CATEGORIAS = {
  // Tiqueteria usa el catalogo ANTERIOR (001/002 y 005/006) porque es el operativo: los
  // codigos 030/031 del catalogo nuevo estan registrados pero no se usan, y son la
  // redundancia que contabilidad va a eliminar. Es la unica categoria con variante
  // nacional/internacional.
  tiqueteria: {
    nombre: 'Tiquetería',
    porCobertura: {
      nacional:      { it: '005', ip: '001', costCenter: 445 },
      internacional: { it: '006', ip: '002', costCenter: 453 },
    },
  },
  hoteleria:                { it: '016', ip: '017', costCenter: 10668, nombre: 'Hotelería' },
  seguros_viaje:            { it: '032', ip: '033', costCenter: 10684, nombre: 'Seguros de Viaje' },
  planes:                   { it: '022', ip: '023', costCenter: 10674, nombre: 'Paquetes' },
  checkin:                  { it: '042', ip: '043', costCenter: 10694, nombre: 'Check-in' },
  documentacion_migratoria: { it: '040', ip: '041', costCenter: 10692, nombre: 'Documentación Migratoria' },
  simcard:                  { it: '044', ip: '045', costCenter: 10696, nombre: 'SIM Card' },
  equipaje:                 { it: '028', ip: '029', costCenter: 10680, nombre: 'Equipajes' },
  renta_vehiculos:          { it: '046', ip: '047', costCenter: 10698, nombre: 'Renta de Vehículos' },
  renta_fincas:             { it: '048', ip: '049', costCenter: 10700, nombre: 'Renta de Fincas' },
  tours:                    { it: '020', ip: '021', costCenter: 10672, nombre: 'Tours' },
  centros_convencion:       { it: '026', ip: '027', costCenter: 10678, nombre: 'Centros de Convención' },
  restaurantes:             { it: '018', ip: '019', costCenter: 10670, nombre: 'Restaurantes' },
  visa:                     { it: '038', ip: '039', costCenter: 10690, nombre: 'Visa' },
  pasaporte:                { it: '036', ip: '037', costCenter: 10688, nombre: 'Pasaporte' },
  servicio_mascotas:        { it: '034', ip: '035', costCenter: 10686, nombre: 'Servicios de Mascotas' },
  viajes_terrestres:        { it: '024', ip: '025', costCenter: 10676, nombre: 'Viajes Terrestres' },
};

// `detalle_venta.ta_cre`, que la interfaz llama "TA SAE". No tiene par en el catálogo nuevo.
const CODIGO_SAE = '004';

// S126-1. El cost_center es único por factura, así que una venta que mezcla categorías
// no puede expresar el de cada una: este es el comodín.
const COST_CENTER_VARIOS = 10702;

// iTea guarda los métodos de pago con nombre libre y Siigo los identifica por id.
// Las claves van normalizadas: minúsculas y sin tildes.
const FORMAS_PAGO = {
  'efectivo': 3799,
  'credito': 3800,
  'tarjeta debito': 3801,
  'tarjeta de debito': 3801,
  'tarjeta credito': 3802,
  'tarjeta de credito': 3802,
  'cheque': 12464,
  'transferencia': 12465,
  'consignacion': 12466,
};

// Cubre PSE, Llaves, Tarjeta Davivienda, CTA CTE 2060 y Tarjeta de Bancolombia, que no
// tienen equivalente propio en la cuenta de Siigo. Configurable por SIIGO_PAYMENT_TYPE_DEFAULT;
// 12467 es "Otros".
const FORMA_PAGO_OTROS = env.siigo.paymentTypeDefault;

// Códigos DIAN de tipo de identificación, por abreviatura de `tipos_documento`.
// Confirmado contra los terceros reales de Siigo: CC va como 13 y NIT como 31.
// PPT (Permiso por Protección Temporal) usa 48 según la DIAN, pero no hay ningún
// tercero con ese tipo en la cuenta, así que está sin verificar.
const TIPOS_DOCUMENTO = {
  'CC': '13',
  'CE': '22',
  'PASAPORTE': '41',
  'NIT': '31',
  'TI': '12',
  'T.I': '12',
  'REG': '11',
  'PPT': '48',
};

// Todos los terceros de la cuenta, personas y empresas, usan R-99-PN ("No aplica - Otros").
const RESPONSABILIDAD_FISCAL = 'R-99-PN';

const normalizar = (texto) =>
  String(texto || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

/**
 * Devuelve { it, ip, costCenter, nombre } para una categoría.
 * `cobertura` solo aplica a las categorías con variante nacional/internacional; para el
 * resto se ignora. Si falta, se asume nacional: las ventas históricas son todas nacionales.
 */
function resolverCategoria(categoria, cobertura = 'nacional') {
  const mapeo = CATEGORIAS[categoria];
  if (!mapeo) {
    throw Object.assign(
      new Error(`La categoría "${categoria}" no tiene mapeo al catálogo de Siigo`),
      { statusCode: 422, code: 'SIIGO_CATEGORIA_SIN_MAPEO' },
    );
  }

  if (!mapeo.porCobertura) return mapeo;

  const variante = mapeo.porCobertura[cobertura] || mapeo.porCobertura.nacional;
  return { ...variante, nombre: mapeo.nombre };
}

/** true si la categoría distingue nacional de internacional. */
const distingueCobertura = (categoria) => Boolean(CATEGORIAS[categoria]?.porCobertura);

/**
 * El cost_center va a nivel documento. Si todos los servicios de la venta resuelven al
 * mismo centro se usa ese; si no, el comodín "Varios Servicios".
 *
 * Recibe pares { categoria, cobertura } porque una venta con un vuelo nacional y otro
 * internacional cae en centros distintos (445 y 453) y también necesita el comodín.
 */
function resolverCostCenter(servicios) {
  const centros = new Set(
    servicios.map(({ categoria, cobertura }) => resolverCategoria(categoria, cobertura).costCenter),
  );
  return centros.size === 1 ? [...centros][0] : COST_CENTER_VARIOS;
}

function resolverFormaPago(nombreMetodoPago) {
  return FORMAS_PAGO[normalizar(nombreMetodoPago)] || FORMA_PAGO_OTROS;
}

/**
 * Devuelve el id_type de la DIAN y el person_type que le corresponde.
 * Solo el NIT identifica a una empresa.
 */
function resolverIdentificacion(abreviaturaTipoDocumento) {
  const abreviatura = String(abreviaturaTipoDocumento || '').trim().toUpperCase();
  const idType = TIPOS_DOCUMENTO[abreviatura];

  if (!idType) {
    throw Object.assign(
      new Error(`El tipo de documento "${abreviaturaTipoDocumento}" no tiene código DIAN mapeado`),
      { statusCode: 422, code: 'SIIGO_TIPO_DOCUMENTO_SIN_MAPEO' },
    );
  }

  return {
    idType,
    personType: abreviatura === 'NIT' ? 'Company' : 'Person',
    fiscalResponsibility: RESPONSABILIDAD_FISCAL,
  };
}

module.exports = {
  CATEGORIAS,
  CODIGO_SAE,
  COST_CENTER_VARIOS,
  FORMA_PAGO_OTROS,
  RESPONSABILIDAD_FISCAL,
  resolverCategoria,
  distingueCobertura,
  resolverCostCenter,
  resolverFormaPago,
  resolverIdentificacion,
};
