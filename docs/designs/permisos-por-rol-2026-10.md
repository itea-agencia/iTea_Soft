# Permisos por rol: un catálogo, todas las acciones, todos los alcances

> Diseño acordado el 2026-10-24 en una sesión de preguntas (27 decisiones, listadas abajo).
> Sigue al plan de corrección de octubre
> ([`correccion-vulnerabilidades-2026-10.md`](correccion-vulnerabilidades-2026-10.md)) y
> absorbe su fase F6. Al implementarlo, la spec
> [`autenticacion-y-autorizacion`](../specs/2026-09-21-autenticacion-y-autorizacion.md) se
> actualiza primero.

## Problema

Los permisos son globales por rol (admin, asesor, freelancer), y eso se mantiene. Lo que
falla es todo lo demás: qué acciones existen, cómo se guardan, quién las cambia y si se
aplican sobre el dato.

### Un asesor puede darse cualquier permiso

`PUT /roles/:role/permissions` exigía solo `config.edit`, y en producción el rol asesor lo
tiene. Un asesor podía reescribir los permisos de su propio rol (anular ventas, gestionar
usuarios, liquidar comisiones) y crear filas basura en el catálogo, porque el endpoint
aceptaba cualquier módulo y acción. Se corrige aparte, con un hotfix (`requireAdmin`), antes
de este diseño.

### El panel no muestra los permisos que existen

- "Anular" depende de `sales.delete`, que el panel no muestra: ningún no-admin lo tiene y no
  hay forma de darlo.
- `sales.edit` autoriza a la vez registrar pagos, borrar pagos, facturar en Siigo y marcar
  revisada. Desde F4 no existe ningún endpoint de edición de venta, así que "Editar" solo
  significa esas cuatro cosas, mezcladas.
- `responsables.delete` cubre desactivar (reversible, con chequeo de deuda) y eliminar
  (definitivo, **sin** chequeo de deuda).
- `commissions.create` cubre dar de alta un comisionista y liquidarle comisiones.
- `config.create` no lo comprueba ninguna ruta: crear, editar y borrar catálogos dependen de
  `config.edit`.
- El catálogo de la base tiene 32 permisos (8 módulos × 4 acciones), varios sin ruta:
  `dashboard.create/edit/delete`, `itineraries.create/delete`, `clients.delete`.
- Usuarios y Dashboard no aparecen en el panel. El Dashboard con "Todos" se lee como
  "Propios" para cualquier no-admin.

### Cuatro copias de la misma estructura, que no coinciden

`MODULE_ACTIONS` (roles.controller), `ADMIN_PERMISSIONS` y `normalizarValor` (backend), y
`RolePermissions`, `DEFAULT_*_PERMISSIONS` y `buildPermissionsFromApiPermisos` (frontend).
Ya divergen: para un `sales.edit = 'true'` —el del freelancer en producción— el frontend
entiende "Todas" y el backend aplica "Propias".

### "Propios" solo se aplica en ventas e itinerarios

`clients.getById`, `update` y `toggleStatus` no miran el alcance;
`/clients/:id?includeSales=true` devuelve hasta 50 ventas de cualquier asesor. Responsables
ofrece "Propios" en el panel pero el backend lo ignora, y su tabla ni siquiera guarda quién
lo creó. Hoy no afecta a nadie (no hay freelancers activos), pero tiene que estar antes de
activar uno.

### Otros huecos encontrados en la revisión

- Registrar un cliente cuyo documento ya es de una persona (un pasajero, un comisionista)
  sobrescribe el nombre, el correo y el teléfono de esa persona.
- Un freelancer no puede cargar los catálogos del asistente de ventas: `/config/all` exige
  `config.view` y no lo tiene.
- `GET /roles/:role/permissions` lo lee cualquier usuario con sesión.
- `logs_usuarios` existe y no se usa: no queda rastro de quién cambió permisos, dio de baja,
  anuló o facturó.

