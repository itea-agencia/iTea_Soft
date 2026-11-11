import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { voucherFileProblem } = await cargarTs('utils/voucherFiles.ts');
const { saleAttachmentsError } = await cargarTs('utils/voucherDelivery.ts');

const MB = 1024 * 1024;
// base64 pesa 4/3 del archivo: este texto representa un archivo de `mb` megas.
const fileOf = (mb) => ({ name: 'a.pdf', base64: 'A'.repeat(Math.ceil((mb * MB * 4) / 3)) });

// Hallazgo 13: se anunciaba un maximo de 10 MB sin comprobarlo.
test('acepta un archivo permitido dentro del límite', () => {
  assert.equal(voucherFileProblem({ name: 'voucher.PDF', size: 10 * MB }), null);
  assert.equal(voucherFileProblem({ name: 'foto.jpeg', size: 1 }), null);
  assert.equal(voucherFileProblem({ name: 'carta.docx', size: 1 }), null);
});

test('rechaza un archivo de más de 10 MB y lo nombra', () => {
  assert.match(voucherFileProblem({ name: 'foto.png', size: 10 * MB + 1 }), /foto\.png.*10 MB/);
});

test('rechaza un tipo no permitido y lo nombra', () => {
  assert.match(voucherFileProblem({ name: 'virus.exe', size: 1 }), /virus\.exe/);
});

test('una venta dentro del total no da error', () => {
  assert.equal(saleAttachmentsError({ tours: [{ vouchers: [fileOf(10), fileOf(10)] }], visas: [{ voucher: fileOf(10) }] }), null);
});

test('suma los adjuntos aunque no estén marcados para enviar', () => {
  const form = { tours: [{ sendVoucher: false, vouchers: [fileOf(10), fileOf(10), fileOf(10)] }], visas: [{ voucher: fileOf(10) }] };
  assert.match(saleAttachmentsError(form), /40 MB.*37 MB/);
});
