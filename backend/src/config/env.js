require('dotenv').config();

// Los identificadores de Siigo difieren entre la sandbox y la cuenta real, asi que no
// pueden vivir hardcodeados. Los valores por defecto son los de la cuenta de produccion
// de Samtur, verificados contra la API el 2026-08-27.
const siigo = {
  baseUrl: process.env.SIIGO_BASE_URL || 'https://api.siigo.com',
  username: process.env.SIIGO_USERNAME,
  accessKey: process.env.SIIGO_ACCESS_KEY,
  partnerId: process.env.SIIGO_PARTNER_ID || 'iTeaSoftApp',

  // Tipo de documento: 30685 = "Factura electronica de venta" (ElectronicInvoice,
  // automatic_number). El 16490 de la misma cuenta es NoElectronic y no sirve.
  documentId: parseInt(process.env.SIIGO_DOCUMENT_ID, 10) || 30685,
  // Vendedor: 831 = info@samturtravel.com (SAMTUR TRAVEL AGENCY SAS).
  sellerId: parseInt(process.env.SIIGO_SELLER_ID, 10) || 831,
  // Codigo de producto de respaldo. Sin valor por defecto a proposito: 'CRE' quedo
  // INACTIVO en Siigo el 2026-09-04, igual que 'TA', 'TKTS' y 'S100'. El codigo correcto
  // depende de la categoria y se resuelve en la Fase 2.
  itemCodeDefault: process.env.SIIGO_ITEM_CODE_DEFAULT || '',
  // Forma de pago de respaldo: 12467 = "Otros".
  paymentTypeDefault: parseInt(process.env.SIIGO_PAYMENT_TYPE_DEFAULT, 10) || 12467,
  // Id del impuesto IVA 19% en la cuenta real.
  ivaTaxId: parseInt(process.env.SIIGO_IVA_TAX_ID, 10) || 8872,
  ivaRate: parseFloat(process.env.SIIGO_IVA_RATE) || 0.19,

  // Con dryRun activo se arma y persiste el payload pero NO se llama a Siigo.
  // Emitir factura electronica no se revierte, asi que este es el modo seguro por defecto
  // hasta que contabilidad valide el mapeo.
  dryRun: process.env.SIIGO_DRY_RUN !== 'false',
};

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'itea-jwt-secret-change-in-production',
  jwtExpiresIn: '1d',
  jwtRememberExpiresIn: '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development',
  siigo,
};

module.exports = env;
