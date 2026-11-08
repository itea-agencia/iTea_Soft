# Venta a nombre de otro asesor

> Escrito el 2026-11-08. Rama `feat/venta-a-nombre-de-otro`, desde `main`.

## El problema

El paso 1 del asistente de venta tiene un campo "Asesor *". Viene con el usuario logueado y
deja elegir a otro. **La elección no se guarda**: el frontend manda `asesorId`
(`NewSaleWizard.tsx`, en el payload de creación) y el backend lo ignora y guarda
`usuarioId: req.user.id` (`sales.controller.js`, `ventaCreateData`). Se comprobó con una venta
real: un admin la cargó eligiendo a un asesor y quedó a nombre del admin. La pantalla afirma
algo que no hace (invariante 4).

Para un asesor o un freelancer, además, la lista está vacía. Sale de `GET /users`, que exige
`users.view`, y en producción ese permiso solo lo tiene el rol admin. Si borra el nombre que
viene por defecto, no hay a quién elegir.

Hay un tercer problema, menor: el Combobox busca al usuario **por nombre**. Si el texto
escrito no coincide con nadie, cambia el nombre que se ve pero deja el `asesorId` anterior, y
con dos usuarios del mismo nombre elige al primero.

## Lo que se decidió (con el usuario)

1. **Cualquier usuario que pueda crear ventas puede cargar una venta a nombre de otro.**
   Admin, asesor o freelancer, y a nombre de cualquier usuario activo, admins incluidos.
2. **La venta es del asesor elegido.** Va en `ventas.usuario_id`, que ya decide quién la ve
   con "Propios", la comisión del asesor, las estadísticas y los filtros por asesor.
3. **Queda registrado quién la cargó**, en una columna nueva `ventas.creado_por_id`. Solo en
   la base: no se muestra en ninguna pantalla.

## Lo que se decidió sin respuesta explícita (decisión del agente)

4. **Quien la carga a nombre de otro, con "Propios", deja de verla.** Se pregunta, no hubo
   respuesta, y se mantiene la regla actual: dueño = `usuario_id`. Medido en producción el
   2026-11-08, solo afecta al rol **freelancer** (`sales.view = own`); asesor tiene `all` y
   admin `true`. Si el freelancer tiene que seguir viendo lo que cargó, el cambio es que el
   filtro "Propios" de ventas mire `usuario_id = yo OR creado_por_id = yo`. No se hace ahora.
5. **El asesor no se cambia después de creada la venta.** La ventana de edición no toca hoy
   ni ese ni ningún dato de producto. Queda fuera.

## Cómo

### Base

Migración `ventas_creado_por_id`:

```sql
ALTER TABLE "ventas" ADD COLUMN "creado_por_id" INTEGER;
UPDATE "ventas" SET "creado_por_id" = "usuario_id";
ALTER TABLE "ventas" ALTER COLUMN "creado_por_id" SET NOT NULL;
ALTER TABLE "ventas" ADD CONSTRAINT "ventas_creado_por_id_fkey"
  FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

El relleno va dentro de la migración, y no en un script de `db-manual/`, porque es exacto: hasta
hoy el único camino que crea ventas es `salesController.create`, y siempre guardó
`usuario_id = req.user.id`. Por eso, en todas las ventas existentes quien la cargó es su
`usuario_id`. Se revisó que ningún script de `backend/scripts/` ni de `db-manual/` cree ventas
o reasigne `usuario_id`; `baja_de_admin.sql` solo las cuenta. No se borra ni se mueve nada:
es copiar un dato que ya está. En producción son 171 ventas.

`NOT NULL` desde el principio: toda venta tiene quien la cargó, a diferencia de los
`creado_por_id` de usuarios, clientes y responsables, que se agregaron cuando ya había
registros sin dueño conocido.

Schema: `creadoPorId Int @map("creado_por_id")` en `Ventas`, con la relación
`"venta_creado_por"` y su contraparte en `Usuarios`, siguiendo el patrón de
`usuario_creado_por`.

### Backend

- **`POST /sales`**: lee `data.asesorId`. Si no viene, usa `req.user.id`, como ahora. Si
  viene, tiene que ser un usuario con `status = active` y `deletedAt = null`. Si no lo es,
  responde **400** con el código `ASESOR_INVALIDO` y la venta no se crea. Guarda
  `usuarioId = asesor` y `creadoPorId = req.user.id`. La validación va antes de la
  transacción.
- **`GET /users/asesores`**: devuelve `{ id, name }` de los usuarios activos y no eliminados,
  ordenados por nombre. Se protege con `authorize('sales', 'create')`, que es justo quien
  necesita la lista, y no con `users.view`, que expone la ficha completa. Va **antes** de
  `GET /users/:id` en `users.routes.js`; si no, `:id` captura `asesores`. No agrega permiso
  al catálogo.

### Frontend

- `api/users.ts`: `listAsesores()`.
- `Step1Client.tsx`: las opciones salen de `listAsesores()` y no de `data.users`. Se cargan
  al montar el paso y no van a la caché de `DataContext`, porque cambian poco y son pocas filas.
- El Combobox elige **por id**. Si el texto escrito no coincide con ninguna opción, el
  `asesorId` queda vacío y la validación del paso 1 pide elegir un asesor. Así ya no se manda
  un id que no corresponde con el nombre que se ve.
- El valor por defecto sigue siendo el usuario logueado.

### Spec, primero

`docs/specs/2026-09-21-autenticacion-y-autorizacion.md`, fila "Propiedad del dato": hoy dice
que el dueño de una venta "es quien la hizo". Pasa a decir que el dueño es **el asesor de la
venta** (`usuario_id`), que puede no ser quien la cargó (`creado_por_id`).

## Cómo se verifica

- **La prueba que falla, antes de tocar código.** Con permiso, crear por la API una venta con
  `asesorId` de otro usuario: hoy queda con `usuario_id` igual a quien hizo la petición.
- **Después del cambio:**
  - la misma petición deja `usuario_id = asesorId` y `creado_por_id = quien la cargó`;
  - un `asesorId` inactivo, eliminado o inexistente da 400 y no crea la venta (conteo de
    `ventas` igual antes y después);
  - sin `asesorId`, ambos campos quedan con quien la cargó.
- **SQL tras la migración:** `count(*) WHERE creado_por_id IS NULL` = 0, y
  `count(*) WHERE creado_por_id <> usuario_id` = 0 antes de la primera venta a nombre de otro.
- **Con el token de un asesor:** `GET /users/asesores` da 200 con solo `id` y `name`, y
  `GET /users` sigue en 403.
- **Lo que no se puede verificar acá:** el Combobox en pantalla.

## Lo que queda abierto

- La decisión 4: un freelancer que carga a nombre de otro pierde la venta de vista.
- La decisión 5: no se puede reasignar una venta ya creada.
- Cualquiera que cree ventas puede atribuírselas a otro, y con eso mover a quién se le cuenta
  la venta. `creado_por_id` deja el rastro, pero no hay pantalla que lo muestre. Si hace falta
  auditar, por ahora es una consulta SQL.
