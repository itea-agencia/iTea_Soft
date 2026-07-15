const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const salesToDelete = [37, 39, 41, 49];
  
  for (const id of salesToDelete) {
    try {
      console.log(`\n--- Processing Sale ${id} ---`);
      const sale = await prisma.ventas.findUnique({ 
        where: { id },
        include: {
          detalleVentas: {
            include: {
              prodTiqueteria: true
            }
          }
        }
      });
      
      if (!sale) {
        console.log(`Sale ${id} not found, skipping...`);
        continue;
      }

      // 1. Delete payments and liquidations
      console.log('Deleting Pagos and Liquidaciones...');
      await prisma.pagosVenta.deleteMany({ where: { ventaId: id } });
      await prisma.liquidacionVentas.deleteMany({ where: { ventaId: id } });
      
      // 2. Delete Details and their products
      for (const detalle of sale.detalleVentas) {
        console.log(`  Deleting details for DetalleVenta ${detalle.id}...`);
        // Passengers
        await prisma.pasajerosDetalle.deleteMany({ where: { detalleVentaId: detalle.id } });
        
        // If Tiqueteria, delete Tramos first
        if (detalle.prodTiqueteria) {
          await prisma.tramosVuelo.deleteMany({ where: { prodTiqueteriaId: detalle.prodTiqueteria.id } });
        }
        
        // Delete all possible products
        const productTables = [
          'prodTiqueteria', 'prodHoteleria', 'prodPlanes', 'prodSeguros', 
          'prodCheckins', 'prodMigracion', 'prodSimcards', 'prodAutos', 
          'prodFincas', 'prodTours', 'prodEventos', 'prodRestaurantes', 
          'prodVisas', 'prodPasaportes', 'prodMascotas'
        ];
        
        for (const table of productTables) {
          try {
            await prisma[table].deleteMany({ where: { detalleVentaId: detalle.id } });
          } catch (e) {
            // Some tables might not exist or have different relations, ignore if so
          }
        }
        
        // Delete Detalle
        await prisma.detalleVenta.delete({ where: { id: detalle.id } });
      }
      
      // 3. Delete Venta
      console.log('Deleting main Venta record...');
      await prisma.ventas.delete({ where: { id } });
      
      console.log(`Successfully deleted sale ${id} and all its dependencies.`);
    } catch (error) {
      console.error(`Error deleting sale ${id}:`, error);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
