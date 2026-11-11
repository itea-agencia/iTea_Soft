import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { isAccessDenied, loadErrorMessage, withLoadFailure, withoutLoadFailure } = await cargarTs('utils/loadFailures.ts');

// Hallazgo 9: el aviso guardaba un solo mensaje y no se quitaba nunca.
test('sin fallos no hay aviso', () => {
  assert.equal(loadErrorMessage([]), null);
});

test('el aviso nombra todo lo que falló', () => {
  const message = loadErrorMessage(['las ventas', 'los clientes']);
  assert.match(message, /las ventas y los clientes/);
});

test('un mismo recurso no se repite', () => {
  assert.deepEqual(withLoadFailure(['las ventas'], 'las ventas'), ['las ventas']);
});

test('recuperar un recurso no borra el fallo de otro', () => {
  assert.deepEqual(withoutLoadFailure(['las ventas', 'los clientes'], 'las ventas'), ['los clientes']);
});

test('sin cambios devuelve la misma lista, para no provocar un render', () => {
  const failures = ['las ventas'];
  assert.equal(withLoadFailure(failures, 'las ventas'), failures);
  assert.equal(withoutLoadFailure(failures, 'los clientes'), failures);
});

test('401 y 403 son falta de acceso, no fallos de carga', () => {
  assert.equal(isAccessDenied({ response: { status: 401 } }), true);
  assert.equal(isAccessDenied({ response: { status: 403 } }), true);
  assert.equal(isAccessDenied({ response: { status: 500 } }), false);
  assert.equal(isAccessDenied(new Error('Network Error')), false);
});
