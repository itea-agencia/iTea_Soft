# Comisionistas: desactivar en vez de borrar

## Problema

`deleteAgent` hace `prisma.comisionistas.delete`, un borrado físico. Con un comisionista que tiene ventas, la llave foránea de `ventas.comisionista_id` lo impide y la API responde 500. En la base local los 4 comisionistas tienen ventas, así que el botón "Eliminar" falla siempre en la práctica. Con uno sin ventas, sí borra la fila sin dejar rastro.

Además:

- Un comisionista `Inactivo` se sigue ofreciendo en el asistente de ventas: `GET /commissions/agents?para=venta` devuelve a todos y `Step1Client` no filtra por estado. El formulario dice "Inactivo - Suspendido", pero nada lo hace cumplir.
- Se puede desactivar con comisión sin liquidar, y lo pendiente queda con alguien que ya no está en la operación.
- El estado se cambia desde el formulario de edición, así que basta el permiso `commissions.edit` para dar de baja.
- `createAgent` compara contra `'Eliminado'`, que no existe en el enum `AgentStatus` (`Activo`, `Inactivo`).

## Objetivo

- Un comisionista nunca se borra de la base: se desactiva y se reactiva.
- No se puede desactivar mientras tenga comisión pendiente de liquidar.
- Un comisionista inactivo no se puede asignar a una venta nueva, ni desde la interfaz ni por la API.
- Activar o desactivar tiene permiso propio y queda en la auditoría.

## Fuera de alcance

- Columna `deleted_at` o cualquier forma de ocultar a un comisionista del directorio. Inactivo es suficiente.
- Cambiar el comisionista de las ventas que ya existen, aunque quede inactivo.
- Migrar o renombrar los valores del enum `AgentStatus`.

## Diseño

**Backend**

- Se elimina `deleteAgent` y la ruta `DELETE /commissions/agents/:id`.
- Nueva ruta `PATCH /commissions/agents/:id/toggle-status` con el handler `toggleAgentStatus`, protegida por `authorize('commissions', 'toggle')` y `propio('comisionista')`.
- Al desactivar, el servidor calcula lo pendiente con `getPendingCommission(tx, agentId)`: suma `monto_comision_neto` de las ventas del comisionista con `comision_liquidada = false`, `status <> 'anulado'` y `deleted_at IS NULL`. Es el mismo criterio de `createSettlement`. Si es mayor que 0, responde 400 con el monto. No se usa la columna `acumulado`, ni lo que calcula la pantalla (invariantes 2 y 3).
- El cambio de estado y la auditoría (`auditar(..., 'commissions', 'toggle', ...)`) van en la misma transacción.
- `updateAgent` deja de aceptar `status`: el estado solo cambia por la ruta nueva.
- `listAgents?para=venta` sigue devolviendo `status`. La creación y la edición de ventas rechazan un `commissionAgentId` inactivo si es distinto del que la venta ya tenía. Así, editar una venta antigua no obliga a cambiarle el comisionista.
- En `createAgent` se quita la comparación con `'Eliminado'`.

**Permisos**

- Nueva acción `commissions.toggle`, "Activar/desactivar", tipo `alcance`, con `heredaDe: 'commissions.delete'`. Quien hoy puede eliminar podrá desactivar sin reconfigurar los roles.
- Se quita `commissions.delete` del catálogo. Hay que verificar que un permiso guardado que ya no está en el catálogo se ignore sin error.

**Frontend**

- El botón de papelera, el modal de confirmación y `deleteCommissionAgent` se reemplazan por un botón de activar o desactivar con confirmación, como en clientes.
- Se quita el campo "Estado de la Cuenta" del formulario de edición.
- El asistente de ventas (`Step1Client`) solo ofrece comisionistas activos.

## Decisiones y alternativas