Estado de producción al 2026-10-24: 2 admins (ids 1 y 4), 2 asesores, 0 freelancers activos.

## Objetivo

- Un solo catálogo declara cada permiso que existe; backend, panel y frontend salen de ahí.
- El panel muestra **todas** las acciones de **todos** los módulos, con su tipo (alcance o
  sí/no), y solo el admin lo edita.
- Cada acción con alcance se aplica sobre el dato: "Propios" es "Propios" en todo recurso.
- El día del cambio nadie gana ni pierde un permiso.
- Las acciones sensibles quedan auditadas.

## Fuera de alcance

- Roles nuevos o permisos por usuario. Los roles siguen siendo tres y fijos (decisión 1).
- Pantalla de auditoría: se consulta con SQL (decisión 27).
- Corregir datos de negocio (ventas 84, 86, 93).
- Mover el token a cookie httpOnly.

## Decisiones

| # | Pregunta | Decisión |
|---|---|---|
| 1 | Roles | Admin, asesor y freelancer, fijos. El panel edita asesor y freelancer |
| 2 | Asesores y catálogos | Pueden todo, como hoy |
| 3 | Acciones de venta separadas de "Editar" | Registrar y borrar pagos, facturar en Siigo, anular, marcar revisada |
| 4 | Alcance de esas acciones | Con alcance (Todas/Propias/Ninguna) |
| 5 | Cliente "propio" | El que creó ese usuario |
| 6 | Cliente que existe y no es tuyo | No se le puede vender; el error lo explica |
| 7 | Activar/desactivar clientes | Permiso propio, con alcance |
| 8 | Responsable "propio" | El que creó ese usuario (columna nueva) |
| 9 | Responsables existentes | Dueño = usuario de la primera venta donde figura; sin ventas, sin dueño |
| 10 | Desactivar y eliminar responsables | Dos permisos; eliminar también chequea deuda |
| 10b | Su alcance | Con alcance |
| 11 | Itinerarios | Ver y editar check-in, con alcance; `create`/`delete` salen del catálogo |
| 12 | Liquidar comisiones | Permiso propio, separado de crear comisionista |
| 13 | Comisionista "propio" | El que creó ese usuario (columna nueva) |
| 14 | Comisionistas existentes | Mismo criterio que responsables |
| 15 | Acciones de comisionistas con alcance | Ver, editar, eliminar y liquidar |
| 16 | Elegir comisionista en el asistente | Se ven todos, solo para elegir |
| 17 | Dashboard | En el panel, con alcance; "Todos" funciona de verdad |
| 18 | Usuarios | Se pueden dar desde el panel |
| 19 | Qué roles asigna un no-admin | Asesor y freelancer; las reglas de admin siguen |
| 20 | Acciones de usuarios | Ver, crear, editar, desactivar, eliminar; con alcance (creador, columna nueva) |
| 21 | Usuarios existentes | Dueño = admin id 1 |
| 22 | Catálogos | Ver, crear, editar y eliminar separados, iguales para todos |
| 23 | Leer catálogos para vender | No pide permiso; `config.view` solo decide si se ve Gestión Interna |
| 24 | Lo que no se puede hacer | Se oculta |
| 25 | Valor inicial de las acciones nuevas | Heredan del permiso del que se separan |
| 26 | Auditoría | Cambios de permisos y acciones sensibles |
| 27 | Dónde se consulta | Solo SQL |
| — | `GET /roles/:role/permissions` | Solo admin; `GET /roles/catalogo` abierto a cualquier sesión |
| — | Cliente con documento de una persona existente | Se reutiliza la persona completando solo los campos vacíos |
| — | Qué se audita | Ver "Auditoría" |

## Diseño

### El catálogo

`backend/src/config/permisos.js` es la única definición. Cada acción declara clave,
etiqueta, tipo (`alcance` o `sino`) y, para la migración, de qué permiso hereda.

