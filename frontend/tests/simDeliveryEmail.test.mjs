import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bundleTs } from './bundleTs.mjs';

const { validateWizardStep } = await bundleTs('components/sales/wizardValidation.ts');

// El correo de entrega de la eSIM es evidencia: se valida entero y no se recorta.
const sim = (extra) => ({
  destinationCountry: 'USA', arrivalDate: '2099-01-01', tripDuration: '8', passengerName: 'Ana Pérez', docType: 'CC', docNumber: '1234567',
  simType: 'eSIM', deliveryMethod: 'Correo Electrónico', ...extra,
});
const validate = (s) => validateWizardStep(2, { selectedProducts: ['simcard'], simCards: [s] }, { clients: [], commissionAgentsForSale: [], config: { documentTypes: [{ abreviatura: 'CC' }] } }, []);
const longEmail = `${'a'.repeat(160)}@empresa.com`; // 171 caracteres, el caso de la revision

test('sim: un correo de 171 caracteres es valido y no se rechaza', () => {
  assert.equal(validate(sim({ deliveryEmail: longEmail })).message, null);
});

test('sim: con entrega por correo, el correo es obligatorio', () => {
  assert.match(validate(sim({ deliveryEmail: '' })).message ?? '', /Correo de entrega/);
});

test('sim: un correo invalido se rechaza', () => {
  assert.match(validate(sim({ deliveryEmail: 'sin-arroba' })).message ?? '', /Correo de entrega/);
});

test('sim: un correo de mas de 254 caracteres se rechaza en vez de recortarse', () => {
  assert.match(validate(sim({ deliveryEmail: `${'a'.repeat(250)}@x.co` })).message ?? '', /254/);
});

test('sim: un .com.co es valido', () => {
  assert.equal(validate(sim({ deliveryEmail: 'ana@empresa.com.co' })).message, null);
});

test('sim: con otro metodo de entrega no se exige correo', () => {
  assert.equal(validate(sim({ deliveryMethod: 'Domicilio', deliveryEmail: '' })).message, null);
});
