# Bajas de usuario y sesiones

## El invariante

**Una baja no pierde ventas, y una sesión revocada no vale.**

Dicho en reglas:

1. Dar de baja a un usuario, de cualquier forma, nunca borra ni reasigna sus ventas. Cuelgan
   de `usuario_id` y esa fila no se elimina jamás.
2. **Desactivar** es una suspensión: el usuario conserva su correo y se reactiva. **Eliminar**
   es definitivo: libera su correo. Son dos estados distintos y se distinguen en la base
   (`status = inactive` con o sin `deleted_at`).
3. Un correo pertenece a una sola persona a la vez. Se le da a otra persona **creando un usuario
   nuevo**, nunca editando el viejo.
4. Los permisos son **globales por rol**. No existen permisos propios por usuario.
5. Cerrar sesión, cambiar la contraseña, desactivar y eliminar cierran las sesiones **en la
   siguiente petición**, no cuando vence el token.
6. Ningún admin puede desactivar, eliminar ni cambiar el rol de otro admin, ni el suyo. Nunca
   queda el sistema sin un admin activo.

## Qué pasó sin él

- **Un correo no se podía reutilizar nunca.** `usuarios.email` es único y un inactivo lo
  conserva. Dar el correo de María a Pedro fallaba con "Ya existe un registro con ese valor en:
  email".
- **Desactivar y Eliminar eran casi lo mismo.** Los dos dejaban `status = inactive`. Y el
  frontend tenía un desvío: si el usuario tenía ventas, "Eliminar" no eliminaba, lo
  **desactivaba** y avisaba "No se puede eliminar un usuario con ventas registradas". Decidía con
  `data.sales`, una lista parcial en el cliente.
- **Las sesiones no se revocaban.** `auth.js` validaba el JWT y nunca consultaba `sesiones`. Un
  token seguía valiendo tras cerrar sesión, tras cambiar la contraseña y tras inactivar al
  usuario, hasta 1 día (7 con "recordarme"). La caché de 5 minutos, por usuario, dejaba entrar
  a un inactivado unos minutos más. La columna `token_hash` guardaba el token completo.
- **Crear un usuario fallaba siempre.** `existingUser` se declaraba con `const` dentro de un
  `if` y se usaba fuera: `ReferenceError`. La persona ya estaba creada, y quedaba huérfana.
- **El correo no se normalizaba.** `login` lo pasaba a minúsculas y `create` lo guardaba tal cual:
  un usuario creado con mayúsculas no podía iniciar sesión, y `Maria@x.com` y `maria@x.com` eran
  dos filas distintas.
- **Los permisos propios por usuario se superponían a los del rol.** Una excepción olvidada
  hacía que dos usuarios del mismo rol tuvieran acceso distinto sin que nadie lo viera.
- **Un admin no tenía protección.** Podía desactivarse a sí mismo, o al último admin, y dejar
  el sistema sin nadie que administrara usuarios.

## Dónde vive la regla

| Regla | Dónde |
|---|---|
| Estados, baja definitiva, reingreso, reglas de admin | `backend/src/controllers/users.controller.js` (`create`, `update`, `remove`) |
| Correo normalizado y correo de un eliminado | `backend/src/utils/emailUtils.js` |
| Sesión exigida, caché por token, revocación | `backend/src/services/sesiones.service.js` y `backend/src/middleware/auth.js` |
| Duración de la sesión = la del token | `getExpiryTime` en `backend/src/utils/tokenUtils.js` |
| Permisos solo del rol | `backend/src/middleware/authorize.js` |
| Baja de un admin (única vía) | `backend/db-manual/baja_de_admin.{sh,sql}` |
| Eliminados del modelo viejo | `backend/db-manual/liberar_correos_de_eliminados.{sh,sql}` |
| Botones y mensajes que reflejan las reglas | `frontend/src/pages/Users.tsx`, `frontend/src/utils/errors.ts` |
| Una sesión revocada saca al usuario | `frontend/src/api/client.ts` (evento) y `AuthContext.tsx` |