| Módulo | Acción | Etiqueta | Tipo | Hereda de |
|---|---|---|---|---|
| `sales` | `view` | Ver | alcance | — |
| | `create` | Crear | sí/no | — |
| | `pay` | Registrar y borrar pagos | alcance | `sales.edit` |
| | `invoice` | Facturar en Siigo | alcance | `sales.edit` |
| | `void` | Anular | alcance | `sales.delete` |
| | `review` | Marcar revisada | alcance | `sales.edit` |
| `clients` | `view` | Ver | alcance | — |
| | `create` | Crear | sí/no | — |
| | `edit` | Editar | alcance | — |
| | `toggle` | Activar/Desactivar | alcance | `clients.edit` |
| `responsables` | `view` | Ver | alcance | — |
| | `create` | Crear | sí/no | — |
| | `edit` | Editar | alcance | — |
| | `toggle` | Desactivar | alcance | `responsables.delete` |
| | `delete` | Eliminar | alcance | `responsables.delete` |
| `itineraries` | `view` | Ver | alcance | — |
| | `edit` | Editar check-in | alcance | — |
| `commissions` | `view` | Ver | alcance | — |
| | `create` | Crear | sí/no | — |
| | `edit` | Editar | alcance | — |
| | `delete` | Eliminar | alcance | — |
| | `settle` | Liquidar | alcance | `commissions.create` |
| `dashboard` | `view` | Ver | alcance | — |
| `users` | `view` | Ver | alcance | — |
| | `create` | Crear | sí/no | — |
| | `edit` | Editar | alcance | — |
| | `toggle` | Desactivar | alcance | — |
| | `delete` | Eliminar | alcance | — |
| `config` | `view` | Ver | sí/no | — |
| | `create` | Crear | sí/no | — |
| | `edit` | Editar | sí/no | — |
| | `delete` | Eliminar | sí/no | `config.edit` |

"Anular" pasa de `sales.delete` a `sales.void` porque anular no borra nada (invariante 5).

**Valores guardados**: `all`/`own`/`none` para alcance, `true`/`false` para sí/no. Una sola
función del backend los lee. Sin fila, no hay permiso (como hoy). El admin tiene todo, y su
mapa se deriva del catálogo en vez de escribirse a mano.

**Al heredar**, si el origen es sí/no y el destino tiene alcance, `true` pasa a `all` y
`false` a `none`: el sí/no ya valía sobre cualquier registro, así que nadie gana ni pierde.
Las comisiones del asesor en producción, por ejemplo: `commissions.create = false` da
`settle = none`.

### Datos

- Migración: `creado_por_id` (nullable, FK a `usuarios`) en `responsables`, `comisionistas`
  y `usuarios`. Al crear se guarda quién creó el registro.
- `backend/db-manual/rellenar_creado_por.{sql,sh}`: responsables y comisionistas toman al
  usuario de su primera venta (por fecha); los que no figuran en ventas quedan en null; los
  usuarios existentes quedan a nombre del admin id 1. Transaccional, con conteo antes y
  después y guarda que aborta si el admin id 1 no existe o no es admin.
- `backend/db-manual/agregar_permisos_por_accion.{sql,sh}`: crea las filas nuevas del
  catálogo y las de `permisos_rol` heredando valores. **No borra nada.** Guarda: los
  permisos efectivos de cada rol, calculados con las claves viejas y con las nuevas, tienen
  que coincidir.
- `backend/db-manual/quitar_permisos_viejos.{sql,sh}`: borra `sales.edit`, `sales.delete`,
  `clients.delete`, `itineraries.create/delete` y `dashboard.create/edit/delete`, del
  catálogo y de `permisos_rol`. Guarda: ninguna fila fuera del catálogo al terminar.

### Backend

**`authorize(modulo, accion)`** valida contra el catálogo y deja en `req.permissionScope` el
alcance de esa acción. Si una ruta usa una acción que no está en el catálogo, el backend no
arranca.

