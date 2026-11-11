import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { createLatestRequests } = await cargarTs('utils/latestRequests.ts');

// Hallazgo 8: con una consulta en curso se ignoraba el cambio de filtro.
test('una sola petición es la última', () => {
  const requests = createLatestRequests();
  const isLatest = requests.begin();
  assert.equal(isLatest(), true);
});

test('una petición nueva deja vieja a la anterior', () => {
  const requests = createLatestRequests();
  const first = requests.begin();
  const second = requests.begin();
  assert.equal(first(), false);
  assert.equal(second(), true);
});
