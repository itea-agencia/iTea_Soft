// La agencia opera en Colombia (UTC-5, sin horario de verano), pero el servidor corre en UTC
// (Render y Docker). Todo "hoy", dia o mes sacado de la hora del servidor cambia de dia a las
// 19:00 de Colombia: asi llegaron a Siigo 25 de 42 facturas con la fecha de manana.
// Diseno: docs/designs/hora-colombia-2026-11.md.
const ZONA_COLOMBIA = 'America/Bogota';

const formatoDia = new Intl.DateTimeFormat('fr-CA', {
  timeZone: ZONA_COLOMBIA, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** 'YYYY-MM-DD' del instante dado (por defecto, ahora) en hora de Colombia. */
function diaColombia(instante = new Date()) {
  return formatoDia.format(instante);
}

module.exports = { ZONA_COLOMBIA, diaColombia };
