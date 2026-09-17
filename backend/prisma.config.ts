// Configuracion de Prisma. Reemplaza al bloque `prisma` de package.json, que queda
// obsoleto en Prisma 7: sin esto, `migrate reset` dejaria de resembrar sin avisar.
//
// OJO: en cuanto existe este archivo, Prisma DEJA de cargar el .env por su cuenta
// ("Prisma config detected, skipping environment variable loading"). Sin la linea de
// dotenv, `DATABASE_URL` y `DIRECT_URL` no se encuentran y todo comando de migracion
// falla con P1012.
import 'dotenv/config';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    // Lo corren `prisma migrate reset` y `migrate dev` cuando recrean la base.
    seed: 'node prisma/seed.js',
  },
});
