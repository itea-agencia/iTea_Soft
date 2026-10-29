const { TipoHotel } = require('@prisma/client');

// El tipo de hotel que llega del formulario, validado contra el enum de la base. Sin esto, un
// valor que no existe ("hotel_turistico" antes de agregarlo, o "finca" en vez de "fincas")
// llegaba a Prisma y tiraba la venta entera con un 500 sin explicacion: el asesor no sabia que
// corregir. Ahora es un 400 que dice que valor fallo.
function tipoHotelDe(valor) {
  const tipo = valor || 'hotel';
  if (!Object.values(TipoHotel).includes(tipo)) {
    throw Object.assign(new Error(`Tipo de hotel no válido: "${tipo}"`), { statusCode: 400, code: 'VALIDATION_ERROR' });
  }
  return tipo;
}

module.exports = { tipoHotelDe };