**`propio(recurso)`** reemplaza a `ventaPropia` para cualquier recurso. Va después de
`authorize`: con `all` deja pasar; con `own` busca al dueño y responde 404 si no es el
usuario (no confirmar que el id existe). Dueño por recurso:

| Recurso | Dueño |
|---|---|
| Venta, pago de una venta | `ventas.usuario_id` |
| Cliente | `clientes.creado_por_id` |
| Responsable | `responsables.creado_por_id` |
| Comisionista | `comisionistas.creado_por_id` |
| Usuario | `usuarios.creado_por_id` |
| Itinerario (tramo, plan) | usuario de la venta |

Un registro sin dueño (null) solo lo alcanza quien tenga `all`.

**Rutas**:

| Recurso | Ruta → acción |
|---|---|
| Ventas | listar, ver, detalle, ver pagos → `view` · crear → `create` · registrar/borrar pago → `pay` · facturar → `invoice` · anular → `void` · revisar → `review` · enviar voucher → `view` |
| Clientes | listar, ver → `view` · crear → `create` · editar → `edit` · activar/desactivar → `toggle` |
| Responsables | listar, ver → `view` · crear → `create` · editar → `edit` · activar/desactivar → `toggle` · eliminar → `delete` (con chequeo de deuda) |
| Itinerarios | listar, ver → `view` · check-in → `edit` |
| Comisionistas | listar → `view`, o `sales.create` para el asistente (ve todos) · ver → `view` · crear → `create` · editar → `edit` · eliminar → `delete` |
| Liquidaciones | listar → `commissions.view` (solo de sus comisionistas si es `own`) · liquidar → `commissions.settle`, con todos los comisionistas de las ventas al alcance |
| Dashboard | todas sus rutas → `dashboard.view`; `all` deja de convertirse en `own` |
| Usuarios | listar, ver → `view` · crear → `create` · editar → `edit` · cambiar estado (también dentro de un `PUT`) → `toggle` · eliminar → `delete` |
| Catálogos | leer (`/config/all`, `/config/:section`) → solo sesión · crear/editar/eliminar → su acción |
| Roles | ver permisos de un rol → solo admin · cambiar → solo admin · `GET /roles/catalogo` → solo sesión |

**Listados filtrados por alcance**: ventas, clientes e itinerarios ya lo hacen; se suman
responsables, comisionistas, liquidaciones y usuarios. El de clientes con
`includeSales=true` filtra esas ventas por el alcance de `sales.view`.

**Usuarios gestionados por un no-admin**: solo crea o asigna los roles asesor y freelancer;
siguen `ADMIN_PROTEGIDO` (nadie toca a un admin) y `AUTOACCION` (nadie se da de baja a sí
mismo). Solo un admin crea un admin o promueve a alguien.

**Clientes**: si el documento es de un cliente activo, el error dice que ya existe y que la
venta la haga quien lo tiene (decisión 6). Si es de una persona que no es cliente, se
reutiliza completando solo los campos vacíos, sin pisar los que tiene.

**Respuestas para el frontend**: el login y `/auth/me` devuelven los permisos del usuario ya
leídos por el backend; `GET /roles/catalogo` devuelve módulos, acciones, etiquetas y tipos,
sin valores de ningún rol. Los listados de responsables, comisionistas y usuarios devuelven
también quién los creó.

### Auditoría

Una función `auditar(tx, req.user.id, modulo, accion, descripcion)` escribe en
`logs_usuarios` **dentro de la transacción de la acción**: si la acción falla, no queda
registro; si el registro falla, la acción no se confirma. `descripcion` identifica el
registro (id de venta, de usuario…) y, en los cambios de permisos, qué valor cambió de qué a
qué.

Se audita: cambios de permisos de rol; crear, cambiar de rol, desactivar y eliminar
usuarios; desactivar y eliminar responsables; desactivar clientes; anular ventas; facturas
emitidas en Siigo; liquidaciones de comisiones.

### Frontend

