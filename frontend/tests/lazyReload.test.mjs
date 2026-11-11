import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { importWithReload } = await cargarTs('utils/lazyReload.ts');

const FLAG = 'itea_chunk_reload';
const memoryStorage = (initial = {}) => {
  const store = new Map(Object.entries(initial));
  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
};
const tick = () => new Promise((resolve) => setTimeout(resolve));
const failing = () => Promise.reject(new Error('archivo no existe'));

// Hallazgo 16: al publicar se reemplazan los archivos y una pestaña abierta pide uno que ya no está.
test('al cargar bien devuelve el módulo y limpia la marca', async () => {
  const storage = memoryStorage({ [FLAG]: '1' });
  const result = await importWithReload(() => Promise.resolve('modulo'), storage, () => assert.fail('no debe recargar'));
  assert.equal(result, 'modulo');
  assert.equal(storage.store.has(FLAG), false);
});

test('al primer fallo guarda la marca y recarga una vez', async () => {
  const storage = memoryStorage();
  let reloads = 0;
  importWithReload(failing, storage, () => { reloads++; });
  await tick();
  assert.equal(reloads, 1);
  assert.equal(storage.store.has(FLAG), true);
});

test('con la marca puesta rechaza sin recargar, para no entrar en bucle', async () => {
  const storage = memoryStorage({ [FLAG]: '1' });
  await assert.rejects(importWithReload(failing, storage, () => assert.fail('no debe recargar')), /archivo no existe/);
});

test('si el almacenamiento está bloqueado rechaza sin recargar', async () => {
  const blocked = {
    getItem: () => { throw new Error('bloqueado'); },
    setItem: () => { throw new Error('bloqueado'); },
    removeItem: () => { throw new Error('bloqueado'); },
  };
  await assert.rejects(importWithReload(failing, blocked, () => assert.fail('no debe recargar')), /archivo no existe/);
});

test('el almacenamiento bloqueado no rompe una carga correcta', async () => {
  const blocked = { getItem: () => null, setItem: () => {}, removeItem: () => { throw new Error('bloqueado'); } };
  assert.equal(await importWithReload(() => Promise.resolve('modulo'), blocked, () => {}), 'modulo');
});
