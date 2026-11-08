import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

// El navegador de los asesores esta en Colombia. Con esta zona, new Date('YYYY-MM-DD') cae a las
// 19:00 del dia anterior, que es lo que hacia que elegir hoy diera "no puede ser pasado".
process.env.TZ = 'America/Bogota';

const { getDaysUntilDue } = await cargarTs('utils/creditUtils.ts');

const diaBogota = (desplazamientoDias) =>
  new Intl.DateTimeFormat('fr-CA', { timeZone: 'America/Bogota', year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Date.now() + desplazamientoDias * 86400000));

test('hoy da 0 dias: elegir hoy no es una fecha pasada', () => {
  assert.equal(getDaysUntilDue(diaBogota(0)), 0);
});

test('ayer da -1 y manana da 1', () => {
  assert.equal(getDaysUntilDue(diaBogota(-1)), -1);
  assert.equal(getDaysUntilDue(diaBogota(1)), 1);
});

test('la fecha que devuelve el backend (medianoche UTC) cuenta como el mismo dia', () => {
  assert.equal(getDaysUntilDue(`${diaBogota(0)}T00:00:00.000Z`), 0);
});
