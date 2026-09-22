-- Borra las 6 personas que quedaron huerfanas por el bug de `create` en
-- users.controller.js (arreglado en esta misma tanda de trabajo): `existingUser` se
-- declaraba con `const` dentro de un `if` y se usaba fuera, asi que el alta de un usuario
-- fallaba siempre con un ReferenceError DESPUES de crear la persona. Cada intento fallido
-- dejaba una fila en `personas` sin usuario, cliente, responsable, comisionista ni
-- pasajero. Identificadas el 2026-09-22 leyendo produccion (solo lectura):
--
--   66-69  Juan Perez              2026-07-22 21:59 a 22:07, sin documento ni correo
--   70     Maria Lopez             2026-07-22 22:43, sin documento ni correo
--   71     Jhonny Palacios Minota  2026-07-22 22:49, sin documento ni correo
--
-- Verificado que ninguna es pasajero de una venta real (de las 9 huerfanas que habia,
-- otras 3 -97, 98, 107- SI lo son y no entran en esta lista).
--
-- IDs fijos a proposito: es una limpieza puntual, no una regla que deba correr de nuevo.
-- El DELETE solo toca una fila si SIGUE huerfana en las 5 tablas que referencian
-- `personas.id` (usuarios, clientes, comisionistas, responsables, pasajeros_detalle) en el
-- momento de correr el script, no en el momento en que se escribio: si alguna de estas 6
-- personas gano una relacion entre medias, esa fila no se toca.

BEGIN;

\echo '--- Confirmando que las 6 siguen siendo quien creemos y siguen huerfanas'
SELECT id, nombres, apellidos, documento, email, creado_at,
       EXISTS(SELECT 1 FROM usuarios WHERE persona_id = p.id) AS tiene_usuario,
       EXISTS(SELECT 1 FROM clientes WHERE persona_id = p.id) AS tiene_cliente,
       EXISTS(SELECT 1 FROM comisionistas WHERE persona_id = p.id) AS tiene_comisionista,
       EXISTS(SELECT 1 FROM responsables WHERE persona_id = p.id) AS tiene_responsable,
       EXISTS(SELECT 1 FROM pasajeros_detalle WHERE persona_id = p.id) AS tiene_pasajero
  FROM personas p
 WHERE p.id IN (66, 67, 68, 69, 70, 71)
 ORDER BY p.id;

DO $$
DECLARE
  v_esperado text[] := ARRAY['Juan|Perez', 'Juan|Perez', 'Juan|Perez', 'Juan|Perez', 'Maria|Lopez', 'Jhonny|Palacios Minota'];
  v_ids int[] := ARRAY[66, 67, 68, 69, 70, 71];
  v_i int;
  v_fila record;
BEGIN
  FOR v_i IN 1..array_length(v_ids, 1) LOOP
    SELECT nombres, apellidos INTO v_fila FROM personas WHERE id = v_ids[v_i];
    IF NOT FOUND THEN
      RAISE EXCEPTION 'la persona % ya no existe: alguien la borro antes que este script', v_ids[v_i];
    END IF;
    IF v_fila.nombres || '|' || v_fila.apellidos <> v_esperado[v_i] THEN
      RAISE EXCEPTION 'la persona % ya no es "%": ahora es "% %". No es la misma fila que se identifico, no se toca nada',
        v_ids[v_i], v_esperado[v_i], v_fila.nombres, v_fila.apellidos;
    END IF;
    IF EXISTS(SELECT 1 FROM usuarios WHERE persona_id = v_ids[v_i])
      OR EXISTS(SELECT 1 FROM clientes WHERE persona_id = v_ids[v_i])
      OR EXISTS(SELECT 1 FROM comisionistas WHERE persona_id = v_ids[v_i])
      OR EXISTS(SELECT 1 FROM responsables WHERE persona_id = v_ids[v_i])
      OR EXISTS(SELECT 1 FROM pasajeros_detalle WHERE persona_id = v_ids[v_i])
    THEN
      RAISE EXCEPTION 'la persona % ya no esta huerfana: gano una relacion desde que se identifico. No se toca', v_ids[v_i];
    END IF;
  END LOOP;
END $$;

SELECT count(*) AS personas_antes FROM personas;

-- El WHERE repite la comprobacion de huerfandad: aunque las guardas de arriba ya pasaron,
-- el propio DELETE no depende de esa foto anterior.
DELETE FROM personas p
 WHERE p.id IN (66, 67, 68, 69, 70, 71)
   AND NOT EXISTS(SELECT 1 FROM usuarios WHERE persona_id = p.id)
   AND NOT EXISTS(SELECT 1 FROM clientes WHERE persona_id = p.id)
   AND NOT EXISTS(SELECT 1 FROM comisionistas WHERE persona_id = p.id)
   AND NOT EXISTS(SELECT 1 FROM responsables WHERE persona_id = p.id)
   AND NOT EXISTS(SELECT 1 FROM pasajeros_detalle WHERE persona_id = p.id);

SELECT count(*) AS personas_despues FROM personas;

DO $$
DECLARE v_borradas int;
BEGIN
  SELECT count(*) INTO v_borradas FROM personas WHERE id IN (66, 67, 68, 69, 70, 71);
  IF v_borradas <> 0 THEN
    RAISE EXCEPTION 'quedaron % de las 6 sin borrar (ver el WHERE de arriba): abortando', v_borradas;
  END IF;
END $$;

COMMIT;

\echo 'Listo: las 6 personas huerfanas se eliminaron. personas_antes - personas_despues debe ser 6.'
