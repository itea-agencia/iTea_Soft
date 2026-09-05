const axios = require('axios');
const env = require('../config/env');
const catalogo = require('../config/siigo-catalog');
const ciudadesDane = require('../config/ciudades-dane');

const cfg = env.siigo;

// Instancia dedicada. El interceptor de reintento vive AQUI y no en la instancia global de
// axios: antes se registraba con `axios.interceptors.response.use(...)`, asi que cualquier
// peticion HTTP del backend heredaba la pausa de 2 segundos y el reintento ante un 429.
const http = axios.create({ baseURL: cfg.baseUrl });

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Siigo responde 429 si se supera ~1 peticion por segundo. Se reintenta una sola vez por
// peticion para no encadenar reintentos infinitos.
http.interceptors.response.use(null, async (error) => {
  const config = error.config || {};
  if (error.response?.status === 429 && !config.__reintentado) {
    config.__reintentado = true;
    console.log('Siigo devolvio 429. Pausa de 2s y un reintento.');
    await sleep(2000);
    return http.request(config);
  }
  return Promise.reject(error);
});

class SiigoService {
  constructor() {
    this.token = null;
    this.tokenExpiresAt = null;
    // Se conserva por compatibilidad: siigo.routes.js lo usa para armar URLs.
    this.baseURL = cfg.baseUrl;
  }

  get dryRun() {
    return cfg.dryRun;
  }

  async getAuthToken() {
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.token;
    }

    if (!cfg.username || !cfg.accessKey) {
      throw new Error('Faltan SIIGO_USERNAME o SIIGO_ACCESS_KEY en el entorno');
    }

