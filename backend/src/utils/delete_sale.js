const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const saleId = 72;
  try {
    console.log(`Buscando y eliminando registros asociados a la venta ${saleId}...`);
    
    // Primero buscar los detalles de venta
    const detalles = await prisma.detalleVenta.findMany({ where: { ventaId: saleId } });
    for (const d of detalles) {
      // Eliminar pasajeros asociados al detalle
      await prisma.pasajerosDetalle.deleteMany({ where: { detalleVentaId: d.id } });
      
      const vId = d.id;
      
      const prodTiq = await prisma.prodTiqueteria.findFirst({ where: { detalleVentaId: vId } });
      if (prodTiq) {
        await prisma.tramosVuelo.deleteMany({ where: { prodTiqueteriaId: prodTiq.id } });
        await prisma.prodTiqueteria.deleteMany({ where: { id: prodTiq.id } });
      }

      await prisma.prodHoteleria.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodSeguros.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodPlanes.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodCheckins.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodMigracion.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodSimcards.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodAutos.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodFincas.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodTours.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodEventos.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodRestaurantes.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodVisas.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodPasaportes.deleteMany({ where: { detalleVentaId: vId } });
      await prisma.prodMascotas.deleteMany({ where: { detalleVentaId: vId } });
    }

    // Eliminar Detalles
    await prisma.detalleVenta.deleteMany({ where: { ventaId: saleId } });
    console.log("Detalles eliminados.");

    // Eliminar pagos asociados a la venta
    await prisma.pagosVenta.deleteMany({ where: { ventaId: saleId } });
    console.log("Pagos eliminados.");

    // Eliminar liquidaciones si existen
    await prisma.liquidacionVentas.deleteMany({ where: { ventaId: saleId } });

    // Eliminar Venta
    await prisma.ventas.deleteMany({ where: { id: saleId } });
    console.log(`Venta ${saleId} eliminada correctamente.`);
    
    // Obtener el ID máximo actual en la tabla Ventas
    const maxVenta = await prisma.ventas.aggregate({
      _max: {
        id: true,
      },
    });
    
    const maxId = maxVenta._max.id || 0;
    
    // En PostgreSQL la secuencia suele llamarse "ventas_id_seq" 
    await prisma.$executeRawUnsafe(`SELECT setval('"ventas_id_seq"', ${maxId}, true);`);
    console.log(`Secuencia 'ventas_id_seq' ajustada correctamente al máximo ID existente: ${maxId}.`);

  } catch (e) {
    console.error("Error al eliminar la venta: ", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
