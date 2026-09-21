// Como se lee el `valor` guardado en permisos_rol / permisos_usuario. Una sola definicion:
// authorize.js (lo que se aplica), roles.controller.js (lo que muestra la pantalla de roles)
// y users.controller.js (lo que muestra el modal de un usuario) tenian cada uno su copia, y
// la de users.controller.js solo conocia tres modulos con vista jerarquica y trataba `edit`
// como booleano: un `sales.edit = 'own'` se mostraba como false, y guardar desde ese modal
// lo escribia como false.

// Vista y edicion son jerarquicas (all/own/none) solo en estos modulos; el resto es booleano.
const SCOPED_VIEW_MODULES = ['dashboard', 'sales', 'clients', 'responsables', 'itineraries'];
const SCOPED_EDIT_MODULES = ['sales', 'clients', 'responsables', 'itineraries'];

function normalizarValor(modulo, accion, valor) {
  if (accion === 'view' && SCOPED_VIEW_MODULES.includes(modulo)) {
    if (valor === 'all') return modulo === 'dashboard' ? 'own' : 'all';
    if (valor === 'own') return 'own';
    if (valor === 'true' || valor === true) return modulo === 'dashboard' ? 'own' : 'all';
    return 'none';
  }
  if (accion === 'edit' && SCOPED_EDIT_MODULES.includes(modulo)) {
    if (valor === 'all') return 'all';
    // 'true' viene de filas antiguas (seed, esquema por defecto): se lee como lo mas
    // restrictivo que sigue dejando editar.
    if (valor === 'own' || valor === 'true' || valor === true) return 'own';
    return 'none';
  }
  return valor === 'true' || valor === true;
}

module.exports = { SCOPED_VIEW_MODULES, SCOPED_EDIT_MODULES, normalizarValor };
