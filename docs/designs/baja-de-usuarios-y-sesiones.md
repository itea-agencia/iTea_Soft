# Baja de usuarios, reutilización del correo y revocación de sesiones

> Diseño acordado e implementado el 2026-09-21. El invariante que deja escrito está en
> [`docs/specs/2026-09-21-bajas-y-sesiones.md`](../specs/2026-09-21-bajas-y-sesiones.md).
>
> **Cambios respecto al primer borrador**, decididos al confirmar los supuestos:
> los permisos propios por usuario **desaparecen** (solo quedan los globales por rol), así que
> eliminar ya no tiene que borrarlos; promover a alguien a admin **se permite**, pero solo lo
> hace un admin; y desactivar cierra la sesión al instante.

## Problema

Tres cosas que hoy no funcionan como la operación las necesita, y que se tocan entre sí.

**1. Un correo no se puede reutilizar nunca.** `usuarios.email` es `@unique` y un usuario
inactivo conserva su correo. Si se da de baja a María y se quiere dar su correo a Pedro,
falla con "Ya existe un registro con ese valor en: email". Hoy no hay forma de liberarlo.

**2. "Desactivar" y "Eliminar" hacen casi lo mismo.** Los dos botones dejan al usuario en
`status = inactive`. "Eliminar" además marca `deleted_at` en la persona, pero solo si esa
persona no es también cliente o comisionista. No existe un estado "eliminado" en el usuario:
no se puede distinguir una suspensión temporal de una baja definitiva.

**3. Las sesiones no se revocan.** `auth.js` valida el JWT y nunca consulta la tabla
`sesiones`. Consecuencias medidas leyendo el código:

- Cerrar sesión no invalida el token: sigue valiendo hasta que vence (1 día, 7 con
  "recordarme").
- Cambiar la contraseña tampoco.
- Inactivar a un usuario no limpia `AUTH_CACHE`: entra hasta 5 minutos más.
- Cambiar el rol de un usuario tampoco limpia la caché: conserva el rol viejo hasta 5
  minutos.
- `sesiones.token_hash` guarda el token **completo**, no un hash.

**Además, dos errores previos que este cambio obliga a tocar:**

- **`users.controller.js` `create` falla siempre.** `existingUser` se declara con `const`
  dentro de un `if` (línea 137) y se usa fuera (línea 188): `ReferenceError: existingUser is
  not defined`, comprobado ejecutando el controlador con la base sustituida por un doble.
  Viene de un commit de junio. Y la persona se crea *antes* de fallar, así que cada intento
  deja una persona huérfana. Ese código además escribe `deletedAt` en `usuarios`, una
  columna que no existe.
- **El correo no se normaliza.** `login` busca `email.toLowerCase()`, pero `create` guarda
  el correo tal como se escribió. Un usuario creado con mayúsculas no puede iniciar sesión, y
  `Maria@x.com` y `maria@x.com` son dos filas distintas para el índice único, lo que rompe
  cualquier regla de "correo libre".

## Objetivo

Al terminar, es posible:

- **Desactivar** a un usuario de forma temporal, conservando su correo, y **reactivarlo**.
- **Eliminar** a un usuario de forma definitiva: sus ventas siguen atribuidas a él y su
  correo queda libre para darlo a otra persona **como usuario nuevo**, sin heredar sus
  ventas.
- **Reingresar** a alguien eliminado con su misma cédula y sus mismos datos, recuperando su
  historial, con un correo distinto si el suyo ya lo usa otro.
- Que desactivar, eliminar, cambiar contraseña, cambiar rol o cerrar sesión **surtan efecto en
  la siguiente petición**, no en 5 minutos ni en 1 día.
- Que ningún admin pueda quedar sin acceso por accidente, ni sacar a otro admin.

## Fuera de alcance

- Un rol "superadmin". La baja de un admin se hace con un script (ver abajo).
- Borrado físico de usuarios o de sus ventas.
- Varias instancias del backend. La invalidación es en memoria (ver Riesgos).
- Rediseñar las pantallas de usuarios. Solo se ajusta lo necesario para mostrar los mensajes
  de error nuevos.
- Cambiar quién puede asignar qué contraseña a un usuario desde el formulario de admin.
- Auditoría de quién dio de baja a quién. `logs_usuarios` existe pero no se usa; queda fuera.

## Diseño

### Tres estados

| Estado | Cómo se representa | Correo | Se puede volver |
|---|---|---|---|
| Activo | `status = active`, `deleted_at` nulo | el suyo | — |
| Desactivado | `status = inactive`, `deleted_at` nulo | **lo conserva** | Sí, con "Activar" |
| Eliminado | `status = inactive`, `deleted_at` con fecha | **liberado** | Solo reingresando por `create` con su cédula |

Se añade `usuarios.deleted_at` (nullable). Es aditivo, así que va en una sola migración sin
mover datos. Es exactamente la columna que el código de `create` ya asume.

### Eliminar libera el correo

En una transacción, al eliminar:

