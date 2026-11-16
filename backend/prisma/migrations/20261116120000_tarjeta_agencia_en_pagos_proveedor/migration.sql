-- La tarjeta de la agencia con que se le pagó al proveedor. Hasta ahora el formulario
-- mostraba las tarjetas, pero se guardaba solo su método de pago genérico y se perdía con
-- qué tarjeta se pagó, que es lo que se concilia. El método se deduce de la tarjeta al leer.
-- Solo agrega columnas; las ventas viejas las rellena db-manual/asignar_tarjeta_pagos_proveedor.
-- Diseño docs/designs/catalogo-por-id-2026-11.md.
ALTER TABLE "detalle_venta" ADD COLUMN "tarjeta_agencia_id" INTEGER;
ALTER TABLE "pagos_proveedor" ADD COLUMN "tarjeta_agencia_id" INTEGER;

ALTER TABLE "detalle_venta" ADD CONSTRAINT "detalle_venta_tarjeta_agencia_id_fkey" FOREIGN KEY ("tarjeta_agencia_id") REFERENCES "tarjetas_agencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "pagos_proveedor" ADD CONSTRAINT "pagos_proveedor_tarjeta_agencia_id_fkey" FOREIGN KEY ("tarjeta_agencia_id") REFERENCES "tarjetas_agencia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
