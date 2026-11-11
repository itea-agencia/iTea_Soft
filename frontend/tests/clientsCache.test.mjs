import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { bundleTs } from './bundleTs.mjs';

const store = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  },
});

const { saveClientsCache, loadClientsCache, invalidateClientsCache } = await bundleTs('utils/clientsCache.ts');

beforeEach(() => store.clear());

test('guarda y devuelve los clientes', () => {
  saveClientsCache([{ id: 1 }]);
  assert.deepEqual(loadClientsCache(), [{ id: 1 }]);
});

test('vence a los cinco minutos', () => {
  store.set('itea_clients_cache_anonymous', JSON.stringify({ data: [{ id: 1 }], timestamp: Date.now() - 6 * 60 * 1000 }));
  assert.equal(loadClientsCache(), null);
});

test('invalidar borra la caché', () => {
  saveClientsCache([{ id: 1 }]);
  invalidateClientsCache();
  assert.equal(loadClientsCache(), null);
});
