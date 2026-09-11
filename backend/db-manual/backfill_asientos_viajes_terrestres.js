/**
 * Backfill: mueve el asiento de viajes terrestres del producto al pasajero.
 *
 * Antes de este cambio, `prod_viajes_terrestres` guardaba `numero_asiento` y
 * `numero_asiento_regreso` a nivel producto, y `pasajeros_detalle.asiento` se
 * llenaba heredando ese valor. El asiento de regreso no existía por pasajero.
 *
 * Este script copia ambos valores a `pasajeros_detalle` donde estén vacíos, para
 * poder eliminar las columnas del producto sin perder informacion.
 *
 * IMPORTANTE: correr ANTES de eliminar las columnas del schema (`db push` las
 * borra sin aviso por el flag --accept-data-loss del buildCommand).
 *
 * Uso:  node scripts/backfill_asientos_viajes_terrestres.js [--dry-run]
 */
const prisma = require('../src/config/db');

const DRY_RUN = process.argv.includes('--dry-run');

const vacio = (v) => v === null || v === undefined || String(v).trim() === '';

async function main() {
  console.log(DRY_RUN ? '🔍 DRY RUN — no se escribe nada\n' : '✏️  Aplicando cambios\n');

  const viajes = await prisma.$queryRaw`
    SELECT vt.detalle_venta_id      AS "detalleVentaId",
           vt.numero_asiento        AS "numeroAsiento",
           vt.numero_asiento_regreso AS "numeroAsientoRegreso",
           dv.venta_id              AS "ventaId"
    FROM prod_viajes_terrestres vt
    JOIN detalle_venta dv ON dv.id = vt.detalle_venta_id
    ORDER BY dv.venta_id
  `;

  console.log(`Viajes terrestres encontrados: ${viajes.length}\n`);

  let actualizadosIda = 0;
  let actualizadosRegreso = 0;
  let sinPasajeros = 0;

  for (const viaje of viajes) {
    const pasajeros = await prisma.pasajerosDetalle.findMany({
      where: { detalleVentaId: viaje.detalleVentaId },
      include: { persona: { select: { nombres: true, apellidos: true } } }
    });

    if (pasajeros.length === 0) {
      sinPasajeros++;
      console.log(`  ⚠️  Venta ${viaje.ventaId}: sin pasajeros registrados, nada que migrar`);
      continue;
    }

    for (const pax of pasajeros) {
      const nombre = pax.persona
        ? `${pax.persona.nombres} ${pax.persona.apellidos}`
        : `(persona ${pax.personaId})`;
      const data = {};

      if (vacio(pax.asiento) && !vacio(viaje.numeroAsiento)) {
        data.asiento = viaje.numeroAsiento;
      }
      if (vacio(pax.asientoRegreso) && !vacio(viaje.numeroAsientoRegreso)) {
        data.asientoRegreso = viaje.numeroAsientoRegreso;
      }

      if (Object.keys(data).length === 0) {
        console.log(`  ·  Venta ${viaje.ventaId} — ${nombre}: ya tiene sus asientos, se respeta`);
        continue;
      }

      if (data.asiento) actualizadosIda++;
      if (data.asientoRegreso) actualizadosRegreso++;

      console.log(
        `  →  Venta ${viaje.ventaId} — ${nombre}: ` +
        Object.entries(data).map(([k, v]) => `${k}="${v}"`).join(', ')
      );

      if (!DRY_RUN) {
        await prisma.pasajerosDetalle.update({ where: { id: pax.id }, data });
      }
    }
  }

  console.log('\n─────────────────────────────');
  console.log(`Asientos de ida migrados:    ${actualizadosIda}`);
  console.log(`Asientos de regreso migrados: ${actualizadosRegreso}`);
  if (sinPasajeros > 0) {
    console.log(`Viajes sin pasajeros:        ${sinPasajeros}  (su asiento se pierde al eliminar las columnas)`);
  }
  console.log(DRY_RUN ? '\n🔍 DRY RUN — no se escribió nada' : '\n✅ Backfill completado');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
