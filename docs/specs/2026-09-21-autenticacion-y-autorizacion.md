# Sin autenticación no hay acceso, y un permiso se comprueba dato por dato

**Fecha:** 2026-09-21 · **Módulo:** todas las rutas de la API

## Los invariantes

1. **Ninguna ruta protegida responde sin un token válido con sesión viva.** No existe un
   modo "sin credenciales" que funcione.
2. **Un parámetro que viene del cliente nunca se interpola en un `SELECT`.** Va como
   parámetro, siempre.
3. **Un permiso de alcance `own` se comprueba contra el dato, no solo contra la acción.**
   "Puedo editar ventas" no es lo mismo que "puedo editar *esta* venta".
4. **Un permiso existe si está en el catálogo, y solo ahí.** `backend/src/config/permisos.js`
   declara cada acción, su tipo (alcance o sí/no) y su etiqueta. Una ruta que pide una acción
   fuera del catálogo hace que el backend no arranque, y el panel de roles no guarda claves
   que no estén en él.
5. **Solo el admin decide quién puede qué.** Ver y cambiar los permisos de un rol es
   `requireAdmin`; ningún permiso configurable lo concede.

## Qué pasó sin ellos

### El bypass: 115 días con la API abierta a quien no se autenticara

```js
if (!header || !header.startsWith('Bearer ')) {
  // BYPASS PARA PRUEBAS
  req.user = { id: 1, role: 'admin' };
  req.permissionScope = 'all';
  return next();
}
```

Entró el 2026-05-25 (`01534c7`, "optimizacion de carga y correccion en dashboard") y
quedó así 115 días: cualquier request a `/api/v1/*` sin cabecera `Authorization` —ventas,
clientes, usuarios, permisos, la emisión de facturas en Siigo— se ejecutaba como admin.
El síntoma de un bypass así es "todo funciona", que es exactamente por qué nadie lo notó:
el bypass solo se activaba en *ausencia* de token, así que cualquiera que probara la app
con sesión iniciada nunca lo disparaba. Se corrigió por dos caminos independientes que
llegaron al mismo sitio: esta sesión de trabajo (`4b13df1`) y, en paralelo, en el propio
repo (`0d12f5d`, mismo día que se pidió la revisión de seguridad). Llegó a `main` el
2026-09-21 (`84a671e`).

No hay forma de saber, desde el código, si alguien lo explotó en esos 115 días: no hay
logs de acceso más allá de lo que imprime `morgan`, y ese log no distingue una request con
token de una sin él salvo leyendo la línea completa.

### Inyección SQL: el parámetro de búsqueda armaba la consulta

```js
if (search) searchCondition = `AND v.observaciones ILIKE '%${search}%'`;
```

En `sales`, `clients`, `responsables`, `users` y `commissions` (dos consultas), `search` y
`status` se interpolaban directo en el texto de un `$queryRawUnsafe`. Un
`?status=' OR 1=1--` reescribía el `WHERE` de la consulta.

### El alcance `own` no se comprobaba sobre el dato

`sales.edit = own` solo se aplicaba en el listado de ventas. `getById`, `update`,
`voidSale`, los pagos, la factura de Siigo y los 54 endpoints de producto suelto aceptaban
cualquier `id`: un asesor con permiso para editar *sus* ventas editaba, anulaba y facturaba
las de cualquier otro con solo cambiar el número en la URL. `/commissions`, `/siigo` y la
mayoría de `/stats` ni siquiera pasaban por `authorize`: cualquier usuario autenticado,
sin mirar su rol, podía crear comisionistas o consultar los endpoints de inspección de
Siigo (que usan las credenciales del servidor).

### Un asesor podía darse cualquier permiso

`PUT /roles/:role/permissions` exigía `config.edit`, y en producción el rol asesor lo tenía:
con una sola petición, un asesor podía reescribir los permisos de su propio rol (anular,
gestionar usuarios, liquidar comisiones) y crear filas inventadas en el catálogo, porque el
endpoint aceptaba cualquier módulo y acción. Se corrigió el 2026-10-24 con `requireAdmin`
(`0a464c8`). El mismo día se vio que la estructura de permisos estaba copiada en cuatro
lugares que no coincidían: para un `sales.edit = 'true'` el frontend entendía "Todas" y el
backend aplicaba "Propias". De ahí el catálogo único (diseño en
[`docs/designs/permisos-por-rol-2026-10.md`](../designs/permisos-por-rol-2026-10.md)).

## Dónde vive la regla

