const prisma = require('../config/db');
const { error } = require('../utils/apiResponse');
const { getEffectivePermissions, getActionScope } = require('./authorize');

// Guarda de propietario para toda ruta que cuelga de una venta (`:id` o `:saleId`).
//
// `authorize` solo dice si el usuario puede hacer la accion EN GENERAL. El alcance `own`
// solo se aplicaba al listado de ventas: getById, update, anular, pagos, factura y todos
// los productos aceptaban cualquier id, asi que un asesor con `sales.edit = own` editaba,
// anulaba y facturaba ventas de otros con solo cambiar el numero en la URL.
//
// Va DESPUES de `authorize`. Decide con el alcance de vista en las lecturas y el de edicion
// en todo lo demas, y no con el de la accion concreta: `sales.create` y `sales.delete` son
// booleanos y siempre darian 'all', lo que dejaria a un usuario que solo puede editar lo
// suyo agregar productos a una venta ajena. Sin permiso de edicion se trata como 'own'.
async function ventaPropia(req, res, next) {
  try {
    const { permissions } = getEffectivePermissions(req.user);
    const accion = req.method === 'GET' ? 'view' : 'edit';
    if (getActionScope(permissions, 'sales', accion) === 'all') return next();

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
