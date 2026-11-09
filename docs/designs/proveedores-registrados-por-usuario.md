# Proveedores registrados por usuario en el dashboard

## Problema

La tarjeta "Proveedores" del dashboard muestra "N activos", pero N es el total de filas de `proveedores`, sin importar el periodo ni quién las cargó, y con alcance "propios" vale siempre 0. La gerencia quiere ver cuántos proveedores registró el usuario en el rango de fechas elegido.

La tabla `proveedores` no guarda quién creó cada fila ni cuándo: no tiene `creado_por_id` ni `creado_at`. Con los datos de hoy ese número no se puede calcular.

## Objetivo

- Cada proveedor nuevo guarda quién lo registró y cuándo.
- La tarjeta muestra "N registrados": los proveedores creados dentro del rango de fechas del dashboard, con el alcance del usuario.

## Fuera de alcance

- Inventar dueño o fecha para los proveedores que ya existen. No hay de dónde sacarlos: quedan en null y no se cuentan en ningún rango.
- Cambiar el valor grande de la tarjeta (los costos de proveedor del periodo). Solo cambia el detalle "N registrados".
- Filtrar por dueño el módulo de proveedores de Configuración.

## Diseño

**Esquema** (una migración, solo agrega columnas):

- `proveedores.creado_por_id` (Int, nullable, FK a `usuarios`): mismo nombre y forma que en `clientes`, `responsables` y `comisionistas`.
- `proveedores.creado_at` (DateTime, nullable): sin default en la migración, para que las filas existentes queden en null y no con la fecha del deploy. El código lo escribe al crear.

**Dónde se crean proveedores** (los dos sitios escriben las dos columnas):

- `config.controller.js`, alta genérica de Configuración (`tx[config.model].create`, modelo `proveedores`).
- `config.controller.js:368`, el proveedor que se crea solo al registrar un alojamiento con un proveedor nuevo.

**Dashboard** (`stats.controller.js`): `supplierCount` pasa a contar proveedores con `creado_at` dentro del rango y, con alcance "propios", `creado_por_id` igual al usuario. El texto de la tarjeta pasa de "N activos" a "N registrados".

## Decisiones y alternativas

| Decisión | Elegimos | Descartamos | Por qué |
|---|---|---|---|
| Cómo contar | Columnas nuevas con quién y cuándo | Proveedores usados en las ventas del rango | La gerencia pidió "registrados", no "usados" (decisión del usuario, 2026-11-09). |
| Nombre de las columnas | `creado_por_id`, `creado_at` | Nombres en inglés | Los nombres de la base no se traducen (CLAUDE.md), y estas columnas ya existen con esos nombres en las tablas hermanas. |
| Filas existentes | null | Fecha del deploy, o el admin como dueño | Cualquier valor sería inventado y se contaría en un rango donde no corresponde (invariante 4). |

## Riesgos y desconocidos

- Desde el deploy hasta que se registren proveedores nuevos, la tarjeta muestra 0. Es correcto, pero puede parecer un error. Conviene avisarle a la gerencia.
- Para el admin (alcance "todos"), "registrados" cuenta los de cualquier usuario. Lo confirma el usuario antes de implementar.

## Plan de implementación

1. Agregar las dos columnas en `schema.prisma` y generar la migración con `npm run db:migrate -- --name proveedores_creado_por` (requiere permiso, regla 4).
2. Escribir `creadoPorId` y `creadoAt` en los dos sitios que crean proveedores.
3. `supplierCount` con rango y alcance; texto "N registrados".
4. Verificar: crear un proveedor por la API, comprobar por SQL que quedaron las dos columnas, y comprobar que el dashboard lo cuenta en el rango que corresponde y no fuera de él.

## Lo que queda abierto

- La migración tiene que aplicarse en producción con el deploy: Render corre `prisma migrate deploy` solo. No mueve datos, así que no necesita un script de `db-manual/`.
