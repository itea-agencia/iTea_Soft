-- AlterTable
ALTER TABLE "proveedores" ADD COLUMN     "creado_at" TIMESTAMP(3),
ADD COLUMN     "creado_por_id" INTEGER;

-- AddForeignKey
ALTER TABLE "proveedores" ADD CONSTRAINT "proveedores_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