1. `usuarios.deleted_at = ahora`, `status = inactive`.
2. `usuarios.email` pasa a un valor que nadie puede usar: `eliminado+<id>@itea.invalid`.
   `.invalid` es un dominio reservado (RFC 2606) que nunca resuelve. El correo real **no se
   pierde**: sigue en `personas.email`, que no es único, así que el historial lo conserva sin
   columnas nuevas.
3. Se revocan sus sesiones y se limpia su entrada en la caché.
4. La persona se marca eliminada como hoy, salvo que también sea cliente o comisionista.

Sus ventas no se tocan: cuelgan de `usuario_id`. El listado de ventas ya muestra el nombre del
asesor desde el `JOIN` del servidor, no desde la lista de usuarios, y el asistente de ventas
ya solo ofrece asesores con `status = active`. No hay cambios de frontend para conservar el
historial.

### Dar el correo a otra persona = usuario nuevo

Se crea un usuario nuevo con ese correo. **Editar el usuario viejo (cambiarle nombre y
correo) queda descartado**: reescribiría a quién pertenecen todas sus ventas. Como el correo del eliminado ya se sustituyó, crear el nuevo
funciona sin tocar nada más.

### Reingreso con la misma cédula

`personas.documento` y `usuarios.persona_id` son únicos, así que quien vuelve reutiliza
necesariamente su fila. `create` decide según el estado de la fila que encuentre por cédula:

- **Activo:** error, ya está registrado.
- **Desactivado:** error que indica usar "Activar". Sigue existiendo con su correo.
- **Eliminado:** se reactiva la fila (`deleted_at` a nulo, `status` activo, rol y contraseña
  nuevos) con el correo del formulario, que debe estar libre. Si no lo está, `409` claro.
  Sus datos personales (cédula, nombre, ventas) son los de siempre.

El correo se normaliza (recortar espacios y pasar a minúsculas) en `create` y en `update`, y
la comprobación de "correo libre" es sobre ese valor normalizado. Sin esto la regla se salta
cambiando una mayúscula.

### Reglas de admin

En `update` y `remove` del servidor, que es quien manda (no basta con ocultar botones):

- Nadie puede desactivar ni eliminar a un admin, ni a sí mismo.
- Nadie puede cambiar el rol de un admin. Si se pudiera, se lo baja a asesor y se lo desactiva,
  y la regla no serviría de nada.

Responden `403` con un mensaje explícito. **La baja de un admin no tiene camino en la
interfaz**: se hace con un script en `backend/db-manual/`, transaccional, con conteo antes y
después y una guarda que aborta si el objetivo no es admin o si no quedaría otro admin
activo. Descartado un rol superadmin: cualquier botón que permita sacar admins es también la
vía para que un admin comprometido saque a los demás.

### Sesiones que sí se revocan

- `login` guarda en `sesiones.token_hash` el **SHA-256** del token, no el token.
- `auth.js` exige, además del JWT válido, una fila en `sesiones` con ese hash y sin vencer, y
  que el usuario esté activo y sin `deleted_at`.
- La caché pasa de estar indexada **por usuario** a estarlo **por token**: cerrar una sesión
  no debe cerrar las de otros dispositivos del mismo usuario. Se mantienen los 5 minutos de
  vida para no ir a la base en cada clic, pero se **invalida explícitamente**.
- Una única función revoca las sesiones de un usuario (borra sus filas y sus entradas de
  caché). La llaman: desactivar, eliminar, cambiar contraseña (recuperación y edición de
  admin), cambiar rol, y el script de baja de admin. `logout` revoca solo la sesión actual.

## Decisiones y alternativas

| Decisión | Elegimos | Descartamos | Por qué |
|---|---|---|---|
| Qué es "inactivar" | Dos acciones: Desactivar (temporal) y Eliminar (definitiva) | Una sola, siempre definitiva | La operación necesita suspender sin perder el correo; `Activar` ya existe en la UI |
| Liberar el correo | Sustituir `usuarios.email` por un valor inutilizable; el real queda en `personas.email` | Índice único parcial (`WHERE status='active'`); columna `email_original` | Prisma no modela índices parciales y `login` con `findUnique` dejaría de servir; la columna nueva duplica lo que `personas.email` ya guarda |
| Dar el correo a otra persona | Usuario nuevo | Editar el usuario viejo | Editarlo reescribe la atribución de sus ventas y le pasa sus permisos |
| Reingreso de un eliminado | Reactivar su fila por cédula, con correo libre | Bloquear y resolver a mano | La cédula es única: sin esto, quien vuelve nunca podría registrarse |
| Estado "eliminado" | Columna `usuarios.deleted_at` | Nuevo valor en el enum `UserStatus` | El código de `create` ya asume esa columna; el enum solo tiene `active` e `inactive`, y añadir un valor obliga a revisar cada comparación de `status` |
| Baja de un admin | Script en `db-manual/` | Superadmin; botón en la interfaz | Evento raro; todo camino desde la interfaz es también un vector de ataque |
| Revocación | Comprobar `sesiones` + caché por token con invalidación explícita | Comprobar la base en cada petición; tokens de vida corta | Lo primero cuesta un viaje a Supabase por clic; lo segundo sigue dejando una ventana |
| Guardar el token | SHA-256 en `token_hash` | Dejarlo completo | La columna ya se llama `token_hash`, y una filtración de la base no debería entregar sesiones válidas |

