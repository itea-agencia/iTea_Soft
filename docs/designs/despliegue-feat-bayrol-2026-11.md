# Despliegue de feat-bayrol (noviembre 2026)

Checklist único para llevar `feat-bayrol` a producción. Junta lo que estaba repartido entre `comisionistas-desactivar-en-vez-de-borrar.md`, `proveedores-registrados-por-usuario.md`, el README de `backend/db-manual/` y los mensajes de commit. Cada paso que escribe en producción se confirma antes de correrlo.

**Estado: ejecutado el 2026-11-09, con el merge `450b0fc`.** Los pasos 1 a 3 y la migración de proveedores se comprobaron en producción (0 documentos fuera de rango, 0 tramos sin tipo). El usuario confirmó el deploy, la publicación del frontend, el aviso a la gerencia y la comprobación final. Dos datos de este checklist resultaron inexactos: las migraciones 1 y 2 ya se habían aplicado con el deploy del 8 de noviembre, así que el merge solo aplicó la de proveedores; y al desplegar había 28 proveedores sin fecha de alta, no 26.

## Qué trae el merge a `main`

**Backend** (Render lo despliega solo al mergear):

- Validación única del número de documento (6 a 15 caracteres, NIT guardado sin dígito de verificación) en clientes, responsables, usuarios y comisionistas.
- Comisionistas: ya no se borran, se desactivan, y solo sin comisión pendiente (ruta nueva `PATCH /commissions/agents/:id/toggle-status`, permiso `commissions.toggle`). Se quita `DELETE /commissions/agents/:id`.
- Dashboard y Estadísticas: sin ventas anuladas, sin nombres ajenos con alcance "propios", fechas validadas (400), consultas con parámetros, hora de Colombia, `totalSales` nuevo y proveedores registrados en el rango. Se quita `GET /stats/sales-history`.

**Migraciones** que corre `prisma migrate deploy` en Render, en este orden:

1. `20261106011500_tipo_tramo_not_null`: `tramos_vuelo.tipo_tramo` pasa a NOT NULL. **Falla si queda algún tramo con `tipo_tramo` en null.**
2. `20261108120000_ventas_creado_por_id`: agrega `ventas.creado_por_id`, lo rellena con `usuario_id` y lo vuelve NOT NULL.
3. `20261109210809_proveedores_creado_por`: agrega `proveedores.creado_por_id` y `creado_at`, nullable. No mueve datos.

**Frontend**: GoDaddy, se publica a mano después del merge (ver `.claude/rules/architecture.md`).

## Antes de mergear

1. **Conteo de documentos fuera de rango** (solo lectura). Si da más de 0, se decide si se corrigen con un script de `db-manual/` antes del merge; si no, esas personas no se podrán editar sin corregir el documento.

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

2. **Tramos sin `tipo_tramo`** (solo lectura). Tiene que dar 0, o la migración 1 falla y el deploy de Render queda roto. La Fase 4 (`rellenar_tipo_tramo`) se aplicó el 2026-11-05, pero los tramos creados después por el código anterior pueden haber quedado en null. Si da más de 0, se vuelve a correr `backend/db-manual/rellenar_tipo_tramo.sh` (es idempotente) y se repite el conteo.

   ```sql
   BEGIN READ ONLY;
   SELECT count(*) FROM tramos_vuelo WHERE tipo_tramo IS NULL;
   ROLLBACK;
   ```

3. **Permiso `commissions.toggle`** (escritura). Correr `backend/db-manual/add_commissions_toggle_permission.sh`. Sin eso, solo el admin puede activar o desactivar comisionistas. El backend actual ignora la acción nueva, así que se puede correr antes del merge sin efecto visible. Después se marca como aplicado en el README de `db-manual/`.

## Merge y deploy

4. Mergear `feat-bayrol` a `main`. Render corre `prisma migrate deploy` y despliega el backend. Revisar en el log de Render que las tres migraciones se aplicaron.

## Inmediatamente después: publicar el frontend

5. `npm run build` en `frontend/` (con `frontend/.env.production` en la máquina), comprimir el **contenido** de `frontend/dist/` con su `.htaccess` y subirlo a GoDaddy.

Mientras el frontend viejo siga publicado contra el backend nuevo:

- El botón de eliminar comisionista falla con 404, porque la ruta DELETE ya no existe.
- Cambiar el estado de un comisionista desde el formulario de edición no hace nada: el backend ignora `status` en la edición.
- La tarjeta Proveedores sigue diciendo "N activos", pero el número ya es "registrados en el rango".
- El formulario de NIT de clientes sigue sin aceptar guion; el resto de las validaciones del backend son más permisivas o iguales que las del frontend viejo.

Ninguno corrompe datos, pero conviene que la ventana dure minutos.

## Después del deploy

6. **Avisarle a la gerencia:**
   - La tarjeta Proveedores muestra 0 hasta que se registren proveedores nuevos. Los 26 existentes no tienen fecha de alta y no cuentan en ningún rango.
   - Un comisionista con comisión pendiente no se puede desactivar: primero se liquida.
   - "Asesor interno" es una categoría nueva de comisionista.
7. **Comprobar en producción** (solo lectura): `SELECT count(*) FROM proveedores WHERE creado_at IS NOT NULL;` tiene que crecer al registrar el primer proveedor nuevo.
