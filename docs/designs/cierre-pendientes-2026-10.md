# Cierre de los pendientes de octubre

> Plan escrito el 2026-10-24, después de llevar a producción el plan de corrección de
> vulnerabilidades ([`correccion-vulnerabilidades-2026-10.md`](correccion-vulnerabilidades-2026-10.md))
> y el de permisos por acción ([`permisos-por-rol-2026-10.md`](permisos-por-rol-2026-10.md)).
> Junta lo que quedó anotado como pendiente en esos dos trabajos. Las decisiones marcadas
> **D1…D5** las toma el usuario antes de la fase que las necesita.

## Fuera de este plan, por decisión del usuario

- **Ventas 84, 86 y 93** (comisión liquidada sobre anuladas; total distinto de sus filas):
  son históricas y se dejan como están.
- **Siigo**: buscar la factura antes de reintentar tras un corte. No hay credenciales para
  probarlo; queda la advertencia que deja F5 en `ultimoError`.

## Lo que queda

### 1. Itinerarios: el botón de check-in no conoce al dueño

El listado de vuelos no trae quién hizo la venta, así que `puede('itineraries', 'edit')` se
decide sin dueño: con "Ver: Todos" y "Editar: Propios" el botón aparece en vuelos ajenos y el
backend responde 404. Está anotado como `shortcut` en `Itineraries.tsx`.

### 2. Reactivar no se audita

Desactivar clientes, responsables y usuarios queda en `logs_usuarios`; reactivarlos no, porque
no estaba en lo decidido. Una reactivación devuelve acceso o deuda a alguien, y no queda
rastro de quién lo hizo.

### 3. El lock de facturación vive en memoria

`facturacionEnCurso` es un `Set` del proceso: con una sola instancia del backend (Render
free) alcanza, pero dos instancias podrían facturar la misma venta a la vez. Un advisory lock
de Postgres (`pg_try_advisory_xact_lock(venta_id)`) protege igual con una o con varias, sin
infraestructura nueva. La caché de sesiones tiene el mismo límite (revocar en una instancia no
se ve en otra durante 5 minutos), pero resolverlo pide Redis o consultar la base en cada
petición.

### 4. El borrador del asistente guarda de más en el navegador

`NewSaleWizard` guarda todo el formulario en `localStorage` en cada tecla, incluidos los
vouchers en base64 (datos de clientes, y archivos que llenan la cuota hasta que el guardado
falla), y el borrador no se borra al cerrar sesión: en un equipo compartido queda para el
siguiente.

### 5. TypeScript sin `strict`

`tsconfig.json` tiene `strict: false`. Con `--strict` aparecen **18 errores en 8 archivos**
(medido el 2026-10-24): `Dashboard.tsx` (5), `Users.tsx` (3), `VoucherField.tsx` (3),
`VoucherPDF.tsx` (2), y uno en `Sales.tsx`, `Responsables.tsx`, `Step3Payment.tsx` y
`SaleEditModal.tsx`. Los 384 `any` explícitos no los marca `strict`; se quitan aparte, de a un
archivo cuando se lo toque.

### 6. Orden del repositorio

- `.superpowers/brainstorm/` está versionado (3 archivos de una sesión vieja).
- `skills-lock.json` tiene cambios sin commitear (las skills `ponytail` y `spec-kit`).
- Postman dejó `.postman/` y `postman/` sin versionar en la raíz.

### 7. El token de sesión vive en `localStorage`

Un XSS que corra en la página puede leerlo y llevarse la sesión. La defensa de fondo es una
cookie `httpOnly`, que el JavaScript no puede leer. El frontend (`itea-samturtravel.com`) y el
backend (`itea-backend.onrender.com`) están en dominios distintos, así que la cookie viaja
"entre sitios" y eso obliga a decidir cómo se evita CSRF (ver D1). Es el único punto de este
plan que cambia una interfaz de la que depende todo (el login y cada petición).

## Decisiones

