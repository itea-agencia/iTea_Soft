import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { buildSalesParams } = await cargarTs('utils/salesQuery.ts');

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

test('las fechas cubren el mismo rango que el filtro de la pantalla', () => {
  const params = buildSalesParams({ ...noFilters, startDate: '2026-11-01', endDate: '2026-11-30' }, 1);
  assert.equal(params.dateFrom, new Date('2026-11-01').toISOString());
  assert.equal(params.dateTo, new Date('2026-11-30T23:59:59').toISOString());
});

test('acepta otro tamaño de página', () => {
  assert.equal(buildSalesParams(noFilters, 1, 5000).perPage, 5000);
});
