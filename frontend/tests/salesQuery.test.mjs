import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { buildSalesParams, lastPage } = await cargarTs('utils/salesQuery.ts');

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