- Desaparecen `RolePermissions`, `ADMIN_PERMISSIONS`, `DEFAULT_ASESOR/FREELANCER_PERMISSIONS`,
  `normalizeRolePermissions` y `buildPermissionsFromApiPermisos`.
- `PermissionsContext` expone `puede(modulo, accion, registro?)`: sin registro, si tiene la
  acción con algún alcance; con registro, aplica también "Propios" contra el dueño. El admin
  siempre puede.
- Menú lateral: un módulo se ve si tiene su `view`. Usuarios pasa de ruta solo-admin a
  `users.view`; Gestión Interna, a `config.view`.
- Cada botón de acción sobre un registro se muestra solo si `puede(...)` sobre ese registro
  (decisión 24: lo que no se puede, no se ve).
- El panel de permisos (pestaña de Usuarios, solo admin) se dibuja desde `GET
  /roles/catalogo`: un bloque por módulo, incluidos Dashboard y Usuarios; selector
  Todos/Propios/Ninguno para alcance, interruptor para sí/no. Guarda con el `PUT` existente,
  que rechaza claves fuera del catálogo.
- Si un botón se mostró de más y el backend responde 403/404, se ve el mensaje del servidor.

## Despliegue

El orden importa: código nuevo sin filas nuevas deja a los asesores sin registrar pagos, y
borrar filas viejas con el frontend viejo esconde sus botones.

1. **Hotfix** `fix/permisos-solo-admin`: verificar, mergear a `main`, desplegar solo.
2. **`agregar_permisos_por_accion`** en producción, con confirmación. El código actual
   ignora las filas nuevas, así que puede ir antes del deploy.
3. **Backend y frontend juntos**, una rama y un merge a `main`, implementados en sub-fases
   con commits verificables (base del catálogo, recursos con dueño, auditoría, frontend).
   Incluye la migración de `creado_por_id`.
4. **`rellenar_creado_por`**, después de la migración.
5. **`quitar_permisos_viejos`**, cuando el paso 3 ya esté en producción.

## Verificación

- **Postman**, una colección por sub-fase, con tres sesiones locales: admin, asesor y un
  freelancer de prueba que la colección crea. Para cada acción: con `all` pasa sobre un
  registro ajeno; con `own` pasa sobre uno propio y da 404 sobre uno ajeno; con `none` da
  403. Más los casos de usuarios (un no-admin no crea admins ni toca admins), de clientes
  (documento de cliente ajeno, documento de persona no cliente) y de responsables (eliminar
  con deuda).
- **SQL**, en local y después en producción en modo lectura:

  ```sql
  -- Ninguna fila de permisos fuera del catalogo (despues de quitar_permisos_viejos).
  -- La lista es la de la tabla "El catalogo"; el script la trae escrita igual.
  SELECT p.modulo, p.accion FROM permisos p
   WHERE p.modulo || '.' || p.accion NOT IN (
     'sales.view','sales.create','sales.pay','sales.invoice','sales.void','sales.review',
     'clients.view','clients.create','clients.edit','clients.toggle',
     'responsables.view','responsables.create','responsables.edit','responsables.toggle','responsables.delete',
     'itineraries.view','itineraries.edit',
     'commissions.view','commissions.create','commissions.edit','commissions.delete','commissions.settle',
     'dashboard.view',
     'users.view','users.create','users.edit','users.toggle','users.delete',
     'config.view','config.create','config.edit','config.delete');

  -- Cuantos registros tienen duenio.
  SELECT 'responsables', count(*), count(creado_por_id) FROM responsables
  UNION ALL SELECT 'comisionistas', count(*), count(creado_por_id) FROM comisionistas
  UNION ALL SELECT 'usuarios', count(*), count(creado_por_id) FROM usuarios;

  -- Auditoria de las acciones probadas.
  SELECT modulo, accion, count(*) FROM logs_usuarios GROUP BY 1, 2;
  ```

  La equivalencia de permisos efectivos antes y después de la herencia la comprueba el
  propio script de `agregar_permisos_por_accion`, que aborta si no coincide.
