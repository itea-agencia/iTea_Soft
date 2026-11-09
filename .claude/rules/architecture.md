# Arquitectura

**Backend** (Express 5, CommonJS, Prisma). `src/index.js` monta `routes/index.js` en
`/api/v1` y también en `/api`. Cada ruta encadena:

`auth` → `authorize(modulo, accion)` → `propio(recurso)` / `ventaPropia` → controller

- `auth` exige un JWT **y** una fila viva en `sesiones` (`services/sesiones.service.js`):
  desactivar a alguien o cerrar su sesión la revoca aunque el token siga siendo válido.
- `authorize` lee el catálogo único de `config/permisos.js`. Una acción que no está ahí
  tira error **al arrancar**. Cada acción tiene alcance `all`/`own`/`none` o `true`/`false`;
  el alcance queda en `req.permissionScope` y `propio` lo usa para frenar el `own` sobre
  registros ajenos. Un permiso nuevo va primero al catálogo, y en producción con un script
  de `db-manual/` (ver `agregar_permisos_por_accion`).
- Toda respuesta sale por `utils/apiResponse.js`: `{ success, data, meta }` o
  `{ success: false, error: { message, code } }`. El frontend distingue una
  sesión caída de una contraseña mala por `error.code` (`api/client.ts`).

**Ventas** son el núcleo: `sales.controller.js` (más de 3.000 líneas: leé rangos, no el
archivo entero). El modelo está en el README. Las 17 categorías no tienen un controller
cada una: se despachan por tablas dentro del mismo archivo. `PRODUCT_HANDLERS` (payload →
fila `Prod*`, al crear y editar), `PRODUCT_INCLUDES` y `PRODUCT_TRANSFORMS` (fila →
respuesta, en `getById`). Una categoría nueva o un campo nuevo de producto toca esas tres,
el schema, y su formulario en `frontend/src/components/sales/forms/`. Lo que es por
pasajero se decide en las listas `CATEGORIAS_CON_*_POR_PASAJERO`, no en cada handler. Siigo
vive en `services/siigo.service.js`.

**Frontend** (React 19 + TS, Vite, Tailwind). `api/` envuelve un axios con el token en
`localStorage` (`itea_token`). Un 401 de sesión dispara el evento `itea:sesion-expirada`.
`context/DataContext.tsx` carga los datos compartidos y los cachea en `localStorage` por
usuario, con 5 minutos de TTL (`utils/*Cache.ts`). **Después de escribir una venta, un
usuario o la config hay que invalidar su caché**, o la pantalla muestra datos viejos. La
venta se crea con el asistente `components/sales/NewSaleWizard.tsx` (pasos en `steps/`, un
formulario por categoría en `forms/`). El voucher es `VoucherPDF.tsx`, renderizado oculto
y pasado a PDF con html2canvas + jsPDF.

**Deploy**: merge a `main` → Render despliega **solo el backend** (`npm run build` =
`prisma generate` + `migrate deploy`). La base de producción es Supabase.

El **frontend está en GoDaddy y se publica a mano**: `npm run build` en `frontend/`, se
comprime el **contenido** de `frontend/dist/` y se sube con el administrador de archivos.
Mientras no se suba, producción sigue con el frontend anterior aunque `main` ya tenga el
cambio, así que un cambio de backend tiene que seguir funcionando con ese frontend viejo.

- El build toma `VITE_API_URL` de `frontend/.env.production`, que no está en el repo: hay
  que tenerlo en la máquina que compila.
- `dist/` incluye `.htaccess` (sale de `public/`). Sin él, recargar una ruta como
  `/sales` da 404 en Apache: tiene que ir en el zip aunque sea un archivo oculto.
