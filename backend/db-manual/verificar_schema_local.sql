SELECT 'tabla pagos_proveedor' AS objeto,
       CASE WHEN to_regclass('public.pagos_proveedor') IS NULL THEN 'FALTA' ELSE 'ok' END AS estado
UNION ALL
SELECT 'enum ConceptoPago',
       CASE WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname='ConceptoPago') THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'prod_planes.nro_vuelo_regreso',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='prod_planes' AND column_name='nro_vuelo_regreso') THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'prod_planes.nro_reserva_vuelo',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='prod_planes' AND column_name='nro_reserva_vuelo') THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'prod_planes.referencia_hotel',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='prod_planes' AND column_name='referencia_hotel') THEN 'ok' ELSE 'FALTA' END
UNION ALL
SELECT 'pasajeros_detalle.asiento_regreso',
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns
                         WHERE table_name='pasajeros_detalle' AND column_name='asiento_regreso') THEN 'ok' ELSE 'FALTA' END;
