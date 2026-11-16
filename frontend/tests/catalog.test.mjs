import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

// Regla de backend/src/utils/catalog.js: un valor de catálogo que no existe no se pierde.
// Diseño catalogo-sin-perdida-silenciosa-2026-11.
const require = createRequire(import.meta.url);
const { buildIndex, findId, planMatchesAirline, resolveSupplierPayment } = require('../../backend/src/utils/catalog.js');

const suppliers = buildIndex([
  { id: 1, keys: ['VIAJES COLOMBIA ONLINE'] },
  { id: 5, keys: ['CLIC KIU'] },
  { id: 8, keys: ['AVIANCA '] },
]);

test('un valor vacío es "sin dato", no un error', () => {
  for (const v of [undefined, null, '', '   ']) assert.equal(findId(suppliers, v), null);
});

test('encuentra el nombre aunque cambien mayúsculas o espacios', () => {
  assert.equal(findId(suppliers, 'CLIC KIU'), 5);
  assert.equal(findId(suppliers, ' clic  kiu '), 5);
  assert.equal(findId(suppliers, 'avianca'), 8);
});

test('un id solo vale si es un entero completo que existe', () => {
  assert.equal(findId(suppliers, 5), 5);
  assert.equal(findId(suppliers, '5'), 5);
  assert.equal(findId(suppliers, 99), undefined);
  assert.equal(findId(suppliers, '123 Viajes'), undefined);
  assert.equal(findId(suppliers, 5.5), undefined);
});

test('un nombre que no existe no se encuentra', () => {
  assert.equal(findId(suppliers, 'Proveedor Nuevo'), undefined);
});

test('una clave repetida con ids distintos es ambigua', () => {
  const plans = buildIndex([
    { id: 37, keys: ['AVIANCA - Classic', 'Classic'] },
    { id: 50, keys: ['Copa Airlines - Classic', 'Classic'] },
  ]);
  assert.equal(findId(plans, 'AVIANCA - Classic'), 37);
  assert.equal(findId(plans, 'Classic'), undefined);
});

test('una fila sin id no se indexa (tarjeta de agencia sin método de pago)', () => {
  const methods = buildIndex([{ id: 1, keys: ['Efectivo'] }, { id: null, keys: ['Tarjeta Huerfana'] }]);
  assert.equal(findId(methods, 'Tarjeta Huerfana'), undefined);
  assert.equal(findId(methods, 'efectivo'), 1);
});

test('el plan de equipaje tiene que ser de la aerolínea, si hay con qué comparar', () => {
  const catalog = { planAirline: new Map([[37, 1], [50, 3]]) };
  assert.equal(planMatchesAirline(catalog, 37, 1), true);
  assert.equal(planMatchesAirline(catalog, 37, 3), false);
  assert.equal(planMatchesAirline(catalog, null, 3), true);
  assert.equal(planMatchesAirline(catalog, 50, null), true);
});

// Diseño catalogo-por-id-2026-11: se guarda la tarjeta y el método se deduce de ella.
const payCatalog = {
  agencyCards: buildIndex([{ id: 1, keys: ['Samtur Bancolombia Negocios'] }, { id: 2, keys: ['PRECOMPRAS CLIC AIR'] }]),
  paymentMethods: buildIndex([{ id: 2, keys: ['Transferencia'] }, { id: 13, keys: ['Tarjeta de Débito'] }]),
};

test('pago al proveedor por id de tarjeta: guarda la tarjeta y no el método', () => {
  assert.deepEqual(resolveSupplierPayment(payCatalog, { cardId: 2 }), { tarjetaAgenciaId: 2, metodoPagoProveedorId: null });
  assert.deepEqual(resolveSupplierPayment(payCatalog, { cardId: '1', legacyName: 'Transferencia' }), { tarjetaAgenciaId: 1, metodoPagoProveedorId: null });
});

test('respaldo por nombre: primero tarjeta, después método sin tarjeta', () => {
  assert.deepEqual(resolveSupplierPayment(payCatalog, { legacyName: 'samtur bancolombia negocios' }), { tarjetaAgenciaId: 1, metodoPagoProveedorId: null });
  assert.deepEqual(resolveSupplierPayment(payCatalog, { legacyName: 'Transferencia' }), { tarjetaAgenciaId: null, metodoPagoProveedorId: 2 });
});

test('pago al proveedor vacío es sin dato; lo que no existe es undefined', () => {
  assert.equal(resolveSupplierPayment(payCatalog, {}), null);
  assert.equal(resolveSupplierPayment(payCatalog, { cardId: '', legacyName: '' }), null);
  assert.equal(resolveSupplierPayment(payCatalog, { cardId: 99 }), undefined);
  assert.equal(resolveSupplierPayment(payCatalog, { legacyName: 'Bitcoin' }), undefined);
});
