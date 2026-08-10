const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.tpoackpublplicfpkbvs:1033488906b@aws-1-us-west-2.pooler.supabase.com:5432/postgres'
    }
  }
});

async function run() {
  try {
    // Corregir llegada del tramo de ida a Madrid
    // De: 2026-09-21 15:20  ->  A: 2026-09-07 15:20 (UTC-5 Colombia = 20:20 UTC)
    const nuevaLlegada = new Date('2026-09-07T20:20:00.000Z'); // 15:20 Colombia time

    const result = await prisma.$executeRawUnsafe(`
      UPDATE tramos_vuelo
      SET llegada = $1
      WHERE id = '3cc7f676-6b79-43d7-b66d-4a0e5baa6522'
    `, nuevaLlegada);

    console.log(`Tramo actualizado: ${result} fila(s)`);

    // Verificar
    const verificar = await prisma.$queryRawUnsafe(`
      SELECT id, salida, llegada, nro_vuelo_tramo, orden FROM tramos_vuelo
      WHERE id = '3cc7f676-6b79-43d7-b66d-4a0e5baa6522'
    `);
    console.log('Datos actualizados:');
    console.log(`  Salida:  ${verificar[0].salida}`);
    console.log(`  Llegada: ${verificar[0].llegada}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

run();
