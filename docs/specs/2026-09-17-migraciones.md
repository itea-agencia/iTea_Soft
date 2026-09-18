# El esquema solo cambia por una migración versionada

**Fecha:** 2026-09-17 · **Módulo:** base de datos

## El invariante

Todo cambio de esquema que llegue a producción **está en un archivo de migración
versionado**. No hay otra vía.

## Qué había antes

El deploy corría `prisma db push --accept-data-loss`. Eso sincroniza la base con
`schema.prisma` sin dejar rastro de qué cambió ni cuándo, y **el flag borra sin
preguntar**: una columna que desaparece del schema desaparece de producción, con sus datos.

Los problemas concretos que causó:

- **Nadie podía saber qué tenía una base.** Producción terminó con la tabla
  `pagos_proveedor` y la columna `nro_vuelo_regreso` mientras `main` no las incluía, y hubo
  que deducir por qué comparando esquemas.
- **No había forma de revertir.** Sin historial, volver atrás es escribir el SQL inverso a
  mano.
- **Las máquinas se desincronizaban en silencio.** Un `git pull` traía el schema pero no lo
  aplicaba; los campos nuevos aparecían vacíos sin ningún error.
- **Un borrado accidental era un deploy de distancia.** Quitar una columna del schema y
  hacer push bastaba.

Se conservó lo que el `db push` sí hacía bien: aplicar el esquema solo, sin pasos manuales.
`migrate deploy` hace lo mismo, pero únicamente con migraciones ya escritas y revisadas.

## Cómo quedó

| Dónde | Antes | Ahora |
|---|---|---|
| `package.json` → `build` | `prisma db push --accept-data-loss` | `prisma generate && prisma migrate deploy` |
| `Dockerfile` → `CMD` | `prisma db push && npm start` | `prisma migrate deploy && npm start` |
| `db:reset` | `db push --force-reset` + seed | `prisma migrate reset` |
| `db:push` | existía | **retirado** |

`migrate deploy` solo aplica migraciones pendientes: **nunca genera una ni borra nada por
su cuenta**. Si el esquema de la base no coincide con lo que las migraciones esperan, falla
el deploy en vez de "arreglarlo" destruyendo.

`db:push` se retiró a propósito: sincroniza el esquema sin dejar migración y deja la base
adelantada respecto del historial sin que nada lo note. Es la puerta de atrás que hace
inútil todo lo demás.

## La línea base

Producción ya tenía 51 tablas creadas por `db push` y cero historial. Se resolvió
**baselining**, el procedimiento que Prisma documenta para esto:

1. Se comprobó que el esquema real de producción coincidía **exactamente** con
   `schema.prisma` (`migrate diff` devolvió migración vacía). Sin eso, la línea base
   habría sido mentira.
2. Se generó `0_init` desde el schema: 51 tablas, 12 enums, 73 claves foráneas.
3. Se verificó aplicándola sobre una base limpia: el resultado coincide con
   `schema.prisma`.
4. Se marcó como ya aplicada en local y en producción con `migrate resolve --applied 0_init`.

`0_init` **no se ejecuta** en las bases que ya existían: queda registrada como aplicada.
Una base nueva sí la corre y obtiene el esquema completo.

## Cómo se hace un cambio de esquema

```bash
# 1. Editar backend/prisma/schema.prisma

# 2. Generar y aplicar la migración en local, con nombre descriptivo
cd backend && npm run db:migrate -- --name agregar_asiento_regreso

# 3. Revisar el SQL que generó antes de seguir
cat prisma/migrations/*agregar_asiento_regreso/migration.sql

# 4. Commitear el schema Y la migración juntos
git add prisma/schema.prisma prisma/migrations/
```

El deploy la aplica solo: `migrate deploy` corre en el build y en cada arranque del
contenedor, y es idempotente.

Para ver el SQL **sin** aplicarlo —útil cuando el cambio es delicado y se quiere editar el
archivo a mano antes:

```bash
npm run db:migrate -- --create-only --name lo_que_sea
```

### Comprobar el estado

```bash
cd backend && npm run db:status          # local
DATABASE_URL="$PROD" DIRECT_URL="$PROD" npx prisma migrate status   # producción
```

## Cuando el cambio borra o mueve datos

Una migración que elimina o renombra una columna **pierde lo que había**. Prisma escribe el
`DROP`, no el traslado. El orden es:

1. Agregar lo nuevo en una migración.
2. Mover los datos con un script en [`backend/db-manual/`](../../backend/db-manual/README.md):
   transaccional, con conteo antes y después, y una guarda que aborte si no cuadra.
3. Quitar lo viejo en una **segunda** migración, después de correr el script en producción.

Así se hizo cuando el asiento pasó del producto al pasajero. Juntar los tres pasos en uno
es exactamente lo que el `--accept-data-loss` permitía y esta spec viene a impedir.

## Dos trampas

**`.gitignore` tiene `*.sql`.** Está para que los volcados de base no entren al repo, pero
también tapaba los archivos de migración: la carpeta habría viajado vacía y `migrate
deploy` no habría aplicado nada. Hay una excepción explícita para
`backend/prisma/migrations/**/*.sql`.

**El contenedor lleva el código horneado.** Un `git pull` no trae las migraciones nuevas al
contenedor en ejecución. Después de cada pull: `docker compose up -d --build`.

## Cómo verificarlo

```bash
cd backend && npm run db:status
```

Tiene que decir `Database schema is up to date!`. Si dice que hay migraciones pendientes,
la base está atrás; si reporta deriva, alguien tocó el esquema fuera del historial.

## La configuración

La configuración vive en `backend/prisma.config.ts`, no en `package.json`: el bloque
`prisma` queda obsoleto en Prisma 7 y con él se habría perdido el seed de `migrate reset`.

**Efecto secundario que conviene saber:** en cuanto existe ese archivo, Prisma deja de
cargar el `.env` por su cuenta —lo dice al arrancar: *"Prisma config detected, skipping
environment variable loading"*— y todo comando de migración falla con `P1012` por no
encontrar `DATABASE_URL`. Por eso la config empieza con `import 'dotenv/config'`. Dentro de
Docker esa línea no hace nada, porque `.dockerignore` excluye el `.env` y las variables
llegan por `env_file`; fuera de Docker es indispensable.

## Lo que queda abierto

- **Las migraciones anteriores al 17 de septiembre de 2026 no existen.** `0_init` es una
  foto del esquema tal como quedó, no su historia. Lo anterior está en los mensajes de
  commit y en `docs/designs/`.
