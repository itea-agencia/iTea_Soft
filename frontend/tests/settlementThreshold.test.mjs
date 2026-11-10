import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { settlementThreshold } = await cargarTs('utils/creditUtils.ts');

// Hallazgo 5: el directorio usaba 50.000 fijos y el detalle el umbral del comisionista. Regla
// confirmada por el usuario el 2026-11-10: el propio si es mayor que 0, si no 50.000.
test('usa el umbral propio cuando es mayor que cero', () => {
  assert.equal(settlementThreshold({ paymentThreshold: 120000 }), 120000);
});

test('sin umbral propio, o con cero, usa 50.000', () => {
  assert.equal(settlementThreshold({ paymentThreshold: 0 }), 50000);
  assert.equal(settlementThreshold({ paymentThreshold: null }), 50000);
  assert.equal(settlementThreshold({}), 50000);
});
