const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function fix() {
  await prisma.prodPlanes.updateMany({
    where: { detalleVenta: { ventaId: 69 } },
    data: { tipoTransporte: 'Terrestre' }
  });
  console.log('Fixed');
}
fix().catch(console.error).finally(() => prisma.$disconnect());
