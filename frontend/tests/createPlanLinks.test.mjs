import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

// Se ejecuta el controlador real sin API ni base. Solo se sustituye la frontera Prisma;
// persistencia, claves foráneas y rollback real requieren la prueba local autorizada.
async function createSale(products) {
  const writes = [];
  let saleData;
  const tx = {
    clientes: { findUnique: async () => ({ personaId: 7, persona: { status: 'active' } }) },
    responsables: { findUnique: async () => ({ status: 'active' }) },
    ventas: { create: async ({ data }) => {
      saleData = data;
      writes.push({ type: 'create', data });
      return { id: 999 };
    } },
    detalleVenta: { updateMany: async (args) => {
      writes.push({ type: 'link', ...args });
      return { count: args.where.id.in.length };
    } },
  };
  const db = {
    tiposDocumento: { findMany: async () => [] },
    $transaction: async (callback) => callback(tx),
    ventas: { findUnique: async () => ({
      id: 999, ...saleData,
      cliente: { persona: { nombres: 'Prueba', apellidos: 'Local', email: null } },
      usuario: { persona: { nombres: 'Asesor', apellidos: 'Local' } },
      pagosVenta: [],
    }) },
  };
  const file = new URL('../../backend/src/controllers/sales.controller.js', import.meta.url);
  const realRequire = createRequire(file);
  const exports = {};
  runInNewContext(readFileSync(file, 'utf8'), {
    exports, console, Buffer,
    require: (name) => {
      if (name === '../config/db') return db;
      if (['../utils/emailService', '../utils/logoHelper', '../utils/auditoria', '../services/siigo.service'].includes(name)) return {};
      return realRequire(name);
    },
  }, { filename: file.pathname });
  let failure;
  const response = { status() { return this; }, json(body) { this.body = body; return this; } };
  await exports.create({ body: { clientId: 1, responsableId: 1, ...products }, user: { id: 1 } }, response, (err) => { failure = err; });
  return { writes, response: response.body, failure };
}

test('vincula un tiquete al segundo paquete aunque se prepare antes, sin cambiar los importes', async () => {
  const { writes, failure } = await createSale({
    ticketData: [{ supplierCost: 30, linkedToPlanIndex: 1 }],
    planData: [{ planName: 'Primero', supplierCost: 100 }, { planName: 'Segundo', supplierCost: 200 }],
    baggageData: [{ supplierCost: 40, linkedToPlanIndex: '1' }],
  });
  assert.equal(failure, undefined);
  const data = writes[0].data;
  assert.equal(data.montoTotal, 370);
  const details = data.detalleVentas.create;
  const plan = details.find((d) => d.prodPlanes?.create.nombrePlan === 'Segundo');
  assert.ok(plan.id);
  assert.equal(new Set(details.map((d) => d.id)).size, 4);
  assert.equal(writes.length, 2);
  const link = writes[1];
  assert.equal(link.data.parentDetalleId, plan.id);
  assert.deepEqual(Array.from(link.where.id.in).sort(), Array.from(details).filter((d) => d.categoria !== 'planes').map((d) => d.id).sort());
});

test('conserva las posiciones vacías entre paquetes', async () => {
  const { writes, failure } = await createSale({
    planData: [{ planName: 'Primero' }, {}, { planName: 'Tercero' }],
    ticketData: [{ linkedToPlanIndex: 2 }],
  });
  assert.equal(failure, undefined);
  const plan = writes[0].data.detalleVentas.create.find((d) => d.prodPlanes?.create.nombrePlan === 'Tercero');
  assert.ok(plan.id);
  assert.equal(writes[1]?.data.parentDetalleId, plan.id);
});

test('un vínculo inválido identifica el servicio y no llega a crear la venta', async () => {
  for (const products of [
    { ticketData: [{ linkedToPlanIndex: 0 }] },
    { planData: [{}], ticketData: [{ linkedToPlanIndex: 0 }] },
    { planData: [{ planName: 'Uno' }], ticketData: [{ linkedToPlanIndex: 5 }] },
    { planData: [{ planName: 'Uno' }], ticketData: [{ linkedToPlanIndex: false }] },
    { planData: [{ planName: 'Uno', linkedToPlanIndex: 0 }] },
  ]) {
    const { failure, writes } = await createSale(products);
    assert.equal(failure?.statusCode, 400);
    assert.equal(failure?.code, 'VALIDATION_ERROR');
    assert.match(failure.message, /#1:/);
    assert.equal(writes.length, 0);
  }
});

test('sin vínculo no ejecuta actualizaciones de padres', async () => {
  const { writes, failure } = await createSale({ ticketData: [{ supplierCost: 30 }] });
  assert.equal(failure, undefined);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].data.montoTotal, 30);
});
