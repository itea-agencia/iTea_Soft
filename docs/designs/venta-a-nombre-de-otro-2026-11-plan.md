# Venta a nombre de otro: plan de implementación

> **Para quien lo ejecute:** en este repo no se usan subagentes salvo que el usuario lo pida
> (`CLAUDE.md`, regla 5). Se ejecuta en línea con `superpowers:executing-plans`. Los pasos
> usan casillas (`- [ ]`).

**Objetivo:** que la venta quede a nombre del asesor elegido en el asistente y que en la base
quede quién la cargó.

**Arquitectura:** una columna nueva `ventas.creado_por_id`, rellenada en su migración.
`POST /sales` valida el `asesorId` y lo guarda. Una ruta `GET /users/asesores` da la lista sin
`users.view`. El asistente elige al asesor por id, como ya hace con el cliente.

**Stack:** Express 5 + Prisma 6 + PostgreSQL; React 19 + TS.

**Diseño:** `docs/designs/venta-a-nombre-de-otro-2026-11.md`.

## Restricciones globales

- Rama `feat/venta-a-nombre-de-otro`. Verificar con `git rev-parse --abbrev-ref HEAD` antes de
  cada commit. Push de la rama; **no** se mergea a `main`.
- Necesitan permiso del usuario en el chat, cada vez: `npm run db:migrate`,
  `docker compose up -d --build backend|frontend` y todo `curl` contra la app local.
- Código de error del asesor inválido: `ASESOR_INVALIDO`, HTTP **400**, mensaje
  `El asesor elegido no existe o no está activo`.
- La ruta nueva se protege con `authorize('sales', 'create')`. No se agrega nada al catálogo
  de permisos.
- `creado_por_id` no entra en ningún filtro ni se muestra en pantalla.
- Commits en español, con el problema antes de la solución, terminando con
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Puntos de revisión

1. **El asesor se desactiva entre que se abre el asistente y se guarda.** El backend responde
   400 `ASESOR_INVALIDO` y el asistente muestra ese mensaje, que ya sale de
   `err.response.data.error.message`. La venta no se crea. Se prueba en la tarea 2, paso 4.
2. **`asesorId` llega como texto, `"abc"`, `0` o negativo.** Da 400, no un 500 de Prisma.
   Tarea 2, paso 4.
3. **Un borrador guardado en `localStorage` trae el `asesorId` de alguien que ya no está
   activo.** El paso 1 lo rechaza porque no está en la lista. Tarea 3, paso 3.
4. **`GET /users/asesores` queda detrás de `/:id`.** Respondería "usuario no encontrado". Se
   define antes en `users.routes.js` y se prueba en la tarea 2, paso 4.
5. **Un freelancer crea una venta a nombre de otro.** La crea, pero no la ve en su listado.
   Es lo esperado (decisión 4), y `addSale` no vuelve a pedir la venta por id, así que no da
   404 al guardar. Tarea 4, paso 2.

---

### Tarea 1: spec, columna y migración