    try {
      const { data } = await http.post('/auth', {
        username: cfg.username,
        access_key: cfg.accessKey,
      });

      this.token = data.access_token;
      const expiresInSeconds = data.expires_in || 86400;
      // Se resta un margen de 5 minutos para no usar un token al borde de expirar.
      this.tokenExpiresAt = new Date(Date.now() + (expiresInSeconds - 300) * 1000);

      await sleep(1500); // Respetar el limite de peticiones por segundo.
      return this.token;
    } catch (error) {
      console.error('Siigo: fallo la autenticacion:', error.response?.data || error.message);
      throw new Error('No se pudo obtener el token de autenticacion de Siigo');
    }
  }

  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Partner-Id': cfg.partnerId,
    };
  }

  /**
   * Busca el tercero por documento y lo crea si no existe.
   * Con `soloBuscar` no crea nada: si no existe devuelve un tercero tentativo armado desde
   * la persona. Es lo que usa el modo dry-run para no escribir en Siigo.
   */
  async getOrCreateCustomer(persona, { soloBuscar = false } = {}) {
    const headers = await this.getHeaders();
    const documento = persona.documento;

    if (!documento) {
      throw new Error(`La persona ${persona.id} no tiene documento; Siigo lo exige`);
    }

    try {
      const { data: busqueda } = await http.get(
        `/v1/customers?identification=${encodeURIComponent(documento)}`,
        { headers },
      );

      if (busqueda.results && busqueda.results.length > 0) {
        return busqueda.results[0];
      }

      if (soloBuscar) {
        // El dry-run no debe escribir nada en Siigo.
        return { identification: String(documento), noExisteAun: true };
      }

      // El tipo de identificacion sale de TiposDocumento, no fijo: un cliente con NIT es
      // una empresa y Siigo lo rechaza si se envia como persona natural.
      const { idType, personType, fiscalResponsibility } = catalogo.resolverIdentificacion(
        persona.tipoDocumento?.abreviatura,
      );

      // Direccion y ciudad son opcionales en iTea pero obligatorias para Siigo. Cuando el
      // cliente no las tiene se cae a Bogota, que es lo que se venia enviando para todos.
      const ciudad = ciudadesDane.aCiudadSiigo(persona.ciudadCodigoDane)
        || { country_code: 'Co', state_code: '11', city_code: '11001' };
      const direccion = persona.direccion || 'No registrada';

      const payload = {
        type: 'Customer',
        person_type: personType,
        id_type: idType,
        identification: String(documento),
        name: personType === 'Company'
          ? [`${persona.nombres} ${persona.apellidos || ''}`.trim()]
          : [persona.nombres, persona.apellidos || 'Apellidos'],
        address: { address: direccion, city: ciudad },
        phones: [{ indicator: '57', number: persona.telefono || '3000000000' }],
        contacts: [
          {
            first_name: persona.nombres,
            last_name: persona.apellidos || 'Apellidos',
            email: persona.email || 'correo@pordefecto.com',
            phone: { indicator: '57', number: persona.telefono || '3000000000' },
          },
        ],
        fiscal_responsibilities: [{ code: fiscalResponsibility }],
      };

      const { data: creado } = await http.post('/v1/customers', payload, { headers });
      return creado;
    } catch (error) {
      console.error('Siigo: fallo la sincronizacion del cliente:', error.response?.data || error.message);
      throw new Error('Fallo al crear o buscar el cliente en Siigo');
    }
  }

  /**
   * Convierte un monto con IVA incluido en la base gravable que espera Siigo.
   * Los importes de iTea vienen con IVA; Siigo recibe la base y calcula el impuesto.
   * Seis decimales, como en las facturas que emite el equipo a mano.
   */
  static baseGravable(montoConIva) {
    const base = montoConIva / (1 + cfg.ivaRate);
    return Math.round(base * 1e6) / 1e6;
  }

  /**
   * Arma el payload de la factura sin enviarlo. Separado de la emision para poder
   * inspeccionarlo en modo dry-run y persistirlo siempre.
   *
   * Estructura, tomada de las facturas reales de Samtur: hasta tres lineas por cada
   * DetalleVenta, y un solo cost_center a nivel documento.
   *
   *   costo_proveedor -> codigo IT de la categoria, con el proveedor como Tercero, sin IVA
   *   ta              -> codigo IP de la categoria, IVA 19%
   *   ta_cre (TA SAE) -> codigo 004, IVA 19%
   */
  buildInvoicePayload(venta, customerSiigo) {
    const detalles = venta.detalleVentas || [];
    const advertencias = [];

    if (detalles.length === 0) {
      throw Object.assign(
        new Error(`La venta ${venta.id} no tiene servicios que facturar`),
        { statusCode: 422, code: 'SIIGO_VENTA_SIN_DETALLES' },
      );
    }

    const items = [];
    let sumaLineas = 0;

    for (const detalle of detalles) {
      const mapeo = catalogo.resolverCategoria(detalle.categoria);
      // `nombreServicio` suele repetir el nombre de la categoria; se evita la duplicacion.
      const detalleNombre = detalle.nombreServicio && detalle.nombreServicio !== mapeo.nombre
        ? `${mapeo.nombre} - ${detalle.nombreServicio}`
        : mapeo.nombre;

      const costoProveedor = Number(detalle.costoProveedor) || 0;
      const ta = Number(detalle.ta) || 0;
      const taCre = Number(detalle.taCre) || 0;

      // Linea IT: lo que se le paga al proveedor. Va sin impuestos y lleva Tercero.
      if (costoProveedor > 0) {
        const item = {
          code: mapeo.it,
          description: detalleNombre,
          quantity: 1,
          price: costoProveedor,
        };

        // El Tercero es obligatorio en la linea IT: es el ingreso que se le atribuye al
        // proveedor. Sin el, la factura queda contablemente mal imputada, asi que se corta
        // aqui en vez de emitirla incompleta.
        if (!detalle.proveedor) {
          throw Object.assign(
            new Error(`El servicio de ${mapeo.nombre} no tiene proveedor asignado y su costo debe facturarse a nombre del Tercero`),
            { statusCode: 422, code: 'SIIGO_DETALLE_SIN_PROVEEDOR' },
          );
        }
        if (!detalle.proveedor.documento) {
          throw Object.assign(
            new Error(`El proveedor "${detalle.proveedor.nombre}" no tiene documento registrado. Cargalo en Configuracion > Proveedores para poder facturar.`),
            { statusCode: 422, code: 'SIIGO_PROVEEDOR_SIN_DOCUMENTO' },
          );
        }

        item.customer = {
          identification: String(detalle.proveedor.documento),
          branch_office: 0,
        };

        items.push(item);
        sumaLineas += costoProveedor;
      }

      // Linea IP: la tarifa administrativa de la agencia.
      if (ta > 0) {
        items.push({
          code: mapeo.ip,
          description: `${mapeo.nombre} - Tarifa Administrativa`,
          quantity: 1,
          price: SiigoService.baseGravable(ta),
          taxes: [{ id: cfg.ivaTaxId }],
        });
        sumaLineas += ta;
      }

      // Linea SAE: el campo que la interfaz llama TA SAE.
      if (taCre > 0) {
        items.push({
          code: catalogo.CODIGO_SAE,
          description: 'Servicios Administrativos Especializados',
          quantity: 1,
          price: SiigoService.baseGravable(taCre),
          taxes: [{ id: cfg.ivaTaxId }],
        });
        sumaLineas += taCre;
      }
    }

    if (items.length === 0) {
      throw Object.assign(
        new Error(`La venta ${venta.id} no tiene importes que facturar`),
        { statusCode: 422, code: 'SIIGO_VENTA_SIN_IMPORTES' },
      );
    }

    // Si las lineas no suman el total de la venta, algo esta mal contado. Se corta aqui
    // en vez de emitir una factura por un valor distinto al de la venta.
    const montoTotal = Number(venta.montoTotal) || 0;
    if (Math.abs(sumaLineas - montoTotal) > 1) {
      throw Object.assign(
        new Error(
          `Las lineas suman ${sumaLineas.toFixed(2)} pero la venta ${venta.id} vale ${montoTotal.toFixed(2)}`,
        ),
        { statusCode: 422, code: 'SIIGO_TOTALES_NO_CUADRAN' },
      );
    }

    const observaciones = [venta.observaciones, venta.responsable?.persona
      ? `RESPONSABLE ${venta.responsable.persona.nombres} ${venta.responsable.persona.apellidos}`.toUpperCase()
      : null]
      .filter(Boolean)
      .join('\n');

    const payload = {
      document: { id: cfg.documentId },
      // Sin `number`: el documento configurado usa numeracion automatica y la consecutiva
      // de factura electronica la controla la DIAN.
      date: new Date().toISOString().split('T')[0],
      customer: {
        identification: customerSiigo.identification,
        branch_office: 0,
      },
      cost_center: catalogo.resolverCostCenter(detalles.map((d) => d.categoria)),
      seller: cfg.sellerId,
      observations: observaciones,
      items,
      payments: [
        {
          id: catalogo.resolverFormaPago(venta.metodoPagoPrincipal?.nombre),
          value: montoTotal,
        },
      ],
    };

    return { payload, advertencias };
  }

  /**
   * Emite la factura. En modo dry-run devuelve el payload y no llama a Siigo.
   */
  async createInvoice(venta, customerSiigo) {
    const { payload, advertencias } = this.buildInvoicePayload(venta, customerSiigo);

    if (cfg.dryRun) {
      if (customerSiigo.noExisteAun) {
        advertencias.push(`El tercero ${customerSiigo.identification} aun no existe en Siigo; se crearia al emitir`);
      }
      console.log(`Siigo DRY RUN: venta ${venta.id} no se envio. Payload construido.`);
      return { dryRun: true, payload, advertencias };
    }

    // Sin `stamp.send`, Siigo crea la factura en estado Draft y no la timbra ante la DIAN.
    // Es lo que hace hoy el equipo a mano, y es deliberado: un borrador se corrige o se
    // elimina desde Siigo, mientras una factura timbrada solo se anula con nota credito.
    const headers = await this.getHeaders();
    await sleep(1500);

    try {
      const { data } = await http.post('/v1/invoices', payload, { headers });
      return { dryRun: false, payload, advertencias, respuesta: data };
    } catch (error) {
      const detalle = error.response?.data;
      console.error('Siigo: fallo la emision de la factura:', JSON.stringify(detalle, null, 2));
      const err = new Error(
        detalle?.Errors?.[0]?.Message || detalle?.message || 'Fallo al emitir la factura en Siigo',
      );
      err.siigoDetalle = detalle;
      err.siigoPayload = payload;
      throw err;
    }
  }
}

module.exports = new SiigoService();
