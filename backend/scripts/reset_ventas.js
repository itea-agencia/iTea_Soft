const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const ventaIds = [88, 89];
  try {
    console.log('Iniciando limpieza en cascada...');

    // Obtener IDs de detalle_venta como strings (UUID)
    const detalles = await prisma.$queryRawUnsafe(
      `SELECT id::text FROM detalle_venta WHERE venta_id = ANY(ARRAY[${ventaIds.join(',')}]::int[])`
    );
    const detalleIds = detalles.map(d => d.id);
    console.log(`DetalleVentas encontrados: ${detalleIds.length} -> ${detalleIds.join(', ')}`);

    if (detalleIds.length > 0) {
      const uuidList = detalleIds.map(id => `'${id}'`).join(',');

      // Obtener IDs de prod_tiqueteria para borrar tramos_vuelo primero
      try {
        const tiquetes = await prisma.$queryRawUnsafe(
          `SELECT id::text FROM prod_tiqueteria WHERE detalle_venta_id::text IN (${uuidList})`
        );
        if (tiquetes.length > 0) {
          const tiqList = tiquetes.map(t => `'${t.id}'`).join(',');
          const tv = await prisma.$executeRawUnsafe(
            `DELETE FROM tramos_vuelo WHERE prod_tiqueteria_id::text IN (${tiqList})`
          );
          console.log(`  tramos_vuelo: ${tv} fila(s) eliminada(s)`);
        }
      } catch (e) { console.log('  tramos_vuelo skip:', e.message); }

      const productoTables = [
        'prod_tiqueteria', 'prod_hoteleria', 'prod_seguros_viaje', 'prod_planes',
        'prod_checkin', 'prod_documentacion_migratoria', 'prod_simcard',
        'prod_equipajes', 'prod_renta_vehiculos', 'prod_renta_fincas',
        'prod_tours', 'prod_centros_convencion', 'prod_restaurantes',
        'prod_visa', 'prod_pasaporte', 'prod_mascotas', 'pasajeros_detalle'
      ];

      for (const table of productoTables) {
        try {
          const res = await prisma.$executeRawUnsafe(
            `DELETE FROM ${table} WHERE detalle_venta_id::text IN (${uuidList})`
          );
          if (res > 0) console.log(`  ${table}: ${res} fila(s) eliminada(s)`);
        } catch (e) {
          // tabla no existe o no tiene esa columna, ignorar
        }
      }

      const deletedDet = await prisma.$executeRawUnsafe(
        `DELETE FROM detalle_venta WHERE id::text IN (${uuidList})`
      );
      console.log(`DetalleVentas eliminados: ${deletedDet}`);
    }

    // Eliminar pagos
    const deletedPagos = await prisma.$executeRawUnsafe(
      `DELETE FROM pagos_venta WHERE venta_id = ANY(ARRAY[${ventaIds.join(',')}]::int[])`
    );
    console.log(`Pagos eliminados: ${deletedPagos}`);

    // Eliminar las ventas
    const result = await prisma.$executeRawUnsafe(
      `DELETE FROM ventas WHERE id = ANY(ARRAY[${ventaIds.join(',')}]::int[])`
    );
    console.log(`Ventas eliminadas: ${result}`);

    // Resetear la secuencia a 87
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('ventas', 'id'), 87, true)`
    );
    console.log('✅ Secuencia reiniciada a 87. El próximo ID será 88.');

  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
