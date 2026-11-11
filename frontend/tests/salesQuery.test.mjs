import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { buildSalesParams, lastPage, resolvePageState, creditPanelState } = await cargarTs('utils/salesQuery.ts');

const noFilters = { search: '', status: 'all', startDate: '', endDate: '' };

test('sin filtros pide la página, ordenada de la más nueva a la más vieja', () => {
  assert.deepEqual(buildSalesParams(noFilters, 3), { page: 3, perPage: 10, sortBy: 'id', sortOrder: 'desc' });
});

test('la búsqueda va sin espacios sobrantes', () => {
  assert.equal(buildSalesParams({ ...noFilters, search: '  garcia ' }, 1).search, 'garcia');
});

test('una búsqueda vacía no se manda', () => {
  assert.equal('search' in buildSalesParams({ ...noFilters, search: '   ' }, 1), false);
});

test('"todos los estados" no se manda como filtro', () => {
  assert.equal('status' in buildSalesParams(noFilters, 1), false);
  assert.equal(buildSalesParams({ ...noFilters, status: 'abonado' }, 1).status, 'abonado');
});

// El dia del filtro es el de Colombia, como lo muestra la tabla (formatDate). Antes "Desde" se
// leia en UTC (desde el 10 incluia el 9 desde las 19:00) y "Hasta" en la hora del navegador.
// El proceso corre en otra zona para probar que no depende del navegador.
test('las fechas son el día completo en hora de Colombia, sin importar la zona del navegador', () => {
  const tz = process.env.TZ;
  process.env.TZ = 'Europe/Madrid';
  try {
    const params = buildSalesParams({ ...noFilters, startDate: '2026-11-10', endDate: '2026-11-10' }, 1);
    assert.equal(new Date(params.dateFrom).toISOString(), '2026-11-10T05:00:00.000Z');
    assert.equal(new Date(params.dateTo).toISOString(), '2026-11-11T04:59:59.999Z');
  } finally {
    process.env.TZ = tz;
  }
});

test('acepta otro tamaño de página', () => {
  assert.equal(buildSalesParams(noFilters, 1, 5000).perPage, 5000);
});

// Si la unica venta de la ultima pagina sale del filtro, la pagina queda vacia: la tabla tiene
// que pasar a la nueva ultima (auditoria de la paginacion).
test('la última página sale del total y nunca es menor que 1', () => {
  assert.equal(lastPage(0, 10), 1);
  assert.equal(lastPage(161, 10), 17);
  assert.equal(lastPage(160, 10), 16);
  assert.equal(lastPage(1, 10), 1);
});

// La pagina de Ventas (Sales.tsx). Antes vivia dentro del componente, sin pruebas, y la auditoria
// encontro dos regresiones: la pagina que reaparecia y la pagina huerfana.
const done = (count, total) => ({ loading: false, failed: false, count, total });

test('un filtro nuevo lleva a la página 1', () => {
  const state = { filtersKey: 'A', page: 3 };
  assert.deepEqual(resolvePageState(state, 'B', done(10, 50), 10), { filtersKey: 'B', page: 1 });
});

test('volver al filtro anterior no revive su página', () => {
  let state = { filtersKey: 'A', page: 3 };
  state = resolvePageState(state, 'B', done(10, 50), 10);
  state = resolvePageState(state, 'A', done(10, 50), 10);
  assert.deepEqual(state, { filtersKey: 'A', page: 1 });
});

test('una página que quedó vacía pasa a la última que existe', () => {
  const state = { filtersKey: 'A', page: 17 };
  assert.deepEqual(resolvePageState(state, 'A', done(0, 160), 10), { filtersKey: 'A', page: 16 });
});

test('sin cambios devuelve el mismo estado, para no volver a renderizar', () => {
  const state = { filtersKey: 'A', page: 2 };
  assert.equal(resolvePageState(state, 'A', done(10, 50), 10), state);
});

test('mientras carga, si falló o si no hay ventas, la página no se mueve', () => {
  const state = { filtersKey: 'A', page: 17 };
  assert.equal(resolvePageState(state, 'A', { loading: true, failed: false, count: 0, total: 160 }, 10), state);
  assert.equal(resolvePageState(state, 'A', { loading: false, failed: true, count: 0, total: 0 }, 10), state);
  assert.equal(resolvePageState(state, 'A', done(0, 0), 10), state);
});

// El panel de creditos: esqueleto solo la primera vez; despues sigue visible con las cifras
// anteriores mientras recarga, y con una alerta si la recarga falla (decisiones del usuario).
test('el panel de créditos muestra el esqueleto solo antes del primer resultado', () => {
  assert.equal(creditPanelState({ lastSales: null, failed: false }), 'skeleton');
  assert.equal(creditPanelState({ lastSales: null, failed: true }), 'error');
});

test('con un resultado anterior el panel sigue visible, y avisa si la recarga falló', () => {
  assert.equal(creditPanelState({ lastSales: [], failed: false }), 'panel');
  assert.equal(creditPanelState({ lastSales: [], failed: true }), 'stale');
});