| Decisión | Elegimos | Descartamos | Por qué |
|---|---|---|---|
| Baja | Estado `Inactivo` | `deleted_at` con una migración | El usuario solo necesita marcarlo; sin migración y sin un tercer estado que distinguir. |
| Comisión pendiente | Bloquear la desactivación | Permitir y liquidar después | No queda plata pendiente con alguien fuera de la operación; igual que responsables. |
| Quién desactiva | Permiso `commissions.toggle` | Permiso de editar desde el formulario | Editar no debería alcanzar para dar de baja; igual que clientes y usuarios. |
| Comisionista inactivo en ventas | Rechazar en ventas nuevas o al cambiarlo | Rechazar en toda edición de venta | Una venta vieja con un comisionista ya inactivo tiene que poder editarse. |

## Riesgos y desconocidos

- **Permisos guardados con `commissions.delete`:** si el código que lee los permisos falla con una acción que ya no está en el catálogo, se rompe el panel de roles. Se verifica leyendo `config/permisos.js` antes de quitar la acción.
- **Pantallas que usan `commissionAgentsForSale` además de `Step1Client`:** `SaleEditModal` también elige comisionista. Se revisan con `grep` antes de dar el filtro por terminado.
- **Producción:** no se sabe cuántos comisionistas inactivos hay con comisión pendiente. Quedan como están: el bloqueo solo actúa al desactivar.

## Plan de implementación

1. Backend: `getPendingCommission` y `toggleAgentStatus` con la ruta nueva. Se quitan `deleteAgent`, su ruta, el `status` de `updateAgent` y la comparación con `'Eliminado'`. Verificar con `node --check`.
2. Permisos: agregar `commissions.toggle` heredado y quitar `commissions.delete`, después de comprobar cómo se tratan las acciones desconocidas.
3. Ventas: rechazar un comisionista inactivo al crear y al cambiarlo en una edición.
4. Frontend: botón de activar o desactivar, sin el campo Estado y sin la papelera; filtro de activos en el asistente de ventas. Verificar con `tsc`.
5. Prueba con la API levantada (requiere permiso): desactivar con pendiente da 400; liquidar y luego desactivar da 200 y queda en la auditoría; crear una venta con un comisionista inactivo da 400; consulta SQL de que la fila sigue existiendo.

## Lo que queda abierto

El checklist completo del despliegue, con estos dos pasos y los demás, está en `despliegue-feat-bayrol-2026-11.md`. **Los dos pasos se ejecutaron el 2026-11-09**: el permiso quedó aplicado y el conteo dio 0.

**Antes de mergear `feat-bayrol` a `main`** (el merge despliega), en producción:

1. Correr `backend/db-manual/add_commissions_toggle_permission.sh`. Sin eso, ningún asesor ni freelancer tiene `commissions.toggle` y solo el admin puede activar o desactivar comisionistas. Es una escritura: se confirma antes de correrla y después se marca como aplicada en `backend/db-manual/README.md`.
2. Contar los documentos que la validación nueva (6 a 15 caracteres, NIT sin dígito de verificación) dejaría sin poder editar. Es de solo lectura. Si da más de 0, se decide antes del merge si se corrigen con un script de `db-manual/`.

```sql
BEGIN READ ONLY;
SELECT count(*) FROM personas p
 WHERE p.deleted_at IS NULL
   AND (length(p.documento) NOT BETWEEN 6 AND 15 OR p.documento LIKE '%-%')
   AND (EXISTS (SELECT 1 FROM clientes c WHERE c.persona_id = p.id)
     OR EXISTS (SELECT 1 FROM responsables r WHERE r.persona_id = p.id)
     OR EXISTS (SELECT 1 FROM usuarios u WHERE u.persona_id = p.id)
     OR EXISTS (SELECT 1 FROM comisionistas co WHERE co.persona_id = p.id));
ROLLBACK;
```

- **Un asesor puede ser comisionista de sus propias ventas.** Se agregó la categoría "Asesor interno" porque la gerencia quiere que un asesor también pueda ser comisionista. No se bloquea que el asesor que registra la venta se elija a sí mismo como comisionista: es una decisión expresa de la gerencia (2026-11-09), tomada después de que se le planteó el riesgo de que cobre comisión sobre su propia venta además de lo que gana como asesor.