**Archivos:**
- Modificar: `docs/specs/2026-09-21-autenticacion-y-autorizacion.md` (fila "Propiedad del
  dato")
- Modificar: `backend/prisma/schema.prisma`, en `model Ventas` y `model Usuarios`
- Crear: `backend/prisma/migrations/<timestamp>_ventas_creado_por_id/migration.sql`

**Interfaces:**
- Produce: `Ventas.creadoPorId Int` (`@map("creado_por_id")`), con la relación
  `creadoPor Usuarios @relation("venta_creado_por", ...)` y, en `Usuarios`,
  `ventasCreadas Ventas[] @relation("venta_creado_por")`. La relación existente
  `"ventas_asesor"` no cambia.

- [ ] **Paso 1: actualizar la spec.** Donde dice que el dueño de una venta "es quien la
  hizo", pasa a decir: "el asesor de la venta (`usuario_id`), que puede no ser quien la
  cargó (`creado_por_id`, solo para auditoría; no entra en ningún filtro)".
- [ ] **Paso 2: la verificación que falla (solo lectura).**
  `docker exec -i itea_postgres psql -U postgres -d samtur-development -c "SELECT creado_por_id FROM ventas LIMIT 1"`
  Esperado: `ERROR: column "creado_por_id" does not exist`.
- [ ] **Paso 3: schema y migración.** Con permiso: `npm run db:migrate -- --name ventas_creado_por_id`
  desde `backend/`. Si Prisma genera solo el `ADD COLUMN ... NOT NULL`, falla porque hay
  filas. Se edita el SQL generado para que quede como en el diseño (sección "Base"): agregar
  la columna nullable, `UPDATE ventas SET creado_por_id = usuario_id`, `SET NOT NULL` y la FK.
  Después, `npm run db:status` sin migraciones pendientes.
- [ ] **Paso 4: verificar.**
  `SELECT count(*) FILTER (WHERE creado_por_id IS NULL), count(*) FILTER (WHERE creado_por_id <> usuario_id), count(*) FROM ventas;`
  Esperado: `0 | 0 | <total>`.
- [ ] **Paso 5: commit.** Spec, `schema.prisma` y la carpeta de la migración.

### Tarea 2: backend, lista de asesores y `POST /sales` con `asesorId`

**Archivos:**
- Modificar: `backend/src/controllers/users.controller.js`, agregar
  `exports.listAsesores`
- Modificar: `backend/src/routes/users.routes.js`: `router.get('/asesores', authorize('sales', 'create'), usersController.listAsesores)`
  **antes** de `router.get('/:id', ...)`
- Modificar: `backend/src/controllers/sales.controller.js`, en `exports.create`
  (validación junto a las de `totales.items`/pagos, antes de la transacción) y en
  `ventaCreateData`

**Interfaces:**
- Consume: `Ventas.creadoPorId` (tarea 1).
- Produce:
  - `GET /api/v1/users/asesores` → `{ success: true, data: [{ id: number, name: string }] }`.
    Son los usuarios con `status = 'active'` y `deletedAt = null`, y `name` es
    `` `${persona.nombres} ${persona.apellidos}` ``, el mismo formato de `users.controller.js`.
    Va ordenado por nombre y sin paginar.
  - `POST /sales` acepta `asesorId` (número o texto numérico). Si no viene, usa
    `req.user.id`. Guarda `usuarioId = asesor` y `creadoPorId = req.user.id`.

- [ ] **Paso 1: la prueba que falla, con permiso.** Con el backend actual, crear por `curl`
  una venta mínima con el token de un admin y `asesorId` de otro usuario activo, y leer
  `SELECT usuario_id FROM ventas ORDER BY id DESC LIMIT 1`. Esperado hoy: el id del admin.
- [ ] **Paso 2: implementar `listAsesores` y la ruta.**
- [ ] **Paso 3: implementar la validación en `create`.** Si `data.asesorId` viene:
  `Number.isInteger(n) && n > 0`, y existe un usuario con ese id, `status: 'active'` y
  `deletedAt: null`. Si no, `return error(res, 'El asesor elegido no existe o no está activo', 400, 'ASESOR_INVALIDO')`.
  En `ventaCreateData`: `usuarioId: asesorId`, `creadoPorId: req.user.id`. Antes del
  rebuild, `node --check` en los tres archivos.
- [ ] **Paso 4: verificar, con permiso** (`docker compose up -d --build backend`):

  | Petición | Esperado |
  |---|---|
  | `POST /sales` admin con `asesorId` de otro activo | 201; la fila tiene `usuario_id` = asesor y `creado_por_id` = admin |
  | `POST /sales` sin `asesorId` | 201; ambos = quien hizo la petición |
  | `asesorId` de un usuario inactivo, `"abc"`, `0` y `999999` | 400 `ASESOR_INVALIDO`; `count(*)` de `ventas` igual antes y después |
  | `GET /users/asesores` con token de asesor | 200; cada elemento tiene solo las claves `id` y `name` |
  | `GET /users` con token de asesor | 403, igual que antes |

  Las ventas de prueba se anulan o se borran de la base local al terminar. Es la base local,
  no producción.
- [ ] **Paso 5: commit.**

### Tarea 3: frontend, elegir al asesor por id

**Archivos:**
- Modificar: `frontend/src/api/users.ts` (y su reexport en `api/index.ts`)
- Modificar: `frontend/src/components/sales/NewSaleWizard.tsx`: carga de la lista,
  `validateStep(1)` y el payload, donde hoy dice `asesorId: Number(form.asesorId) || user!.id`
- Modificar: `frontend/src/components/sales/steps/Step1Client.tsx`, el Combobox "Asesor *"

**Interfaces:**
- Consume: `GET /users/asesores` (tarea 2).
- Produce: `listAsesores(): Promise<{ id: number; name: string }[]>` en `api/users.ts`, que
  devuelve `res.data.data`. `Step1Client` recibe la prop `asesores: { id: number; name: string }[]`.

- [ ] **Paso 1: `listAsesores` y la carga.** El asistente la pide una vez al montarse y la
  guarda en un estado local, sin pasar por la caché de `DataContext`. Si falla, la lista
  queda vacía y el paso 1 lo dice con su error.
- [ ] **Paso 2: el Combobox.** Se copia el patrón del campo "Cliente":
  `value={form.asesorId}`, `onChange={(val) => set("asesorId", val)}` y
  `options={asesores.map(a => ({ value: String(a.id), label: a.name }))}`. El texto escrito
  que no coincide queda en `asesorId` y lo frena la validación. `asesorName` se deja de
  escribir desde este campo.
- [ ] **Paso 3: la validación.** En `validateStep(1)`, si `!asesores.some(a => String(a.id) === String(form.asesorId))`,
  entonces `errs.asesorId = "Elija un asesor de la lista"`, y el `FormField` "Asesor *" muestra
  `errors.asesorId`. Esto cubre el texto suelto, el campo vacío y el borrador con un asesor
  inactivo.
- [ ] **Paso 4: el payload.** `asesorId: Number(form.asesorId)`, sin `|| user!.id`. Se quita
  `asesorName` del payload, porque el backend no lo lee (comprobado con
  `grep -n asesorName backend/src/controllers/sales.controller.js`: solo aparece en
  respuestas).
- [ ] **Paso 5: verificar.** `cd frontend && npx tsc --noEmit` sin errores, y `npm test`
  sigue dando 6 de 6. En pantalla no se puede verificar acá: queda para el usuario (tarea 4).
- [ ] **Paso 6: commit.**

### Tarea 4: verificación de punta a punta y cierre

- [ ] **Paso 1: con permiso**, `docker compose up -d --build frontend backend`. Comprobar
  que el bundle servido contiene "Elija un asesor de la lista", con `grep` dentro del
  contenedor.
- [ ] **Paso 2: orden de pruebas en pantalla, para el usuario.**
  1. Admin: crear una venta eligiendo a un asesor. En el listado figura con ese asesor.
  2. Asesor: el campo trae su nombre. Al borrarlo aparece la lista de usuarios activos.
     Elige a otro y guarda.
  3. Escribir un nombre que no existe y pasar al paso 2: aparece "Elija un asesor de la
     lista".
  4. Freelancer, si hay uno en la base local: crear una venta a nombre de otro. Se guarda
     sin error y no aparece en su listado.
- [ ] **Paso 3: SQL.** Las ventas del paso 2 tienen `creado_por_id` igual a quien las cargó.
- [ ] **Paso 4: push de la rama** y "Lo que queda abierto" del diseño al día.
