import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { createModalStack } = await cargarTs('utils/modalStack.ts');

// Hallazgo 15: con ventanas una sobre otra, Escape cierra solo la de arriba, y cerrar una no
// desbloquea el fondo mientras quede otra abierta.
test('solo la última ventana abierta está arriba', () => {
  const stack = createModalStack();
  const first = stack.push();
  const second = stack.push();
  assert.equal(first.isTop(), false);
  assert.equal(second.isTop(), true);
});

test('al cerrar la de arriba, la anterior vuelve a estar arriba', () => {
  const stack = createModalStack();
  const first = stack.push();
  const second = stack.push();
  second.remove();
  assert.equal(first.isTop(), true);
});

test('avisa que no quedan ventanas solo al cerrar la última', () => {
  const stack = createModalStack();
  const first = stack.push();
  const second = stack.push();
  assert.equal(second.remove(), false);
  assert.equal(first.remove(), true);
});

test('cerrar primero la de abajo no afecta a la de arriba', () => {
  const stack = createModalStack();
  const first = stack.push();
  const second = stack.push();
  assert.equal(first.remove(), false);
  assert.equal(second.isTop(), true);
});