Los códigos de error son estables para que el cliente decida sin leer el texto: `ADMIN_PROTEGIDO`,
`AUTOACCION` (403), `EMAIL_EN_USO`, `DOCUMENTO_EN_USO`, `USUARIO_DESACTIVADO` (409),
`VALIDATION_ERROR` (400), `SESSION_REVOKED`, `USER_INACTIVE` (401).

## Cómo verificarlo

Cada consulta debe dar **0 filas** (o el conteo que se indica).

```sql
-- Un eliminado no retiene su correo.
SELECT id, email FROM usuarios
 WHERE deleted_at IS NOT NULL AND email NOT LIKE 'eliminado+%@itea.invalid';

-- Un eliminado siempre está inactivo.
SELECT id FROM usuarios WHERE deleted_at IS NOT NULL AND status <> 'inactive';

-- Un inactivo o eliminado no tiene sesiones abiertas.
SELECT s.usuario_id, count(*) FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
 WHERE u.status = 'inactive' OR u.deleted_at IS NOT NULL GROUP BY 1;

-- Ninguna venta apunta a un usuario que ya no existe.
SELECT v.id FROM ventas v LEFT JOIN usuarios u ON u.id = v.usuario_id WHERE u.id IS NULL;

-- Siempre queda al menos un admin activo (debe dar >= 1).
SELECT count(*) FROM usuarios u JOIN roles r ON r.id = u.rol_id
 WHERE r.nombre = 'admin' AND u.status = 'active' AND u.deleted_at IS NULL;

-- Las sesiones guardan el hash, no el token (0 filas; ver "Lo que queda abierto").
SELECT id FROM sesiones WHERE token_hash !~ '^[0-9a-f]{64}$';
```

Y por la API, con un usuario de prueba:

- Cerrar sesión con el token A: A da `401 SESSION_REVOKED` al instante; otro token del mismo
  usuario sigue valiendo.
- Desactivar a un usuario con sesión abierta: su siguiente petición da `401`.
- `PUT /users/<otro admin>` con `status: inactive`, `DELETE /users/<otro admin>` y un cambio de
  rol dan `403 ADMIN_PROTEGIDO`; sobre uno mismo, `403 AUTOACCION`.
- Crear un usuario con el correo de un eliminado da `201`; con el de uno activo o desactivado,
  `409 EMAIL_EN_USO`.

## Lo que queda abierto

- **Una sola instancia del backend.** La caché es en memoria: revocar en una instancia no se ve
  en otra hasta que venza su TTL (5 minutos). Con varias instancias hace falta Redis o consultar la
  base en cada petición.
- **El script de baja de admin no limpia la caché.** Un cambio hecho directamente en la base
  surte efecto en hasta 5 minutos, o al reiniciar el backend. Está dicho en el propio script.
- **Un admin puede cambiar el correo y la contraseña de OTRO admin.** Equivale a tomar su cuenta.
  La regla acordada solo cubre desactivar, eliminar y cambiar el rol.
- **Filas de sesión antiguas.** Las creadas antes de este cambio guardan el token completo, no
  el hash: no coinciden, así que esas sesiones dejan de valer (todos inician sesión una vez) y
  sus filas se van al vencer. La última consulta de arriba dará filas hasta entonces.
- **El correo de bienvenida envía la contraseña en texto plano.** Es anterior a esto.
- **Sin auditoría de bajas.** `logs_usuarios` existe y no se usa: no queda registro de quién dio
  de baja a quién.
- **En producción, dos migraciones destruyen o mueven datos.** `quitar_permisos_por_usuario`
  borra la tabla `permisos_usuario` (y quien tenía una excepción restrictiva pasa a tener los
  permisos de su rol), y los usuarios eliminados con el modelo viejo siguen reteniendo su correo
  hasta correr `liberar_correos_de_eliminados`. Ninguna se ha revisado contra producción.
