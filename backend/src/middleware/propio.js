const prisma = require('../config/db');
const { error } = require('../utils/apiResponse');

// Guarda de propietario para las rutas que actuan sobre un registro (`:id`, o `:saleId` en
// los pagos). Reemplaza a `ventaPropia`, que era lo mismo solo para ventas.
//
// `authorize` solo dice si el usuario puede hacer la accion EN GENERAL. Con alcance `own`
// eso no basta: un asesor con permiso para editar *sus* ventas editaba, anulaba y facturaba
// las de cualquier otro con solo cambiar el numero en la URL. Y fuera de ventas el alcance
// `own` no se aplicaba en ningun lado: la ficha y la edicion de clientes y responsables
// aceptaban cualquier id.
//
// Va DESPUES de `authorize` y decide con el alcance de la accion de esa ruta, que authorize
// deja en `req.permissionScope`. El duenio de cada recurso es quien hizo la venta o quien
// creo el registro; un registro sin duenio (creado antes de que se guardara) solo lo
// alcanza quien tenga "Todos". Diseno: docs/designs/permisos-por-rol-2026-10.md.
const RECURSOS = {
  venta: { modelo: 'ventas', campo: 'usuarioId', noEncontrado: 'Venta no encontrada' },
  cliente: { modelo: 'clientes', campo: 'creadoPorId', noEncontrado: 'Cliente no encontrado' },
  responsable: { modelo: 'responsables', campo: 'creadoPorId', noEncontrado: 'Responsable no encontrado' },
  comisionista: { modelo: 'comisionistas', campo: 'creadoPorId', noEncontrado: 'Comisionista no encontrado' },
  usuario: { modelo: 'usuarios', campo: 'creadoPorId', noEncontrado: 'Usuario no encontrado' },
};

function propio(recurso) {
  const { modelo, campo, noEncontrado } = RECURSOS[recurso];
  return async (req, res, next) => {
    try {
      if (req.permissionScope === 'all') return next();

      const id = parseInt(req.params.id ?? req.params.saleId, 10);
      if (!Number.isInteger(id)) return next();

      const registro = await prisma[modelo].findUnique({ where: { id }, select: { [campo]: true } });
      // Si no existe, el controlador ya responde 404 con su mensaje.
      if (!registro) return next();

      if (registro[campo] !== req.user.id) {
        // 404 y no 403: no confirmar que el id existe y es de otro.
        return error(res, noEncontrado, 404);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = propio;
