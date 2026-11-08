// Quien puede figurar como asesor de una venta: un usuario activo, no eliminado y con su
// persona viva (el mismo criterio del listado de usuarios). La lista del asistente y la
// validacion de POST /sales usan este mismo filtro, para que no se pueda elegir a alguien
// que el servidor despues rechaza ni guardar a alguien que la lista no ofrece.
const ASESOR_ACTIVO = { status: 'active', deletedAt: null, persona: { deletedAt: null } };

module.exports = { ASESOR_ACTIVO };
