-- Corrige el NIT de dos proveedores que quedaron cargados con digito de verificacion.
-- Siigo identifica al tercero SIN DV: enviarlo con el DV devuelve
-- "The customer doesn't exist" y la factura falla.
--
-- Verificado el 2026-09-07 contra GET /v1/customers de Siigo:
--   890100577  -> AVIANCA DIRECTA
--   900383393  -> VIAJES COLOMBIA ON LINE S.A.S.
--
-- Las condiciones del WHERE son deliberadas: si el dato ya se corrigio, no hacen nada.

BEGIN;

SELECT id, nombre, documento FROM proveedores WHERE id IN (1, 10) ORDER BY id;

UPDATE proveedores SET documento = '890100577'
 WHERE id = 10 AND documento = '890100577-6';   -- AVIANCA, 13 ventas

UPDATE proveedores SET documento = '900383393'
 WHERE id = 1  AND documento = '9003833937';    -- VIAJES COLOMBIA ONLINE, 33 ventas

SELECT id, nombre, documento FROM proveedores WHERE id IN (1, 10) ORDER BY id;

-- Deberia devolver 0 filas: ningun documento con guion ni de mas de 9 digitos.
SELECT id, nombre, documento FROM proveedores
 WHERE documento IS NOT NULL AND (documento LIKE '%-%' OR length(documento) > 9);

COMMIT;
