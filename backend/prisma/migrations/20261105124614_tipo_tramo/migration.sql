-- CreateEnum
CREATE TYPE "TipoTramo" AS ENUM ('ida', 'escala_ida', 'regreso', 'escala_regreso');

-- AlterTable
ALTER TABLE "tramos_vuelo" ADD COLUMN     "tipo_tramo" "TipoTramo";