| Regla | Dónde |
|---|---|
| Token + sesión viva exigidos, sin excepción | `backend/src/middleware/auth.js` |
| Qué permisos existen, de qué tipo, y cómo se lee un valor guardado | `backend/src/config/permisos.js` (catálogo, `leerValor`, `permisosEfectivos`). El admin tiene todo, derivado del catálogo |
| Permiso por módulo/acción, solo lo que hay en la base | `backend/src/middleware/authorize.js` (`authorize`, `authorizeAny`, `requireAdmin`): valida la acción contra el catálogo al definir la ruta |
| Ver y cambiar los permisos de un rol | `requireAdmin` en `roles.routes.js`; el `PUT` rechaza claves y valores fuera del catálogo. `GET /roles/catalogo` (solo sesión) dice qué acciones existen, sin valores de ningún rol |
| Propiedad del dato | `backend/src/middleware/propio.js` (antes `ventaPropia.js`, solo para ventas): dueño de una venta es quien la hizo; de un cliente, responsable, comisionista o usuario, quien lo creó (`creado_por_id`). Un registro sin dueño solo lo alcanza quien tenga "Todos". Los listados filtran con el mismo criterio. En ventas, está en todas las rutas de `sales.routes.js` que llevan `:id`/`:saleId` (9 desde el 2026-10-24, cuando se quitaron `PUT`/`DELETE /sales/:id` y los 54 endpoints de producto suelto: la interfaz no los usaba, y el `PUT` de producto escribía el body crudo y no comprobaba que el producto fuera de la venta de la URL) |
| Parámetros de búsqueda parametrizados | `Prisma.sql` en `sales.controller.js`, `clients.controller.js`, `responsables.controller.js`, `users.controller.js`, `commissions.controller.js` |
| Auditoría de acciones sensibles | `backend/src/utils/auditoria.js` escribe en `logs_usuarios` dentro de la transacción de la acción: cambios de permisos de rol (con qué cambió), usuarios (crear, rol, desactivar, eliminar), responsables (desactivar, eliminar), desactivar clientes, anular ventas, liquidaciones. La factura emitida se registra **fuera** de la transacción: la factura ya existe en Siigo, y deshacer el `emitida` por un fallo de auditoría llevaría a facturar dos veces |
| Orígenes permitidos (CORS) | `backend/src/index.js`: `FRONTEND_URL`, el dominio propio y localhost. Desde el 2026-10-24 sin el comodín `*.vercel.app`, que autorizaba con credenciales cualquier sitio publicado en Vercel. El token viaja solo como `Authorization: Bearer`; no hay cookie de sesión |
| `/siigo/*` solo para admin | `requireAdmin` en `siigo.routes.js` |
| `/stats/*`, `/commissions/*` con su propio permiso | `stats.routes.js`, `commissions.routes.js` |

`ventaPropia` decide con el alcance de **vista** en lecturas (`GET`) y el de **edición** en
todo lo demás, no con el de la acción concreta que se está ejecutando: `sales.create` y
`sales.delete` son booleanos y siempre darían `'all'`, lo que dejaría a alguien que solo
puede editar lo suyo agregar productos a una venta ajena. Sin permiso de edición se trata
como `'own'`. Responde **404**, no 403: confirmar que el id existe pero es de otro también
es información.

`stats.controller.js` interpola directo `year`, `dateFrom` y `dateTo` en SQL crudo, pero
esos valores pasan por `parseInt()` o `new Date().toISOString()` antes: no hay texto de
usuario que llegue sin convertir, así que no hace falta `Prisma.sql` ahí.

## Cómo verificarlo

Sin token, cualquier ruta protegida:

```bash
curl -s -o /dev/null -w '%{http_code}\n' https://<backend>/api/v1/clients   # 401
```

Con un token de un usuario con alcance `own` en ventas, sobre una venta que no es suya:

```bash
curl -s -H "Authorization: Bearer $TOKEN" https://<backend>/api/v1/sales/<id-ajeno>   # 404
```

Una carga de inyección no debe ejecutarse ni devolver más de lo que debería:

```bash
curl -s -H "Authorization: Bearer $TOKEN" -G \
  --data-urlencode "search=' OR 1=1--" https://<backend>/api/v1/clients   # lista vacía, no 500 ni todo
```

## Lo que queda abierto

- **No hay auditoría de los 115 días de exposición.** No se puede saber, desde el
  código o la base, si el bypass se usó desde afuera.
- **`/siigo/*` es todo-o-nada por rol.** `requireAdmin` no distingue qué endpoint de
  inspección se llama; un admin ve todos o ninguno.
- **El límite de intentos de login es por IP**, no por cuenta. `trust proxy` ya hace que
  `req.ip` sea la IP real del cliente y no la del proxy de Render, pero varias personas
  detrás de la misma red (una oficina, un wifi compartido) siguen compartiendo el cupo.

Relacionado: [`bajas-y-sesiones`](2026-09-21-bajas-y-sesiones.md) cubre la revocación de
sesiones y los permisos globales por rol, que son la otra mitad de "quién puede hacer qué".
