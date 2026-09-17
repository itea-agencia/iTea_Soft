# iTea Soft

ERP de agencia de viajes para **Samtur Travel Agency**. Registra ventas de diecisiete tipos
de servicio, emite vouchers en PDF y factura contra Siigo.

## Stack

| Capa | Qué |
|---|---|
| Backend | Node + Express 5, Prisma 6, PostgreSQL |
| Frontend | React 19, Vite 6, TypeScript, Tailwind 3 |
| PDF | jsPDF + html2canvas, renderizando un componente oculto |
| Despliegue | Backend en Render, base en Supabase, frontend en Vercel |

## Levantarlo

```bash
cp backend/.env.example backend/.env   # y completar; ese archivo explica cada variable
docker compose up -d --build
```

- Frontend en `http://localhost`, backend en `:3000`, PostgreSQL en `:5440`.
- El backend corre `prisma db push` al arrancar, así que la base se sincroniza sola.

### Dos cosas que muerden

**El código va horneado en la imagen.** El `Dockerfile` hace `COPY . .` y ni el backend ni
el frontend montan el fuente (el backend solo monta `uploads`). Un `git pull` **no
actualiza los contenedores**: hay que reconstruir.

```bash
docker compose up -d --build     # después de cada pull
docker exec -i itea_postgres psql -U postgres -d samtur-development \
  < backend/db-manual/verificar_schema_local.sql   # confirma que la base quedó al día
```

Si algún objeto aparece como `FALTA`, el `db push` del arranque abortó: corre
`docker exec itea_backend npx prisma db push --accept-data-loss` y reinicia.

**El puerto de la base es 5440 desde el host** (5440 → 5432 adentro). Los comandos que se
corren fuera de Docker, como `npx prisma db push`, usan el `DATABASE_URL` de
`backend/.env`, que debe apuntar a 5440.

## No hay archivos de migración

El `buildCommand` de Render corre `prisma db push --accept-data-loss`: el esquema se
sincroniza solo desde `schema.prisma` y **cualquier columna que desaparezca del schema se
borra sin aviso**. Antes de quitar una columna con datos hay que mover el dato primero.

Los cambios de esquema que además necesitan mover datos viven en
[`backend/db-manual/`](backend/db-manual/README.md), con su estado y cómo correrlos.

## El modelo de una venta

```
Ventas
  └── DetalleVenta (uno por servicio, con su proveedor, costo, TA y método de pago)
        ├── Prod* (17 tablas, una por categoría: ProdTiqueteria, ProdHoteleria, ...)
        ├── PasajerosDetalle (las personas, con su asiento, booking y tiquete)
        ├── PagosProveedor (cuando un servicio se le paga a varios proveedores)
        └── parentDetalleId → otro DetalleVenta (un servicio que cuelga de un paquete)
```

Dos reglas que atraviesan todo el modelo, y que se rompieron varias veces antes de quedar
escritas:

- **Lo que es de una persona vive en la persona.** El asiento, el booking y el tiquete son
  por pasajero. Nunca se heredan del producto.
- **El servidor manda sobre el dinero.** Los totales se derivan de las filas; no se aceptan
  del cliente aunque los mande.

Ambas están desarrolladas en [`docs/specs/`](docs/specs/README.md).

## Facturación en Siigo

Las facturas se crean **sin `stamp.send`**, así que quedan en `Draft`: existen en Siigo y
no están timbradas ante la DIAN. El timbrado es manual.

Ojo con la diferencia, que es fácil de confundir y cara:

- `SIIGO_DRY_RUN=true` → **no se crea nada**, ni borrador. Solo se guarda el payload.
- Dry run apagado → la factura **sí se crea**, en borrador.

La sandbox y la cuenta real comparten host: lo único que las separa son las credenciales.
Por eso hay un guardarraíl que **bloquea la emisión si la base de datos es local**
(409 `SIIGO_EMISION_BLOQUEADA`), salvo que se ponga `SIIGO_ALLOW_LOCAL_EMISION=true`.

Detalle completo en [`docs/specs/2026-09-17-facturacion-siigo.md`](docs/specs/2026-09-17-facturacion-siigo.md).

## Documentación

| Carpeta | Qué contiene |
|---|---|
| [`docs/specs/`](docs/specs/README.md) | Los invariantes del dominio: qué debe cumplirse y por qué |
| `docs/designs/` | Diseños por funcionalidad, escritos antes de implementar |
| [`backend/db-manual/`](backend/db-manual/README.md) | Operaciones manuales sobre la base, con su estado |
| `CLAUDE.md` | Convenciones del repo para quien trabaje acá, humano o agente |

## Pruebas

No hay suite automatizada. La verificación es empírica: se prueba contra la base local por
la API y se comprueba con SQL. Las specs traen consultas de verificación para los
invariantes que importan.
