// Catalogo unico de permisos. Es la unica definicion de que acciones existen: authorize.js
// valida contra el, el endpoint de roles no guarda nada que no este aca, el admin sale de
// aca, y el panel se dibuja desde GET /roles/catalogo.
//
// Antes la misma estructura estaba copiada en cuatro lugares (MODULE_ACTIONS,
// ADMIN_PERMISSIONS y normalizarValor en el backend; RolePermissions y su lectura en el
// frontend) que ya no coincidian: el panel no mostraba "anular", y un `sales.edit = 'true'`
// se leia como "Todas" en el frontend y como "Propias" en el backend.
//
// Tipos: `alcance` guarda 'all' | 'own' | 'none'; `sino` guarda 'true' | 'false'.
// `heredaDe` solo lo usa la migracion de datos (db-manual/agregar_permisos_por_accion).
// Diseno: docs/designs/permisos-por-rol-2026-10.md.

const CATALOGO = {
  sales: {
    etiqueta: 'Ventas',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      pay: { etiqueta: 'Registrar y borrar pagos', tipo: 'alcance', heredaDe: 'sales.edit' },
      invoice: { etiqueta: 'Facturar en Siigo', tipo: 'alcance', heredaDe: 'sales.edit' },
      // Era `sales.delete`: anular no borra nada (invariante 5, vocabulario).
      void: { etiqueta: 'Anular', tipo: 'alcance', heredaDe: 'sales.delete' },
      review: { etiqueta: 'Marcar revisada', tipo: 'alcance', heredaDe: 'sales.edit' },
    },
  },
  clients: {
    etiqueta: 'Clientes',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      edit: { etiqueta: 'Editar', tipo: 'alcance' },
      toggle: { etiqueta: 'Activar/Desactivar', tipo: 'alcance', heredaDe: 'clients.edit' },
    },
  },
  responsables: {
    etiqueta: 'Responsables',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      edit: { etiqueta: 'Editar', tipo: 'alcance' },
      toggle: { etiqueta: 'Desactivar', tipo: 'alcance', heredaDe: 'responsables.delete' },
      delete: { etiqueta: 'Eliminar', tipo: 'alcance', heredaDe: 'responsables.delete' },
    },
  },
  itineraries: {
    etiqueta: 'Itinerarios',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      edit: { etiqueta: 'Editar check-in', tipo: 'alcance' },
    },
  },
  commissions: {
    etiqueta: 'Comisionistas',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      edit: { etiqueta: 'Editar', tipo: 'alcance' },
      delete: { etiqueta: 'Eliminar', tipo: 'alcance' },
      settle: { etiqueta: 'Liquidar', tipo: 'alcance', heredaDe: 'commissions.create' },
    },
  },
  dashboard: {
    etiqueta: 'Dashboard',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
    },
  },
  users: {
    etiqueta: 'Usuarios',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'alcance' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      edit: { etiqueta: 'Editar', tipo: 'alcance' },
      toggle: { etiqueta: 'Desactivar', tipo: 'alcance' },
      delete: { etiqueta: 'Eliminar', tipo: 'alcance' },
    },
  },
  config: {
    etiqueta: 'Gestión Interna',
    acciones: {
      view: { etiqueta: 'Ver', tipo: 'sino' },
      create: { etiqueta: 'Crear', tipo: 'sino' },
      edit: { etiqueta: 'Editar', tipo: 'sino' },
      delete: { etiqueta: 'Eliminar', tipo: 'sino', heredaDe: 'config.edit' },
    },
  },
};

const definicion = (modulo, accion) => CATALOGO[modulo]?.acciones?.[accion] || null;

function existeAccion(modulo, accion) {
  return definicion(modulo, accion) !== null;
}

/**
 * Valor efectivo de una fila de `permisos_rol`: 'all' | 'own' | 'none' para alcance,
 * true | false para si/no. Una accion fuera del catalogo no vale nada.
 *
 * 'true' en una accion con alcance viene de filas anteriores al catalogo y se lee como se
 * leia antes, para que nadie gane ni pierda nada. Solo el `edit` de los modulos que ya
 * tenian alcance lo leia como 'own' (lo mas restrictivo que seguia dejando editar); en el
 * resto era un si/no que valia sobre cualquier registro, o sea 'all'. Las filas que
 * escribe el catalogo ya guardan 'all'/'own'/'none'.
 */
const EDIT_CON_ALCANCE_ANTES = ['sales', 'clients', 'responsables', 'itineraries'];

function leerValor(modulo, accion, valor) {
  const def = definicion(modulo, accion);
  if (!def) return null;
  const v = valor === true ? 'true' : valor === false ? 'false' : valor;
  if (def.tipo === 'sino') return v === 'true';
  if (v === 'all' || v === 'own' || v === 'none') return v;
  if (v === 'true') return accion === 'edit' && EDIT_CON_ALCANCE_ANTES.includes(modulo) ? 'own' : 'all';
  return 'none';
}

/**
 * Los permisos de un usuario como mapa { modulo: { accion: valor } }, con TODAS las
 * acciones del catalogo. Sin fila no hay permiso. El admin tiene todo.
 * `user.permisosRol` es la lista [{ modulo, accion, valor }] que arma auth.js.
 */
function permisosEfectivos(user) {
  const esAdmin = user?.role === 'admin';
  const mapa = {};
  for (const [modulo, { acciones }] of Object.entries(CATALOGO)) {
    mapa[modulo] = {};
    for (const [accion, def] of Object.entries(acciones)) {
      if (esAdmin) mapa[modulo][accion] = def.tipo === 'sino' ? true : 'all';
      else mapa[modulo][accion] = def.tipo === 'sino' ? false : 'none';
    }
  }
  if (esAdmin) return mapa;
  for (const fila of user?.permisosRol || []) {
    const valor = leerValor(fila.modulo, fila.accion, fila.valor);
    if (valor !== null) mapa[fila.modulo][fila.accion] = valor;
  }
  return mapa;
}

/** 'all' | 'own' | false. Un si/no concedido cuenta como 'all'. */
function alcanceDe(mapa, modulo, accion) {
  const v = mapa[modulo]?.[accion];
  if (v === true || v === 'all') return 'all';
  if (v === 'own') return 'own';
  return false;
}

/** El catalogo como lista, para el panel. Sin valores de ningun rol. */
function catalogoParaPanel() {
  return Object.entries(CATALOGO).map(([modulo, { etiqueta, acciones }]) => ({
    modulo,
    etiqueta,
    acciones: Object.entries(acciones).map(([accion, def]) => ({
      accion,
      etiqueta: def.etiqueta,
      tipo: def.tipo,
    })),
  }));
}

module.exports = { CATALOGO, existeAccion, leerValor, permisosEfectivos, alcanceDe, catalogoParaPanel };
