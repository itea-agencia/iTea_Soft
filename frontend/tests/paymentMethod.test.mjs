import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cargarTs } from './cargarTs.mjs';

const { paymentMethodLabel } = await cargarTs('utils/paymentMethod.ts');

test('un abono con otro metodo vuelve mixta la venta aunque el principal guardado diga otra cosa', () => {
  const sale = { paymentMethod: 'Efectivo', payments: [{ method: 'Efectivo' }, { method: 'Transferencia' }] };
  assert.equal(paymentMethodLabel(sale), 'Mixto');
});

test('dos pagos con el mismo metodo no son mixtos', () => {
  const sale = { paymentMethod: null, payments: [{ method: 'Transferencia' }, { method: 'Transferencia' }] };
  assert.equal(paymentMethodLabel(sale), 'Transferencia');
});

test('sin pagos se usa el principal guardado, y sin nada un guion', () => {
  assert.equal(paymentMethodLabel({ paymentMethod: 'Tarjeta', payments: [] }), 'Tarjeta');
  assert.equal(paymentMethodLabel({}), '—');
});

test('un credito sin abonos dice Credito, no un guion', () => {
  assert.equal(paymentMethodLabel({ status: 'credito', payments: [] }), 'Crédito');
});

test('un pago sin metodo no cuenta como un metodo distinto', () => {
  assert.equal(paymentMethodLabel({ payments: [{ method: 'Efectivo' }, { method: null }] }), 'Efectivo');
});
