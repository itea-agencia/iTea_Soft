import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { firstAllowedRoute } = await cargarTs('utils/landingRoute.ts');

// Hallazgo 11: sin permiso de una pantalla se va a la primera permitida, en el orden del menu.
test('con permiso del Dashboard va al inicio', () => {
  assert.equal(firstAllowedRoute(() => true), '/');
});

test('sin Dashboard va a la siguiente permitida del menú', () => {
  assert.equal(firstAllowedRoute((module) => ['clients', 'config'].includes(module)), '/clients');
});

test('sin ninguna pantalla no hay a dónde ir', () => {
  assert.equal(firstAllowedRoute(() => false), null);
});
