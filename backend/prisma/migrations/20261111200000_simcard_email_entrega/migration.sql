-- Correo al que se envió la eSIM, como evidencia de la entrega. Solo se llena con el método
-- "Correo Electrónico". Antes el formulario lo pedía y el backend lo descartaba.
ALTER TABLE "prod_simcards" ADD COLUMN "email_entrega" TEXT;
