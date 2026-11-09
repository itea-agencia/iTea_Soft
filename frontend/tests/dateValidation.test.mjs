import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

const { isValidCalendarDate } = await cargarTs('components/sales/forms/dateValidation.ts');

test('accepts today, past dates and future dates without timezone conversion', () => {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  for (const value of [today, '1990-01-01', '2099-12-31', '0001-01-01']) {
    assert.equal(isValidCalendarDate(value), true, value);
  }
});

test('checks leap years including century exceptions', () => {
  for (const value of ['2024-02-29', '2000-02-29']) assert.equal(isValidCalendarDate(value), true, value);
  for (const value of ['2026-02-29', '1900-02-29', '2100-02-29']) assert.equal(isValidCalendarDate(value), false, value);
});

test('rejects rollover dates, incomplete input, and invalid months or days', () => {
  for (const value of ['2026-02-31', '2026-04-31', '2026-13-10', '2026-00-10', '2026-01-00', '2026-01-32', '0000-01-01', '', '2026-1-01', '2026-01', '31/01/2026', '2026-01-01T00:00:00Z']) {
    assert.equal(isValidCalendarDate(value), false, value);
  }
});