- `tsc`, `node --check` y la carga de módulos. Que el backend no arranque con una acción
  fuera del catálogo es parte de lo que se prueba.
- La interfaz (panel, botones ocultos, menú) no se puede ver desde el entorno de desarrollo
  del agente: la revisa el usuario.

## Riesgos

- **Un freelancer activado antes del paso 3** sigue con los huecos de hoy (clientes sin
  alcance). No activar freelancers hasta entonces.
- **Responsables y comisionistas sin ventas** quedan sin dueño: solo los ve quien tenga
  `all`. Si un freelancer necesita alguno, el admin lo resuelve dándole `all` o asignándolo a
  mano.
- **Un asesor con `users.create`** puede crear asesores con sus mismos permisos de rol. Es lo
  decidido (decisión 19), pero amplía quién da acceso a la app.
- **La auditoría crece sin límite.** Con el volumen de hoy (160 ventas en cuatro meses) no es
  un problema.

## Plan de implementación

Rama `feat/permisos-por-accion`, desde `feat-bayrol`. Cada fase cierra con commit, push y
una colección de Postman en verde. Lo que necesita tocar el entorno local (migración,
reconstruir el contenedor, correr scripts) se pide antes, por la regla 4 del `CLAUDE.md`.

### P1 — Catálogo y una sola lectura de permisos

Primero se actualiza la spec de autenticación y autorización con el catálogo y las reglas
nuevas (flujo del `CLAUDE.md`: la spec antes que el código).

- [ ] **T1.1** `backend/src/config/permisos.js`: el catálogo de la tabla de arriba y tres
  funciones: `leerValor(modulo, accion, valor)` (reemplaza a `utils/permisosValor.js`),
  `permisosEfectivos(user)` (reemplaza a `getEffectivePermissions`; el admin sale del
  catálogo con todo en `all`/`true`) y `existeAccion(modulo, accion)`.
- [ ] **T1.2** `middleware/authorize.js`: `authorize` y `authorizeAny` leen del catálogo y
  lanzan un error **al definir la ruta** si la acción no existe, así el backend no arranca.
  Se borran `ADMIN_PERMISSIONS` y `getActionScope` duplicados.
- [ ] **T1.3** Rutas con las claves nuevas: ventas (`pay`, `invoice`, `void`, `review`),
  clientes (`toggle`), responsables (`toggle`, `delete`), comisiones (`settle` para
  liquidar), catálogos (`create`, `delete`), dashboard (`all` real en `stats.controller`).
  `ventaPropia` pasa a decidir con el alcance **de la acción de la ruta**.
- [ ] **T1.4** `roles.controller`: `GET /roles/:role/permissions` solo admin; el `PUT`
  rechaza (400) claves fuera del catálogo y valores que no correspondan al tipo; ruta nueva
  `GET /roles/catalogo` (solo sesión). Se borra `MODULE_ACTIONS`.
- [ ] **T1.5** Login y `/auth/me` agregan `permisosEfectivos` (mapa ya leído por el
  backend). El campo viejo `permisos` se queda hasta P4 para no romper el frontend actual.
- [ ] **T1.6** `backend/db-manual/agregar_permisos_por_accion.{sql,sh}`, con la guarda de
  equivalencia. Se corre en local (con permiso) antes de probar P1.

**Verificación**: el catálogo responde; un asesor recibe 403 al leer los permisos de un
rol; un `PUT` con una clave inventada da 400; cada acción nueva de ventas responde según el
valor heredado (asesor con `all`, freelancer de prueba con `own`); el script aborta si se le
rompe la equivalencia a propósito.

### P2 — Recursos con dueño

- [ ] **T2.1** Migración `creado_por_id` en `responsables`, `comisionistas` y `usuarios`
  (`npm run db:migrate -- --name creado_por_id`, con permiso).
