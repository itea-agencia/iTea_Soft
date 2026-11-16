import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { passengerDocument } = require('../../backend/src/utils/passengerDocument.js');

test('la lectura conserva el documento del mismo pasajero que aporta su nombre', () => {
  assert.deepEqual(passengerDocument([{ tipoDocumento: 'CC', nroDocumento: '9930000701' }]), {
    docType: 'CC', docNumber: '9930000701',
  });
});

test('sin documento no toma tiquete, reserva ni el documento de otro pasajero', () => {
  assert.deepEqual(passengerDocument([{ nroTiquete: 'T1' }, { tipoDocumento: 'CC', nroDocumento: 'OTRO' }]), {
    docType: null, docNumber: null,
  });
  assert.deepEqual(passengerDocument([]), { docType: null, docNumber: null });
});
