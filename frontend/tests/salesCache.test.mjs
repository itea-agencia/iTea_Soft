import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const store = new Map();
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  },
});

const { saveSalesCache, saveClientsCache, loadSalesCache, loadClientsCache, invalidateSalesCache } = await cargarTs('utils/salesCache.ts');

const SALES_KEY = 'itea_sales_cache_anonymous';
const CLIENTS_KEY = 'itea_clients_cache_anonymous';
const SIX_MINUTES = 6 * 60 * 1000;

beforeEach(() => store.clear());

// Hallazgo 7: guardar ventas renovaba la antiguedad de los clientes aunque no se hubieran consultado.
test('guardar ventas no renueva la caché de clientes', () => {
  store.set(CLIENTS_KEY, JSON.stringify({ data: [{ id: 1 }], timestamp: Date.now() - SIX_MINUTES }));
  saveSalesCache([{ id: 9 }]);
  assert.deepEqual(loadSalesCache(), [{ id: 9 }]);
  assert.equal(loadClientsCache(), null);
});

test('guardar clientes no renueva la caché de ventas', () => {
  store.set(SALES_KEY, JSON.stringify({ data: [{ id: 9 }], timestamp: Date.now() - SIX_MINUTES }));
  saveClientsCache([{ id: 1 }]);
  assert.deepEqual(loadClientsCache(), [{ id: 1 }]);
  assert.equal(loadSalesCache(), null);
});

test('invalidar borra las dos cachés', () => {
  saveSalesCache([{ id: 9 }]);
  saveClientsCache([{ id: 1 }]);
  invalidateSalesCache();
  assert.equal(loadSalesCache(), null);
  assert.equal(loadClientsCache(), null);
});
