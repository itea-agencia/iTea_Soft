import assert from 'node:assert/strict';
import { test } from 'node:test';
import { cargarTs } from './cargarTs.mjs';

// El navegador de los asesores esta en Colombia. Con esta zona, new Date('YYYY-MM-DD') cae a las
// 19:00 del dia anterior, que es lo que hacia que elegir hoy diera "no puede ser pasado".
process.env.TZ = 'America/Bogota';

const { getDaysUntilDue, getCreditSaleStatus, getClientsWithCredit } = await cargarTs('utils/creditUtils.ts');

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

// Hallazgo 6 de la auditoria: el abono se miraba antes que el vencimiento, asi que un credito
// vencido con abonos salia "parcial" y su saldo no sumaba a lo vencido.
test('un credito vencido con abonos es vencido y su saldo suma a lo vencido', () => {
  const venta = { id: 1, clientId: 7, total: 1000, creditPaidAmount: 200, isCredit: true, status: 'abonado', creditDueDate: diaBogota(-1) };
  assert.equal(getCreditSaleStatus(venta), 'overdue');
  const [resumen] = getClientsWithCredit([{ id: 7 }], [venta]);
  assert.equal(resumen.overdueAmount, 800);
  assert.equal(resumen.status, 'overdue');
});

test('un credito con abonos que no ha vencido sigue parcial', () => {
  const venta = { id: 2, clientId: 7, total: 1000, creditPaidAmount: 200, isCredit: true, status: 'abonado', creditDueDate: diaBogota(10) };
  assert.equal(getCreditSaleStatus(venta), 'partial');
});

// El estado en memoria tras saldar con un abono cambia `status` pero no `isCredit`, y una
// cache vieja trae el isCredit de antes: el panel decide por el estado, como el backend.
test('un credito saldado no cuenta aunque traiga isCredit=true', () => {
  const venta = { id: 3, clientId: 7, total: 1000, creditPaidAmount: 1000, isCredit: true, status: 'pagado', creditDueDate: diaBogota(1) };
  assert.deepEqual(getClientsWithCredit([{ id: 7 }], [venta]), []);
});