- [ ] **T2.2** `backend/db-manual/rellenar_creado_por.{sql,sh}`.
- [ ] **T2.3** `middleware/propio.js` reemplaza a `ventaPropia.js`, con la tabla de dueños.
  Itinerarios conserva su comprobación actual en `flights.controller`, que ya funciona.
- [ ] **T2.4** Crear guarda `creadoPorId` en responsables, comisionistas y usuarios.
- [ ] **T2.5** Listados filtrados por alcance: responsables, comisionistas (todos si llega
  por `sales.create`), liquidaciones y usuarios; `includeSales` de clientes filtra por
  `sales.view`. Los listados devuelven quién creó cada registro.
- [ ] **T2.6** Usuarios: un no-admin solo crea y asigna asesor o freelancer; cambiar el
  estado dentro de un `PUT` exige `toggle`.
- [ ] **T2.7** Clientes: error claro si el documento es de un cliente activo; persona
  existente reutilizada completando solo campos vacíos. Responsables: eliminar comprueba la
  deuda.
- [ ] **T2.8** Catálogos: leer pide solo sesión.

**Verificación**: matriz de alcances (`all` ajeno pasa, `own` propio pasa, `own` ajeno da
404, `none` da 403) para clientes, responsables, comisionistas, liquidaciones y usuarios;
un asesor con `users.create` no crea un admin; un freelancer sin `config.view` carga los
catálogos; consultas de dueños de la sección Verificación.

### P3 — Auditoría

- [ ] **T3.1** `auditar(tx, usuarioId, modulo, accion, descripcion)`.
- [ ] **T3.2** Llamadas dentro de la transacción de cada acción: permisos de rol (con qué
  cambió), usuarios (crear, cambiar rol, desactivar, eliminar), responsables (desactivar,
  eliminar), clientes (desactivar), anular venta, factura emitida, liquidación. Las que hoy
  no corren en transacción (anular, por ejemplo) pasan a hacerlo.

**Verificación**: cada acción probada deja su fila en `logs_usuarios`; una acción que falla
no deja ninguna.

### P4 — Frontend

- [ ] **T4.1** `PermissionsContext` con `puede(modulo, accion, registro?)`, desde
  `permisosEfectivos` y `GET /roles/catalogo`. Se borran `RolePermissions`,
  `ADMIN_PERMISSIONS`, `DEFAULT_*_PERMISSIONS`, `normalizeRolePermissions` y
  `buildPermissionsFromApiPermisos`.
- [ ] **T4.2** Menú lateral y rutas: módulos por `view`; Usuarios por `users.view` en vez de
  `AdminRoute`; la pestaña de permisos, solo admin.
- [ ] **T4.3** Botones por registro con `puede(...)` en `Sales`, `SalesTable`,
  `SaleEditModal`, `SaleDetailModal`, `Clients`, `Responsables`, `CommissionAgents`,
  `Itineraries`, `Users` y `Config`.
- [ ] **T4.4** `PermissionsGrid` dibujado desde el catálogo, con Dashboard y Usuarios.
- [ ] **T4.5** Se quita el campo viejo `permisos` de login y `/auth/me`.

**Verificación**: `tsc`; por la API, que `/auth/me` devuelve lo que el panel guardó. La
interfaz la revisa el usuario.

### P5 — Producción

- [ ] **T5.1** `agregar_permisos_por_accion` en producción (con confirmación), antes del
  merge.
- [ ] **T5.2** Merge a `main` (lo hace el usuario); la migración la aplica Render.
- [ ] **T5.3** `rellenar_creado_por` en producción (con confirmación).
- [ ] **T5.4** `quitar_permisos_viejos` en producción (con confirmación), con el deploy ya
  arriba.
- [ ] **T5.5** Consultas de verificación en producción, en modo lectura; estado de los tres
  scripts en `backend/db-manual/README.md`.

## Estado

Diseño aprobado el 2026-10-24; plan de implementación escrito, pendiente de revisión. El hotfix está en `main`
(`0a464c8`), verificado por el usuario.
