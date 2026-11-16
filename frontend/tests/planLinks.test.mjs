import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { planLinkIndex } = require('../../backend/src/utils/planLinks.js');

test('sin vínculo devuelve null, también cuando no hay paquetes', () => {
  for (const value of [undefined, null, '']) {
    assert.equal(planLinkIndex(value, 0), null);
  }
});

test('conserva el índice cero y acepta números o texto numérico', () => {
  for (const [value, expected] of [[0, 0], ['0', 0], [1, 1], ['1', 1]]) {
    assert.equal(planLinkIndex(value, 2), expected);
  }
});

test('rechaza índices fuera de rango y conversiones que podrían elegir otro paquete', () => {
  for (const value of [-1, 2, 0.5, 'no', false, true, ' ', [], {}, Infinity, NaN, Symbol(), 0n]) {
    assert.throws(() => planLinkIndex(value, 2), {
      statusCode: 400, code: 'VALIDATION_ERROR',
    });
  }
  assert.throws(() => planLinkIndex(0, 0), { statusCode: 400, code: 'VALIDATION_ERROR' });
});