| # | Pregunta | Propuesta | Necesaria para |
|---|---|---|---|
| **D1** | ¿Cómo se lleva el token a una cookie `httpOnly`? (a) subdominio propio para el backend, `api.itea-samturtravel.com`, con la cookie `SameSite=Lax` (mismo sitio, sin CSRF entre sitios; pide DNS y el dominio en Render); (b) dominios como están, cookie `SameSite=None` más un token anti-CSRF en cada escritura; (c) dejarlo en `localStorage` y endurecer la CSP | (a): es la que menos código agrega y la que menos superficie deja | C7 |
| **D2** | ¿Advisory lock de Postgres para la facturación ahora, aunque hoy haya una sola instancia? | Sí: son unas líneas y quita el límite conocido. La caché de sesiones se queda documentada | C3 |
| **D3** | ¿Se auditan las reactivaciones? | Sí, con la misma función, dentro de la misma transacción | C2 |
| **D4** | ¿El borrador del asistente deja de guardar los adjuntos y se borra al cerrar sesión? | Sí a las dos: el borrador sirve para no perder lo tipeado, no los archivos | C4 |
| **D5** | ¿`skills-lock.json` se commitea, y `.postman/`/`postman/` van al `.gitignore`? | Sí a las dos; las colecciones de Postman de las verificaciones no son parte del producto | C6 |

## Fases

Cada fase es una rama `feat/…` desde `main`, con su verificación y su commit, como en los
planes anteriores. Las cinco primeras son chicas y se pueden hacer en una tanda; la última es
un diseño propio.

### C1 — Dueño en los itinerarios

- [ ] **C1.1** El listado de vuelos (`flights.controller`) devuelve el usuario de la venta de
  cada tramo y plan.
- [ ] **C1.2** `Itineraries.tsx` decide el botón de check-in con `puede('itineraries', 'edit',
  duenoId)` y se quita el `shortcut`.

**Verificación**: con un usuario de prueba en "Ver: Todos / Editar: Propios", el listado trae
el dueño (Postman); el botón se revisa en pantalla.

### C2 — Auditar reactivaciones (D3)

- [ ] **C2.1** `auditar(...)` también al reactivar clientes, responsables y usuarios.

**Verificación**: desactivar y reactivar uno de cada deja dos filas por registro en
`logs_usuarios` (SQL).

### C3 — Lock de facturación en Postgres (D2)

- [ ] **C3.1** `generateSiigoInvoice` toma `pg_try_advisory_xact_lock` por venta en vez del
  `Set` en memoria; si no lo obtiene, responde el mismo 409 de hoy.
- [ ] **C3.2** Spec de facturación: se quita "una sola instancia" de lo que queda abierto para
  la facturación; se deja para la caché de sesiones.

**Verificación**: dos peticiones simultáneas de facturar la misma venta en dry run: una da 409
(colección de Postman con dos pedidos en paralelo, o un script local).

### C4 — Borrador del asistente (D4)

- [ ] **C4.1** El borrador se guarda sin los `voucher`/`vouchers` de cada producto.
- [ ] **C4.2** Cerrar sesión borra los borradores (`itea_new_sale_draft_v2_*`).

**Verificación**: `tsc`; en pantalla, que el borrador recupere lo tipeado y que tras cerrar
sesión no quede (`localStorage` en las herramientas del navegador).

### C5 — TypeScript `strict`

- [ ] **C5.1** Corregir los 18 errores y activar `strict: true`.

**Verificación**: `tsc --noEmit` y `npm run build` en verde. Las pantallas tocadas se revisan.

### C6 — Orden del repositorio (D5)

- [ ] **C6.1** `git rm --cached` de `.superpowers/` y agregarlo al `.gitignore`.
- [ ] **C6.2** Commitear `skills-lock.json`; `.postman/` y `postman/` al `.gitignore`.

**Verificación**: `git status` limpio.

### C7 — Token en cookie `httpOnly` (D1)

Cambia el login, el logout, `auth.js` y el cliente HTTP del frontend, y según D1 también DNS,
Render y CORS. Lleva su propio diseño en `docs/designs/` antes de implementarse, con el
despliegue pensado para no echar a nadie a mitad de sesión.

## Estado

Plan escrito, sin empezar. Faltan D1–D5.
