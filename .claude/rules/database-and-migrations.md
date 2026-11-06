---
paths:
  - "backend/prisma/**"
  - "backend/db-manual/**"
  - "backend/scripts/**"
---

# Base de datos y migraciones

**Todo cambio de esquema va en una migración.** El deploy corre `prisma migrate deploy`,
que solo aplica migraciones ya escritas. Editar el schema y no generar la migración deja la
base atrás sin que nada avise: `npm run db:migrate -- --name lo_que_cambia` (desde
`backend/`, con permiso), y se commitea el schema junto con la migración. **`db:push` se
retiró a propósito**: sincronizaba sin dejar historial. No lo restaures.

**Si el cambio borra o mueve datos**, va en etapas: primero se agrega lo nuevo, después se
mueven los datos con un script de `backend/db-manual/` (transaccional, con conteo antes y
después y una guarda que aborta si algo no cuadra), y recién entonces se quita lo viejo en
una segunda migración.

`backend/scripts/` son arreglos puntuales de ventas concretas (`fix_sale_85_prod.js`), no
herramientas: no se reutilizan. Lo que mueve datos de producción va en `backend/db-manual/`,
y su estado se anota en el README de esa carpeta.
