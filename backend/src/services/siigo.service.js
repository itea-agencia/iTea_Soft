const axios = require('axios');

// 🛡️ ESCUDO ANTI-BLOQUEOS: Interceptor global para Siigo
// Si Siigo nos devuelve 429 (Rate Limit Exceeded), pausamos automáticamente 2 segundos y reintentamos.
axios.interceptors.response.use(null, async (error) => {
  if (error.response && error.response.status === 429) {
    console.log('🐌 Rate limit de Siigo alcanzado! Pausando por 2 segundos antes de reintentar la misma petición...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    return axios.request(error.config); // Reintenta la misma petición automáticamente
  }
  return Promise.reject(error);
});
class SiigoService {
  constructor() {
    this.baseURL = 'https://api.siigo.com';
    this.token = null; // Aqui se guarda el token de acceso
    this.tokenExpiresAt = null; // Aqui se guarda la fecha de expiracion del token
  }

  /**
   * Obtener el token valido
   */
  async getAuthToken() {
    // Verificar si el token es valido o si ya expiro
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      console.log("✅ Token valido, no es necesario solicitar uno nuevo");
      return this.token;
    }

    console.log("🔄 Token no valido o expirado, solicitando uno nuevo...");
    try {
      // Hacer autenticacion con el API de Siigo para obtener un token de acceso
      const response = await axios.post(`${this.baseURL}/auth`, {
        username: process.env.SIIGO_USERNAME,
        access_key: process.env.SIIGO_ACCESS_KEY
      });

      // Extraemos el token y su tiempo de vida de la respuesta
      const data = response.data;
      this.token = data.access_token; // Corregido: era access_token, no access_key

      // Siigo nos dice en cuantos segundos expira el token (suelen ser 24 horas)
      const expiresInSeconds = data.expires_in || 86400; // 24 horas por defecto
      this.tokenExpiresAt = new Date(Date.now() + (expiresInSeconds - 300) * 1000);

      console.log(`✅ Token obtenido, expira en: ${this.tokenExpiresAt}`);
      
      // PAUSA ESTRATÉGICA: Siigo Sandbox bloquea si hay > 1 petición por segundo.
      // Como acabamos de consumir 1 petición pidiendo el token, esperamos 1.5 seg
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return this.token;

    } catch (error) {
      console.error('❌ Error al obtener el token de autenticación:', error.response?.data || error.message);
      throw new Error('No se pudo obtener el token de autenticación');
    }
  }

  /**
   * Generar los headers estandarizados.
   */
  async getHeaders() {
    const token = await this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Partner-Id': 'iTeaSoftApp'
    };
  }

  /**
   * FASE 2: Buscar o crear un cliente en Siigo
   * Recibe los datos basicos de nuestro sistema y asegura que el cliente exista alla.
   */
  async getOrCreateCustomer(clienteData) {
    // 1. Siempre pedimos los headers (que ya incluyen nuestro token magico)
    const headers = await this.getHeaders();
    const documento = clienteData.documento;

    console.log(`🔍 Buscando cliente ${documento} en Siigo...`);

    try {
      // 2. Le preguntamos a Siigo: "Oye, ya tienes a alguien con esta cedula?"
      const searchRes = await axios.get(`${this.baseURL}/v1/customers?identification=${documento}`, { headers });
      
      // Siigo nos devuelve un arreglo 'results'. Si trae algo, el cliente ya existe.
      if (searchRes.data.results && searchRes.data.results.length > 0) {
        console.log('✅ El cliente ya existe en Siigo.');
        return searchRes.data.results[0]; // Retornamos el cliente existente
      }

      console.log('⚠️ El cliente no existe. Creandolo en Siigo...');

      // 3. Si no existe, lo creamos. Siigo es MUY estricto con el formato de los datos.
      const payload = {
        type: 'Person',                // Person (Persona natural) o Company (Empresa)
        person_type: 'Person',
        id_type: '13',                 // '13' es Cedula de Ciudadania en la DIAN
        identification: documento,
        name: [
          clienteData.nombres, 
          clienteData.apellidos || 'Apellidos' // Siigo obliga a mandar apellido si es 'Person'
        ],
        address: {
          address: 'Direccion generica', // Si no tenemos la real, mandamos una generica
          city: {
            country_code: 'Co',
            state_code: '11',           // 11 = Bogota
            city_code: '11001'          // 11001 = Bogota (Siigo exige un codigo DANE real)
          }
        },
        phones: [
          {
            indicator: '57',
            number: clienteData.telefono || '3000000000'
          }
        ],
        contacts: [
          {
            first_name: clienteData.nombres,
            last_name: clienteData.apellidos || 'Apellidos',
            email: clienteData.email || 'correo@pordefecto.com',
            phone: {
              indicator: '57',
              number: clienteData.telefono || '3000000000'
            }
          }
        ],
        fiscal_responsibilities: [
          { code: 'R-99-PN' } // Codigo estandar para persona natural (No responsable de IVA)
        ]
      };

      // Hacemos el POST para inyectarlo en Siigo
      const createRes = await axios.post(`${this.baseURL}/v1/customers`, payload, { headers });
      console.log('✅ Cliente creado exitosamente en Siigo!');
      
      return createRes.data;

    } catch (error) {
      console.error('❌ Error al sincronizar cliente en Siigo:', error.response?.data || error.message);
      throw new Error('Fallo al crear o buscar el cliente en Siigo');
    }
  }

  /**
   * FASE 3: Crear Factura de Venta en Siigo
   * Mapea nuestra venta interna al formato exigido por Siigo.
   */
  async createInvoice(ventaData, customerSiigo) {
    const headers = await this.getHeaders();
    
    // Asumimos que queremos facturar la "TA TOTAL NETA" que el usuario cobra
    const montoFacturar = ventaData.taTotalNeta || ventaData.montoTotal;

    const payload = {
      document: {
        id: 2372 // Volvemos al documento estándar
      },
      // Sandbox de Siigo es compartido y tiene muchísimas facturas, 
      // generamos un número aleatorio grande de 8 dígitos para esquivar colisiones
      number: Math.floor(Math.random() * 90000000) + 10000000, 
      date: new Date().toISOString().split('T')[0],
      customer: {
        identification: customerSiigo.identification,
        branch_office: 0
      },
      seller: 916, // ID real del usuario sandbox@siigoapi.com
      items: [
        {
          code: 'SRV-002', // El código que creaste
          description: `Servicios turísticos (Ref: ${ventaData.id})`,
          quantity: 1,
          price: montoFacturar
        }
      ],
      payments: [
        {
          id: 8147, // ID Interno del método "Efectivo"
          value: montoFacturar
        }
      ]
    };

    console.log(`🧾 Emitiendo factura a Siigo por $${montoFacturar}...`);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Evitar Rate Limit
      const response = await axios.post(`${this.baseURL}/v1/invoices`, payload, { headers });
      console.log('✅ Factura creada exitosamente en Siigo:', response.data.name);
      return response.data; // Retorna los detalles, incluyendo el ID de la factura en Siigo
    } catch (error) {
      console.error('❌ Error al crear factura en Siigo:', JSON.stringify(error.response?.data, null, 2));
      throw new Error('Fallo al emitir la factura en Siigo');
    }
  }
}

module.exports = new SiigoService();