## Riesgos y desconocidos

- **Una instancia.** La invalidación de caché es en memoria. Con Render gratuito (una
  instancia) funciona; con varias, revocar en una no se vería en las otras hasta que venza el
  TTL. Habría que pasar a Redis o consultar la base en cada petición. No se hace ahora.
- **El script de baja de admin no puede limpiar la caché del proceso.** El efecto llega en
  el siguiente vencimiento de caché (hasta 5 minutos), o al reiniciar el backend. Hay que
  decirlo en el `README` de `db-manual/`.
- **Al desplegar, todos tienen que volver a iniciar sesión una vez.** Las sesiones existentes
  guardan el token completo y no coinciden con el hash. Es un costo asumido, pero conviene
  avisarlo.
- **Usuarios eliminados con el modelo viejo.** Los que se "eliminaron" antes de este cambio
  tienen `status = inactive` y `personas.deleted_at` y siguen reteniendo su correo. Hace falta
  un script de `db-manual/` que los marque y libere sus correos. **No sé cuántos hay en
  producción**: hay que pedir la consulta, no se consulta desde aquí. En la base local hay
  cero.
- **Los mensajes de error no se ven en la interfaz.** El frontend lee
  `err.response.data.message`, pero el backend responde `{ error: { message } }`. Hoy se
  muestra siempre el texto genérico ("Error al eliminar el usuario"). Las reglas de admin
  serían mudas si no se corrige. Esto se puede verificar en el navegador.
- **`create` deja personas huérfanas** mientras esté roto. Antes de arreglarlo conviene ver si
  hay alguna en producción.

### Supuestos que se confirmaron

1. **Permisos propios:** desaparecen del sistema. Ya no hay excepciones por usuario, solo los
   permisos globales del rol. Se retiró el código, la ruta `PUT /users/:id/permissions`, el
   modal de la interfaz y la tabla `permisos_usuario` (migración aparte).
2. **Promover a admin:** permitido vía `update`, solo si quien lo hace es admin. Crear un
   usuario admin sigue igual. Cambiar el rol **de** un admin sigue bloqueado.
3. **Desactivar cierra las sesiones al instante.** Cambiar el rol o el correo, en cambio, solo
   invalida la caché de ese usuario: sus sesiones siguen y toman el rol nuevo.

## Plan de implementación

Cada paso se verifica por separado. Se hace en `feat-bayrol`, con el contenedor del backend
reconstruido tras cada uno y pruebas por la API contra la base local.

1. **Arreglar `create`** (alcance de `existingUser`, persona huérfana) y **normalizar el
   correo** en `create` y `update`. *Verifica:* crear un usuario nuevo devuelve 201 y no deja
   personas sin usuario; un correo con mayúsculas inicia sesión.
2. **Migración aditiva** `usuarios.deleted_at`. `npm run db:migrate -- --name
   usuarios_deleted_at`, con schema y migración en el mismo commit. *Verifica:* `db:status`
   al día; `verificar_schema_local.sql` sin `FALTA`.
3. **Función única de revocación** y **`auth.js` con sesión por token**, `login` guardando el
   hash. *Verifica:* tras logout, el mismo token da 401 al instante; otro token del mismo
   usuario sigue valiendo; un token sin fila en `sesiones` da 401.
4. **Desactivar / Activar / Eliminar** con las reglas de admin. *Verifica:* un admin recibe
   `403` al intentar desactivar o eliminar a otro admin o a sí mismo, y al cambiarle el rol; un
   asesor desactivado recibe 401 en su siguiente clic; eliminar deja `deleted_at`, correo
   sustituido, cero filas de `sesiones`, y sus ventas intactas (conteo antes y después).
5. **Reingreso en `create`** según el estado. *Verifica:* con la cédula de un eliminado y correo
   libre, la fila se reactiva y conserva sus ventas; con correo ocupado, `409`; con la cédula de
   un desactivado, error que remite a "Activar".
6. **Cambio de contraseña y de rol revocan sesiones.** *Verifica:* tras la recuperación de
   contraseña, los tokens anteriores dan 401.
7. **Frontend: leer `error.message`** en las acciones de la pantalla de usuarios. *Verifica* en
   el navegador integrado que las reglas de admin muestran su mensaje.
8. **Scripts de `db-manual/`**: baja de admin y migración de eliminados antiguos, con
   transacción, conteo antes y después y guarda. *Verifica:* en la base local, con casos que
   deben abortar (último admin, objetivo que no es admin).
9. **Documentar** en `docs/specs/` el invariante ("una baja no pierde ventas; una sesión
   revocada no vale") con sus consultas de verificación, y actualizar `db-manual/README.md`.
