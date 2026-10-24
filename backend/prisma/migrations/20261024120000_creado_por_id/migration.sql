-- Quien creo cada responsable, comisionista y usuario: es el "Propios" de esos modulos en
-- los permisos por accion (docs/designs/permisos-por-rol-2026-10.md). Nullable: los que ya
-- existen se rellenan con db-manual/rellenar_creado_por.sql, y los que no se pueden
-- atribuir quedan sin dueno.

-- AlterTable
ALTER TABLE "comisionistas" ADD COLUMN     "creado_por_id" INTEGER;

-- AlterTable
ALTER TABLE "responsables" ADD COLUMN     "creado_por_id" INTEGER;

-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "creado_por_id" INTEGER;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comisionistas" ADD CONSTRAINT "comisionistas_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responsables" ADD CONSTRAINT "responsables_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
