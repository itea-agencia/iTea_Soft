import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { validateDocNumber, validateNamePart, validateFullName, validatePerson } = await cargarTs('utils/docNumber.ts');

// Una sola regla para toda persona: la de la pantalla de clientes. El backend aplica la misma
// en backend/src/utils/persons.js. Diseño pasajeros-con-documento-2026-11.
const catalog = ['CC', 'T.I', 'NIT', 'Pasaporte'];

test('nombre completo: una sola palabra no alcanza, aunque tenga espacios alrededor', () => {
  assert.notEqual(validateFullName('Ana'), '');
  assert.notEqual(validateFullName('  Ana '), '');
});

test('nombre completo: los espacios de sobra no cuentan como palabras', () => {
  assert.equal(validateFullName('  Ana   Pérez '), '');
});

test('nombre completo: maximo 80 caracteres', () => {
  assert.equal(validateFullName(`Ana ${'a'.repeat(76)}`), '');
  assert.notEqual(validateFullName(`Ana ${'a'.repeat(77)}`), '');
});

test('nombre completo: solo letras y espacios', () => {
  assert.notEqual(validateFullName('Ana P3rez'), '');
  assert.equal(validateFullName('Ñoño Núñez'), '');
});

test('nombre o apellido separado: obligatorio, letras, maximo 40', () => {
  assert.notEqual(validateNamePart(''), '');
  assert.notEqual(validateNamePart('a'.repeat(41)), '');
  assert.equal(validateNamePart('María José'), '');
});

test('persona: sin documento falla', () => {
  assert.notEqual(validatePerson({ name: 'Ana Pérez', docType: 'CC', docNumber: '' }, catalog), '');
});

test('persona: una fila vacia falla con su propio mensaje', () => {
  assert.equal(validatePerson({ name: '', docType: '', docNumber: '' }, catalog), 'Faltan el nombre y el documento');
});

test('persona: un tipo que no esta en el catalogo falla', () => {
  assert.notEqual(validatePerson({ name: 'Ana Pérez', docType: 'TI', docNumber: '1234567' }, catalog), '');
});

test('persona: sin tipo falla', () => {
  assert.notEqual(validatePerson({ name: 'Ana Pérez', docType: '', docNumber: '1234567' }, catalog), '');
});

test('persona: una cedula con letras falla', () => {
  assert.notEqual(validatePerson({ name: 'Ana Pérez', docType: 'CC', docNumber: '12ab56' }, catalog), '');
});

test('persona: completa y valida pasa', () => {
  assert.equal(validatePerson({ name: 'Ana Pérez', docType: 'CC', docNumber: '1234567' }, catalog), '');
});

test('documento: el NIT con digito de verificacion sigue pasando', () => {
  assert.equal(validateDocNumber('NIT', '900123456-7'), '');
});
