const axios = require('axios');
const env = require('../config/env');

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

      // TODO Fase 2: id_type y person_type deben salir de TiposDocumento, y la direccion
      // de campos reales de Personas. Hoy siguen siendo valores fijos de persona natural.
      const payload = {
        type: 'Customer',
        person_type: 'Person',
        id_type: '13',
        identification: String(documento),
        name: [persona.nombres, persona.apellidos || 'Apellidos'],
        address: {
          address: 'Direccion generica',
          city: { country_code: 'Co', state_code: '11', city_code: '11001' },
        },
        phones: [{ indicator: '57', number: persona.telefono || '3000000000' }],
        contacts: [
          {
            first_name: persona.nombres,
            last_name: persona.apellidos || 'Apellidos',
            email: persona.email || 'correo@pordefecto.com',
            phone: { indicator: '57', number: persona.telefono || '3000000000' },
          },
        ],
        fiscal_responsibilities: [{ code: 'R-99-PN' }],
      };

      const { data: creado } = await http.post('/v1/customers', payload, { headers });
      return creado;
    } catch (error) {
      console.error('Siigo: fallo la sincronizacion del cliente:', error.response?.data || error.message);
      throw new Error('Fallo al crear o buscar el cliente en Siigo');
    }
  }

  /**
   * Arma el payload de la factura sin enviarlo. Separado de la emision para poder
   * inspeccionarlo en modo dry-run y persistirlo siempre.
   *
   * TODO Fase 2: una linea por cada DetalleVenta (costo de proveedor con Tercero, `ta` con
   * el codigo IP de la categoria, `ta_cre` con el codigo 004), `cost_center`, `price` como
   * base gravable y `taxes` explicitos. Hoy emite una sola linea generica sin impuestos.
   */
  buildInvoicePayload(venta, customerSiigo, opciones = {}) {
    const monto = venta.montoTotal;

    return {
      document: { id: cfg.documentId },
      // Sin `number`: el documento configurado usa numeracion automatica y la consecutiva de
      // factura electronica la controla la DIAN.
      date: new Date().toISOString().split('T')[0],
      customer: {
        identification: customerSiigo.identification,
        branch_office: 0,
      },
      seller: cfg.sellerId,
      observations: venta.observaciones || '',
      items: [
        {
          code: opciones.itemCode || cfg.itemCodeDefault,
          description: `Servicios turisticos (Ref: ${venta.id})`,
          quantity: 1,
          price: monto,
        },
      ],
      payments: [
        {
          id: opciones.paymentTypeId || cfg.paymentTypeDefault,
          value: monto,
        },
      ],
    };
  }

  /**
   * Emite la factura. En modo dry-run devuelve el payload y no llama a Siigo.
   */
  async createInvoice(venta, customerSiigo, opciones = {}) {
    const payload = this.buildInvoicePayload(venta, customerSiigo, opciones);

    if (cfg.dryRun) {
      if (customerSiigo.noExisteAun) {
        console.log(`Siigo DRY RUN: el tercero ${customerSiigo.identification} aun no existe en Siigo; se crearia al emitir.`);
      }
      console.log(`Siigo DRY RUN: venta ${venta.id} no se envio. Payload construido.`);
      return { dryRun: true, payload };
    }

    const headers = await this.getHeaders();
    await sleep(1500);

    try {
      const { data } = await http.post('/v1/invoices', payload, { headers });
      return { dryRun: false, payload, respuesta: data };
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
