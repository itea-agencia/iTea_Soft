import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';

// Regla de backend/src/utils/planLinks.js: se valida antes de abrir la transacción.
// Diseño servicios-vinculados-al-paquete-2026-11.
const require = createRequire(import.meta.url);
const { resolvePlanLinks } = require('../../backend/src/utils/planLinks.js');

const products = [
  { field: 'ticketData', category: 'tiqueteria', name: 'Tiquetería' },
  { field: 'planData', category: 'planes', name: 'Paquete' },
  { field: 'tourData', category: 'tours', name: 'Tour' },
];
const rejects = (data, message) =>
  assert.throws(() => resolvePlanLinks(data, products), { statusCode: 400, code: 'VALIDATION_ERROR', message });

test('sin vínculos no devuelve nada', () => {
  assert.deepEqual(resolvePlanLinks({ ticketData: [{}, { a: 1 }], planData: [{ a: 1 }] }, products), []);
  assert.deepEqual(resolvePlanLinks({}, products), []);
});

test('vincula al paquete por su posición, aunque el servicio venga antes en la lista', () => {
  const data = {
    ticketData: [{ linkedToPlanIndex: 1 }],
    planData: [{ planName: 'Uno' }, { planName: 'Dos' }],
    tourData: [{ a: 1 }, { linkedToPlanIndex: '0' }],
  };
  assert.deepEqual(resolvePlanLinks(data, products), [
    { field: 'ticketData', itemIndex: 0, planIndex: 1 },
    { field: 'tourData', itemIndex: 1, planIndex: 0 },
  ]);
});

test('acepta null y vacío como sin vínculo', () => {
  const data = { planData: [{ a: 1 }], tourData: [{ linkedToPlanIndex: null }, { linkedToPlanIndex: '' }] };
  assert.deepEqual(resolvePlanLinks(data, products), []);
});

test('rechaza una posición fuera de rango o sin paquete, nombrando el servicio', () => {
  rejects({ planData: [{ a: 1 }], tourData: [{ linkedToPlanIndex: 5 }] }, /^Tour #1: /);
  rejects({ planData: [{ a: 1 }, {}, null], tourData: [{ linkedToPlanIndex: 1 }] }, /^Tour #1: /);
  rejects({ planData: [{ a: 1 }, {}, null], tourData: [{ linkedToPlanIndex: 2 }] }, /^Tour #1: /);
  rejects({ ticketData: [{ a: 1 }, { linkedToPlanIndex: 0 }] }, /^Tiquetería #2: /);
});

test('solo acepta enteros escritos como tales', () => {
  for (const value of [-1, 0.5, '1e0', '0x1', ' 0', '0 ', '+0', 'no', false, true, [], {}, NaN, Infinity]) {
    rejects({ planData: [{ a: 1 }, { a: 1 }], tourData: [{ linkedToPlanIndex: value }] }, /^Tour #1: /);
  }
});

test('un paquete no se vincula a otro paquete, y el mensaje dice Paquete', () => {
  rejects({ planData: [{ a: 1 }, { linkedToPlanIndex: 0 }] }, /^Paquete #2: /);
});
