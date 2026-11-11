import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const store = new Map();
let failWrites = false;
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      if (failWrites) throw new Error('QuotaExceededError');
      store.set(key, value);
    },
    removeItem: (key) => store.delete(key),
  },
});

const { createCache } = await cargarTs('utils/createCache.ts');

const tokenFor = (userId) => `x.${btoa(JSON.stringify({ userId }))}.y`;
const TTL = 1000;

beforeEach(() => {
  store.clear();
  failWrites = false;
});

// Hallazgo 16: las cuatro cachés repetían esta lógica. clearSessionCaches depende de estas claves.
test('la clave lleva el id del usuario del token', () => {
  store.set('itea_token', tokenFor(7));
  createCache('itea_x_cache', TTL).write([1]);
  assert.equal(store.has('itea_x_cache_7'), true);
});

test('sin token usa la clave anónima', () => {
  createCache('itea_x_cache', TTL).write([1]);
  assert.equal(store.has('itea_x_cache_anonymous'), true);
});

test('un token ilegible usa la clave anónima', () => {
  store.set('itea_token', 'no-es-un-jwt');
  createCache('itea_x_cache', TTL).write([1]);
  assert.equal(store.has('itea_x_cache_anonymous'), true);
});

test('devuelve lo guardado antes de vencer', () => {
  const cache = createCache('itea_x_cache', TTL);
  cache.write([1, 2]);
  assert.deepEqual(cache.read(), [1, 2]);
});

test('al vencer devuelve null y borra la entrada', () => {
  store.set('itea_x_cache_anonymous', JSON.stringify({ data: [1], timestamp: Date.now() - TTL - 1 }));
  assert.equal(createCache('itea_x_cache', TTL).read(), null);
  assert.equal(store.has('itea_x_cache_anonymous'), false);
});

test('un JSON corrupto se trata como vacío', () => {
  store.set('itea_x_cache_anonymous', '{no es json');
  assert.equal(createCache('itea_x_cache', TTL).read(), null);
});

test('con el almacenamiento lleno no lanza error', () => {
  failWrites = true;
  assert.doesNotThrow(() => createCache('itea_x_cache', TTL).write([1]));
});

test('remove borra la entrada', () => {
  const cache = createCache('itea_x_cache', TTL);
  cache.write([1]);
  cache.remove();
  assert.equal(cache.read(), null);
});
