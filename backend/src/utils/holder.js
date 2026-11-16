/**
 * El titular de una lista de pasajeros: un booleano por fila, true solo en el primero
 * marcado con `esTitular === true` o, si nadie lo esta, en el primero de la lista.
 *
 * Antes `create` guardaba `esTitular: p.esTitular ?? true`. Tours y seguros no tenian el
 * radio de titular y mandaban los pasajeros sin el dato, asi que todos quedaban titulares
 * (un tour del 2026-11-07 en produccion). El frontend publicado antes del radio sigue sin
 * mandarlo: por eso la regla vive en el servidor. Spec datos-por-pasajero, "Un solo titular".
 */
function markHolder(rows) {
  const marked = rows.findIndex(r => r?.esTitular === true);
  const holder = marked === -1 ? 0 : marked;
  return rows.map((_, i) => i === holder);
}

module.exports = { markHolder };
