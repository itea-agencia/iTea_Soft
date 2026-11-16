import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

// Regla de backend/src/utils/catalog.js: un valor de catálogo que no existe no se pierde.
// Diseño catalogo-sin-perdida-silenciosa-2026-11.
const require = createRequire(import.meta.url);
const { buildIndex, findId } = require('../../backend/src/utils/catalog.js');

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
