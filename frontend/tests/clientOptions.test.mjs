import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { clientOption, findClientById } = await cargarTs('utils/clientOptions.ts');

// Hallazgo 4: el cliente se elegia por nombre y dos homonimos eran indistinguibles; se tomaba
// el primero. Ahora el valor es el id y la etiqueta lleva el documento.
const ana1 = { id: 3, name: 'Ana Gómez', docType: 'CC', docNumber: '111' };
const ana2 = { id: 9, name: 'Ana Gómez', docType: 'CE', docNumber: '222' };

test('dos homónimos tienen valor y etiqueta distintos', () => {
  assert.deepEqual(clientOption(ana1), { value: '3', label: 'Ana Gómez · CC 111' });
  assert.notEqual(clientOption(ana1).label, clientOption(ana2).label);
});

test('sin documento, la etiqueta es el nombre; sin name, nombres y apellidos', () => {
  assert.equal(clientOption({ id: 1, name: 'Luis' }).label, 'Luis');
  assert.equal(clientOption({ id: 2, firstName: 'Eva', lastName: 'Ruiz' }).label, 'Eva Ruiz');
});

test('se busca por id, no por nombre', () => {
  assert.equal(findClientById([ana1, ana2], '9'), ana2);
  assert.equal(findClientById([ana1, ana2], 'Ana Gómez'), undefined);
  assert.equal(findClientById([ana1, ana2], ''), undefined);
});
