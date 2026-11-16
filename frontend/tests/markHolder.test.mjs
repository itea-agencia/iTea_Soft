import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

// Regla del backend (backend/src/utils/holder.js): un titular por producto, el primero
// marcado o, si nadie, el primero. Diseño titular-por-producto-2026-11.
const require = createRequire(import.meta.url);
const { markHolder } = require('../../backend/src/utils/holder.js');

test('nadie marcado: titular el primero (frontend viejo de tours y seguros)', () => {
  assert.deepEqual(markHolder([{}, {}, {}]), [true, false, false]);
});

test('marcado uno que no es el primero', () => {
  assert.deepEqual(markHolder([{ esTitular: false }, { esTitular: true }]), [false, true]);
});

test('varios marcados: se queda el primero marcado', () => {
  assert.deepEqual(markHolder([{}, { esTitular: true }, { esTitular: true }]), [false, true, false]);
});

test('un solo pasajero con false explicito sigue siendo titular', () => {
  assert.deepEqual(markHolder([{ esTitular: false }]), [true]);
});

test('solo true booleano cuenta como marcado', () => {
  assert.deepEqual(markHolder([{}, { esTitular: 'true' }, { esTitular: 1 }]), [true, false, false]);
});

test('lista vacia', () => {
  assert.deepEqual(markHolder([]), []);
});
