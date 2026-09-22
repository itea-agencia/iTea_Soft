require("dotenv").config();

// Los identificadores de Siigo difieren entre la sandbox y la cuenta real, asi que no
// pueden vivir hardcodeados. Los valores por defecto son los de la cuenta de produccion
// de Samtur, verificados contra la API el 2026-08-27.
const siigo = {
  baseUrl: process.env.SIIGO_BASE_URL || "https://api.siigo.com",
  username: process.env.SIIGO_USERNAME,
  accessKey: process.env.SIIGO_ACCESS_KEY,
  partnerId: process.env.SIIGO_PARTNER_ID || "iTeaSoftApp",

  // Tipo de documento: 30685 = "Factura electronica de venta" (ElectronicInvoice,
  // automatic_number). El 16490 de la misma cuenta es NoElectronic y no sirve.
  documentId: parseInt(process.env.SIIGO_DOCUMENT_ID, 10) || 30685,
  // Vendedor: 831 = info@samturtravel.com (SAMTUR TRAVEL AGENCY SAS).
  sellerId: parseInt(process.env.SIIGO_SELLER_ID, 10) || 831,
  // Forma de pago de respaldo cuando el metodo de la venta no tiene equivalente en Siigo
  // (PSE, Llaves, Tarjeta Davivienda, CTA CTE 2060, Tarjeta de Bancolombia).
  // 12467 = "Otros". Lo consume siigo-catalog.js.
  paymentTypeDefault:
    parseInt(process.env.SIIGO_PAYMENT_TYPE_DEFAULT, 10) || 12467,
  // Forma de pago de las ventas a credito. 3800 = "Credito". Va con `due_date`, y deja la
  // factura con balance igual al total en vez de saldada.
  paymentTypeCredito:
    parseInt(process.env.SIIGO_PAYMENT_TYPE_CREDITO, 10) || 3800,
  // Id del impuesto IVA 19% en la cuenta real.
  ivaTaxId: parseInt(process.env.SIIGO_IVA_TAX_ID, 10) || 8872,
  ivaRate: parseFloat(process.env.SIIGO_IVA_RATE) || 0.19,

  // Con dryRun activo se arma y persiste el payload pero NO se llama a Siigo.
  // Emitir factura electronica no se revierte, asi que este es el modo seguro por defecto
  // hasta que contabilidad valide el mapeo.
  dryRun: process.env.SIIGO_DRY_RUN !== "false",
};

/**
 * Guardarrail: no emitir facturas reales desde un entorno de pruebas.
 *
 * La sandbox y la cuenta real de Siigo comparten host, asi que lo unico que separa un
 * entorno del otro son las credenciales. Con las de produccion cargadas y el dry run
 * apagado, un local emite facturas reales en la cuenta de Samtur, y una factura
 * electronica no se revierte: anularla exige nota credito.
 *
 * NODE_ENV no sirve para decidirlo. `.env.production` lo trae en "development", asi que
 * copiar ese archivo se lo lleva puesto, y en Render el valor viene del blueprint. La
 * senal confiable es la BASE DE DATOS: si las ventas salen de una base local, sus
 * facturas no pueden ir a una cuenta real. Es tambien el invariante que importa de
 * verdad, no emitir facturas reales a partir de datos de prueba.
 *
 * Se puede levantar a proposito con SIIGO_ALLOW_LOCAL_EMISION=true, que es lo que hay que
 * poner para probar contra la sandbox con llamadas de verdad.
 */
const HOSTS_DE_BASE_LOCAL = ["localhost", "127.0.0.1", "::1", "postgres"];

function hostDeLaBase(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

const hostBase = hostDeLaBase(process.env.DATABASE_URL);
const baseEsLocal = HOSTS_DE_BASE_LOCAL.includes(hostBase || "");
const emisionLocalPermitida = process.env.SIIGO_ALLOW_LOCAL_EMISION === "true";

siigo.emisionBloqueada = !siigo.dryRun && baseEsLocal && !emisionLocalPermitida;
siigo.motivoBloqueo = siigo.emisionBloqueada
  ? `La base de datos es local (${hostBase}) y SIIGO_DRY_RUN esta en false: eso emitiria ` +
    `facturas reales en la cuenta ${siigo.username || "(sin usuario)"} a partir de datos de ` +
    `prueba, y una factura electronica solo se revierte con nota credito. Deja ` +
    `SIIGO_DRY_RUN en true, o pon SIIGO_ALLOW_LOCAL_EMISION=true si de verdad queres ` +
    `emitir desde aca (por ejemplo contra la sandbox).`
  : null;

if (siigo.emisionBloqueada) {
  console.warn(`Siigo: emision BLOQUEADA. ${siigo.motivoBloqueo}`);
} else if (!siigo.dryRun && baseEsLocal) {
  console.warn(
    `Siigo: emision habilitada desde una base local (${hostBase}) por ` +
      `SIIGO_ALLOW_LOCAL_EMISION. Las facturas se van a crear de verdad en ` +
      `${siigo.username || "(sin usuario)"}.`,
  );
}

// El secreto firma los JWT: con un valor por defecto conocido (estaba en este archivo y en
// .env.example) cualquiera puede fabricar un token de admin. Sin secreto el backend no
// arranca, en vez de arrancar con uno que todo el mundo conoce.
const JWT_SECRETOS_DE_EJEMPLO = [
  "itea-jwt-secret-change-in-production",
  "your-secret-key-change-in-production",
];
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET no está definido. Sin él no se pueden firmar ni verificar tokens.",
  );
}
if (JWT_SECRETOS_DE_EJEMPLO.includes(process.env.JWT_SECRET)) {
  const msg =
    "JWT_SECRET tiene el valor de ejemplo de .env.example: cualquiera puede fabricar tokens.";
  // Solo se aborta en produccion: el .env local que sale de copiar .env.example lo trae.
  if (process.env.NODE_ENV === "production") throw new Error(msg);
  console.warn(`Advertencia: ${msg}`);
}

const env = {
  port: parseInt(process.env.PORT, 10) || 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: "1d",
  jwtRememberExpiresIn: "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  nodeEnv: process.env.NODE_ENV || "development",
  siigo,
};

module.exports = env;
