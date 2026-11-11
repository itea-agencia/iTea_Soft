# Despliegue de los hallazgos de la auditoría (noviembre 2026)

Checklist para llevar a producción lo que se corrigió de `docs/auditoria-frontend-2026-11-08.md` en `feat-bayrol` después del despliegue del 2026-11-09 (`despliegue-feat-bayrol-2026-11.md`). Todo está en `origin/feat-bayrol` desde `0f42907` hasta `4fe8403`.

**Estado: mergeado a `main` a pedido del usuario (2026-11-10).** El usuario probó en pantalla, contra la app local, lo corregido, salvo el teclado del hallazgo 15, del que no hay confirmación. Falta la publicación del frontend, que hace el usuario.

## Qué trae el merge a `main`

**Backend** (Render lo despliega solo al mergear):

- `isCredit` de las ventas se deriva del estado (`isOnCredit()` en `sales.controller.js`): una venta saldada o anulada deja de ser crédito. La columna `es_credito` ya no se lee en las respuestas.
- Comisiones: `listAgents` devuelve `accumulated` derivado de las ventas y `pendingSaleIds`; `getAgent` y `createAgent` derivan `accumulated`. `listAgents?para=venta` agrega `docLast4`.
- Ventas: `create` agrega `voucherDelivery`, con lo que pasó con cada voucher (hallazgo 10).

**Migraciones:** ninguna. **Scripts de `db-manual/`:** ninguno. No se escribe en producción.

**Frontend** (GoDaddy, a mano): hallazgos 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15 y parte del 14 (el 15 falta probarlo con el teclado); la tabla de ventas con "Vencida"; la modal de liquidación rediseñada. El usuario también probó en pantalla los hallazgos 8, 9, 10, 11 y 13. El 7 no cambia ninguna pantalla.

## Orden

1. Mergear `feat-bayrol` a `main`. Render corre `npm run build` (`prisma generate` + `migrate deploy`, que no tiene nada que aplicar) y despliega el backend.
2. **Después**, `npm run build` en `frontend/` (con `frontend/.env.production`), comprimir el **contenido** de `frontend/dist/` con su `.htaccess` y subirlo a GoDaddy.

El orden importa en un solo sentido:

- **Frontend viejo con backend nuevo: funciona.** Los campos nuevos solo se agregan. El panel de créditos viejo ya deja de contar las ventas saldadas, porque `isCredit` llega correcto. La pantalla de comisiones vieja sigue calculando desde `data.sales` (el error del hallazgo 5) hasta que se publique el frontend.
- **Frontend nuevo con backend viejo: no se puede liquidar comisiones.** La pantalla manda `pendingSaleIds`, que el backend viejo no devuelve, y `createSettlement` responde 400 por no recibir ventas. Por eso el frontend va después.

## Después del deploy

3. **Avisarle a la gerencia y a los asesores:**
   - El cliente, el asesor y el comisionista del asistente de ventas solo se eligen de la lista. Lo que se escribe sin elegir se borra al salir del campo.
   - Los integrantes (seguros, hoteles, tours, planes) copian el documento solo si se elige un cliente de la lista; escribir el nombre exacto ya no lo copia.
   - Los borradores de venta guardados antes del deploy se descartan una vez.
   - Una venta vencida con abonos ahora sale "Vencido" en el panel de créditos, y la tabla de ventas muestra "Vencida: fecha" en créditos y abonadas.
   - Los créditos ya pagados no aparecen en el panel de créditos ni en el detalle del cliente.
   - Un comisionista está "listo para liquidar" desde su umbral propio, o desde 50.000 si no tiene.
4. **Comprobar en producción** (solo lectura, conteos):
   - Las ventas que el panel cuenta como crédito tienen que ser solo `credito` y `abonado`: `SELECT status, count(*) FROM ventas WHERE status::text IN ('credito','abonado') GROUP BY 1;` (al 2026-11-10: 7 y 4).
   - En la pantalla de comisiones, entrando directo a `/commissions`, el acumulado de cada comisionista tiene que coincidir con `SELECT comisionista_id, sum(monto_comision_neto) FROM ventas WHERE comisionista_id IS NOT NULL AND NOT comision_liquidada AND status::text <> 'anulado' AND deleted_at IS NULL GROUP BY 1;`
