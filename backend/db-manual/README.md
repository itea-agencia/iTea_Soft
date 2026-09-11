# Operaciones manuales sobre la base

Este proyecto **no tiene archivos de migración**: el `buildCommand` de Render corre
`prisma db push --accept-data-loss`, así que el esquema se sincroniza solo y cualquier
columna que desaparezca del `schema.prisma` se borra sin aviso.

Eso deja un hueco: los cambios de esquema que además necesitan **mover datos** no tienen
dónde vivir. Estos scripts son ese lugar. Se corren a mano, una vez, contra producción.

Están versionados a propósito, aunque `.gitignore` tenga una regla `*.sql`: esa regla
existe para que los volcados de base no entren al repo, y la excepción nombra solo esta
carpeta. **No guardes dumps acá.**

## Cómo se corren

Los `.sh` leen `DIRECT_URL` de `backend/.env.production` —el *session pooler*, puerto
5432; el *transaction pooler* del 6543 no sirve para `psql`— y no dependen de node ni de
dotenv. Se pueden correr desde cualquier directorio:

```bash
./backend/db-manual/backfill_pagos_proveedor_paquetes.sh
```

Cada uno abre una transacción, imprime un conteo antes y después, y aborta si algo no
cuadra. Ninguno tiene credenciales embebidas.

## Estado

| Script | Qué hace | Estado |
|---|---|---|
| `verificar_schema_local.sql` | Dice si una base local tiene los objetos que el branch necesita. Útil después de un `git pull`, porque los contenedores llevan el código horneado y un pull no los actualiza. | diagnóstico, se puede correr siempre |
| `fix_nit_proveedores.{sh,sql}` | Quita el dígito de verificación del NIT de dos proveedores. Siigo registra el NIT sin él y rechaza la factura con `The customer doesn't exist`. | **pendiente en producción** |
| `backfill_asiento_regreso_tiqueteria.{sh,sql}` | Rescata el asiento de regreso que quedaba guardado en el tramo de vuelo, donde no distingue de qué pasajero es. Migra solo los tiquetes de un pasajero, donde no hay ambigüedad, y aplica a mano los de la venta 142. Lista los que quedan para revisar. | **pendiente en producción** |
| `backfill_pagos_proveedor_paquetes.{sh,sql}` | Convierte el costo propio de los paquetes en una fila de `pagos_proveedor` con concepto `paquete`. Aditivo: no cambia ningún total ni ninguna factura. | **pendiente en producción** |
| `backfill_asientos_viajes_terrestres.js` | Movió el asiento de viajes terrestres del producto al pasajero, antes de borrar `prod_viajes_terrestres.numero_asiento`. | **aplicado y ya no ejecutable**: las columnas que lee no existen. Queda como registro de qué se le hizo a esos datos. |

## Lo que NO va acá

Scripts de prueba, arreglos de una venta puntual y cualquier cosa destructiva siguen en
`backend/scripts/`, que está ignorada. Si un script se va a correr contra producción y
necesita existir en otra máquina, va acá.
