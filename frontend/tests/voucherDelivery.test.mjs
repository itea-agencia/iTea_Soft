import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { pendingVoucherWarnings, saleSuccessMessage, vouchersSentText } = await cargarTs('utils/voucherDelivery.ts');

const file = { name: 'a.pdf', base64: 'data:application/pdf;base64,AAAA' };

// Hallazgo 10: el mensaje decia "vouchers enviados" sin saber si se habian enviado.
test('sin vouchers enviados no afirma ningún envío', () => {
  assert.equal(saleSuccessMessage({ sent: [], failed: [] }, 'a@b.co'), 'Venta registrada exitosamente');
  assert.equal(saleSuccessMessage(undefined, 'a@b.co'), 'Venta registrada exitosamente');
});

test('dice cuántos vouchers salieron y a qué correo', () => {
  assert.equal(saleSuccessMessage({ sent: ['Tours'], failed: [] }, 'a@b.co'), 'Venta registrada. 1 voucher enviado a a@b.co');
  assert.equal(vouchersSentText(2, 'a@b.co'), '2 vouchers enviados a a@b.co');
  assert.equal(vouchersSentText(0, 'a@b.co'), null);
});

test('no advierte si nada está marcado', () => {
  assert.deepEqual(pendingVoucherWarnings({ tours: [{ sendVoucher: false }] }, undefined), []);
});

test('advierte si el cliente no tiene correo', () => {
  assert.deepEqual(pendingVoucherWarnings({ tours: [{ sendVoucher: true, vouchers: [file] }] }, ''), [
    { label: 'Tours', reason: 'El cliente no tiene correo' },
  ]);
});

test('advierte si un voucher marcado no tiene archivo', () => {
  assert.deepEqual(pendingVoucherWarnings({ visas: [{ sendVoucher: true }] }, 'a@b.co'), [
    { label: 'Visa', reason: 'No tiene archivo' },
  ]);
});

test('con archivo y correo no hay advertencia', () => {
  assert.deepEqual(pendingVoucherWarnings({ visas: [{ sendVoucher: true, voucher: file }] }, 'a@b.co'), []);
});

test('numera por su posición cuando hay varios productos iguales', () => {
  const tours = [{ sendVoucher: false }, { sendVoucher: true }];
  assert.deepEqual(pendingVoucherWarnings({ tours }, 'a@b.co'), [{ label: 'Tours 2', reason: 'No tiene archivo' }]);
});
