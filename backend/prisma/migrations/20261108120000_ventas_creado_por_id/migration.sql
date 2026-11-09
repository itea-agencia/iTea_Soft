-- Quien cargo la venta, que desde ahora puede no ser su asesor (usuario_id).
-- Diseno: docs/designs/venta-a-nombre-de-otro-2026-11.md.

-- AlterTable
ALTER TABLE "ventas" ADD COLUMN "creado_por_id" INTEGER;

-- Relleno exacto: hasta esta migracion el unico camino que crea ventas
-- (salesController.create) guardaba usuario_id = req.user.id, y ningun script reasigna
-- usuario_id. En toda venta existente, quien la cargo es su usuario_id.
UPDATE "ventas" SET "creado_por_id" = "usuario_id";

ALTER TABLE "ventas" ALTER COLUMN "creado_por_id" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
