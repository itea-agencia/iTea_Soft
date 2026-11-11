-- El formulario de tour dejó de pedir el nombre en junio (4be8cce) y el de seguros nunca
-- pidió cobertura, días ni vigencia: las columnas solo recibían null o 0. En producción
-- estaban vacías al 2026-11-11 (1 tour, 0 seguros). Decisión del usuario: quitarlas.
ALTER TABLE "prod_tours" DROP COLUMN "tour_nombre";

ALTER TABLE "prod_seguros" DROP COLUMN "cobertura_usd",
DROP COLUMN "dias_cobertura",
DROP COLUMN "fecha_inicio_vigencia",
DROP COLUMN "fecha_fin_vigencia";
