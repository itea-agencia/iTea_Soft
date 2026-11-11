import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bundleTs } from './bundleTs.mjs';

const { validateWizardStep } = await bundleTs('components/sales/wizardValidation.ts');

const data = { clients: [{ id: 1 }], commissionAgentsForSale: [{ id: 5 }] };
const asesores = [{ id: 2 }];
const validStep1 = { clientId: '1', asesorId: '2' };
const validate = (step, form) => validateWizardStep(step, form, data, asesores);

// Hallazgo 16: fijan lo que el asistente valida hoy, antes de mover las reglas de archivo.
test('paso 1: el cliente es obligatorio', () => {
  assert.equal(validate(1, { ...validStep1, clientId: '' }).errors.clientId, 'El cliente es obligatorio');
});

test('paso 1: el cliente tiene que existir', () => {
  assert.equal(validate(1, { ...validStep1, clientId: '99' }).errors.clientId, 'Elija un cliente de la lista');
});

test('paso 1: el asesor tiene que ser de la lista', () => {
  assert.equal(validate(1, { ...validStep1, asesorId: '9' }).errors.asesorId, 'Elija un asesor de la lista');
});

test('paso 1: un comisionista escrito sin elegir se rechaza', () => {
  assert.equal(validate(1, { ...validStep1, commissionAgentName: 'Ana' }).errors.commissionAgent, 'El comisionista ingresado no está registrado');
});

test('paso 1: un comisionista que ya no existe se rechaza', () => {
  assert.equal(validate(1, { ...validStep1, commissionAgentId: '9' }).errors.commissionAgent, 'El comisionista seleccionado ya no existe en el sistema');
});

test('paso 1: con datos válidos no hay errores ni mensaje', () => {
  assert.deepEqual(validate(1, { ...validStep1, commissionAgentId: '5', commissionAgentName: 'Ana' }), { errors: {}, message: null });
});

test('paso 2: hay que seleccionar un producto', () => {
  assert.equal(validate(2, { selectedProducts: [] }).errors.products, 'Debes seleccionar al menos un producto');
});

test('paso 2: tiquetería sin tiquetes', () => {
  assert.equal(validate(2, { selectedProducts: ['tiqueteria'], tickets: [] }).errors.products, 'Debes configurar al menos un tiquete');
});

test('paso 2: un tiquete con reserva inválida da error y mensaje', () => {
  const result = validate(2, { selectedProducts: ['tiqueteria'], tickets: [{ airline: 'AV', supplier: 'X', reservationNumber: 'abc' }] });
  assert.equal(result.errors.tiqueteriaValidation, 'invalid');
  assert.match(result.message, /Tiquetería #1/);
});

test('paso 2: con dos servicios inválidos el mensaje es el último', () => {
  const result = validate(2, {
    selectedProducts: ['tiqueteria', 'hoteleria'],
    tickets: [{ airline: '' }],
    hotels: [{ hotelName: 'x' }],
  });
  assert.equal(result.errors.tiqueteriaValidation, 'invalid');
  assert.equal(result.errors.hoteleriaValidation, 'invalid');
  assert.match(result.message, /Hotelería #1/);
});

test('paso 3: una venta a crédito exige responsable y vencimiento', () => {
  const { errors } = validate(3, { total: 100, payments: [] });
  assert.equal(errors.responsableId, 'El responsable es obligatorio para ventas en crédito o abonadas');
  assert.equal(errors.creditDueDate, 'La fecha de vencimiento es obligatoria para crédito o abonos');
});

test('paso 3: el vencimiento no puede estar en el pasado', () => {
  const { errors } = validate(3, { total: 100, payments: [], responsableId: '1', creditDueDate: '2000-01-01' });
  assert.equal(errors.creditDueDate, 'La fecha de vencimiento no puede ser anterior al día de hoy');
});

test('paso 3: una venta pagada no exige responsable', () => {
  assert.deepEqual(validate(3, { total: 100, payments: [{ amount: 100 }] }), { errors: {}, message: null });
});

test('paso 3: el total no puede ser negativo', () => {
  assert.equal(validate(3, { total: -1, payments: [] }).errors.total, 'El valor total no puede ser negativo');
});
