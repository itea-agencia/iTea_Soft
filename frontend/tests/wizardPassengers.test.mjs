import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bundleTs } from './bundleTs.mjs';

const { validateWizardStep } = await bundleTs('components/sales/wizardValidation.ts');

// Todo pasajero de una venta tiene nombre (dos palabras), tipo del catalogo y documento.
// Diseño pasajeros-con-documento-2026-11. El error de pasajero sale antes que el resto del
// formulario de la categoria, asi que alcanza con productos minimos.
const data = { clients: [], commissionAgentsForSale: [], config: { documentTypes: [{ abreviatura: 'CC' }, { abreviatura: 'T.I' }] } };
const ana = { name: 'Ana Pérez', docType: 'CC', docNumber: '1234567' };
const validate = (form) => validateWizardStep(2, form, data, []);

test('hotel: un huesped sin documento no deja avanzar', () => {
  const r = validate({ selectedProducts: ['hoteleria'], hotels: [{ guests: [ana, { ...ana, docNumber: '' }] }] });
  assert.match(r.message ?? '', /Hotelería #1, pasajero 2: El número de documento es obligatorio/);
});

test('tiquete: una fila de pasajero vacia no deja avanzar', () => {
  const r = validate({ selectedProducts: ['tiqueteria'], tickets: [{ passengers: [ana, { name: '', docType: '', docNumber: '' }] }] });
  assert.match(r.message ?? '', /Tiquetería #1, pasajero 2: Faltan el nombre y el documento/);
});

test('SIM: un tipo que no esta en el catalogo no deja avanzar', () => {
  const r = validate({ selectedProducts: ['simcard'], simCards: [{ passengerName: 'Ana Pérez', docType: 'TI', docNumber: '1234567' }] });
  assert.match(r.message ?? '', /SIM Card #1: El tipo de documento TI no existe/);
});

test('plan: un integrante con una sola palabra no deja avanzar', () => {
  const r = validate({ selectedProducts: ['planes'], plans: [{ guests: [ana, { ...ana, name: 'Beto', docNumber: '7654321' }] }] });
  assert.match(r.message ?? '', /Paquete #1, pasajero 2: Escriba nombre y apellido/);
});

test('visa: usa el nombre completo del formulario', () => {
  const r = validate({ selectedProducts: ['visa'], visas: [{ fullName: 'Ana', docType: 'CC', docNumber: '1234567' }] });
  assert.match(r.message ?? '', /Visa #1: Escriba nombre y apellido/);
});

test('pasajeros completos: no hay error de pasajero', () => {
  const r = validate({ selectedProducts: ['hoteleria'], hotels: [{ guests: [ana, { ...ana, docNumber: '7654321' }] }] });
  assert.doesNotMatch(r.message ?? '', /pasajero/);
});

test('hotel: dos huespedes con el mismo documento no dejan avanzar', () => {
  const r = validate({ selectedProducts: ['hoteleria'], hotels: [{ guests: [ana, { ...ana, name: 'Beto Gómez' }] }] });
  assert.match(r.message ?? '', /Hotelería #1: los pasajeros 1 y 2 tienen el mismo documento/);
});

test('tiquete: una fila vacia no hereda los datos del producto', () => {
  const r = validate({ selectedProducts: ['tiqueteria'], tickets: [{ passengerName: 'Ana Pérez', docType: 'CC', docNumber: '1234567', passengers: [{}, {}] }] });
  assert.match(r.message ?? '', /Tiquetería #1, pasajero 1: Faltan el nombre y el documento/);
});
