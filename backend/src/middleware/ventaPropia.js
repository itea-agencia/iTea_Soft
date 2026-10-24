const prisma = require('../config/db');
const { error } = require('../utils/apiResponse');

// Guarda de propietario para toda ruta que cuelga de una venta (`:id` o `:saleId`).
//
// `authorize` solo dice si el usuario puede hacer la accion EN GENERAL. El alcance `own`
// solo se aplicaba al listado de ventas: getById, update, anular, pagos, factura y todos
// los productos aceptaban cualquier id, asi que un asesor con `sales.edit = own` editaba,
// anulaba y facturaba ventas de otros con solo cambiar el numero en la URL.
//
// Va DESPUES de `authorize` y decide con el alcance de la accion de esa ruta, que authorize
// deja en `req.permissionScope`. Antes decidia con el de `view` o `edit` segun el metodo,
// porque `sales.delete` era un si/no que siempre daba 'all'; desde el catalogo de permisos
// cada accion sobre una venta (pagar, facturar, anular, revisar) tiene su propio alcance.
async function ventaPropia(req, res, next) {
  try {
    if (req.permissionScope === 'all') return next();

    const id = parseInt(req.params.id ?? req.params.saleId, 10);
    if (!Number.isInteger(id)) return next();

    const venta = await prisma.ventas.findUnique({ where: { id }, select: { usuarioId: true } });
    // Si no existe, el controlador ya responde 404 con su mensaje.
    if (!venta) return next();

    if (venta.usuarioId !== req.user.id) {
      // 404 y no 403: no confirmar a un asesor que el id existe y es de otro.
      return error(res, 'Venta no encontrada', 404);
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = ventaPropia;
