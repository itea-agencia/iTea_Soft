// Como se lee el `valor` guardado en permisos_rol. Una sola definicion: authorize.js (lo que
// se aplica) y roles.controller.js (lo que muestra la pantalla de roles) tenian cada uno su
// copia, y podian diverger: un `sales.edit = 'own'` se leia como false en una y como 'own' en
// la otra.

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
