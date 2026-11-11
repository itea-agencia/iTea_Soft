# Pendientes al 2026-11-11

Lo que queda por hacer después de la rama `feat/hallazgo-16-carga-y-mantenimiento`, que se pasó a `feat-bayrol`. Cada punto apunta al documento que lo detalla; este archivo es el índice, no la fuente.

## Antes de mergear `feat-bayrol` a `main`

1. **Probar en pantalla** lo de la rama, que no se pudo verificar visualmente. La lista está en cada diseño:
   - la paginación de Ventas y el panel de créditos (`correcciones-auditoria-paginacion-2026-11.md`, puntos de revisión 3 a 8);
   - la tarjeta del cliente en créditos, el tipo de mascota, los campos quitados de finca, migración y SIM, el correo de entrega de la eSIM y el voucher del tour vinculado;
   - pasajeros y personas (`pasajeros-con-documento-2026-11.md`): el error por pasajero en el asistente, el catálogo de tipos en check-in, migración, visa y SIM, el dueño de la mascota en solo lectura y el nombre de comisionistas.
2. **Probar a mano la venta de las 17 categorías** (hallazgo 16).
3. **Desplegar con el orden correcto.** El merge corre dos migraciones en producción: `20261111190000` borra 5 columnas vacías del tour y el seguro, y `20261111200000` agrega `prod_simcards.email_entrega`. El frontend se publica junto con el backend o enseguida después: con el frontend viejo, una fila de pasajero vacía o un tipo `TI` dan error recién al guardar.
4. **Comprobar después del despliegue**, en solo lectura, que los conteos de `pasajeros-con-documento-2026-11.md` siguen en cero. La única excepción es la persona del equipaje.

## Dinero (invariante 2) — lo primero después del merge

Detalle en `docs/specs/2026-09-17-dinero-y-totales.md`, "Lo que queda abierto".

- **Ventas 84 y 86:** están anuladas y tienen la comisión liquidada ($161.367 en total).
- **Venta 64:** sus pagos superan el total.
- **`monto_pagado_credito`:** no coincide con la suma de los pagos en varias ventas `pagado`.
- **`ventas.es_credito`:** está desactualizada y solo la lee Siigo. Hay que quitarla con una migración.
- **Estado derivado en el asistente:** el `useEffect` de totales sigue escribiendo estado derivado.

## Datos por pasajero

Detalle en `docs/specs/2026-09-17-datos-por-pasajero.md`.

- **Venta 19:** tiene dos pasajeros en el asiento `11A`, y necesita que una persona decida de quién es.
- **Titular por defecto:** `esTitular: p.esTitular ?? true` marca titular a todos cuando el producto no manda el dato.
- **Escalas:** guardan un asiento por tramo, compartido. Cerrarlo pide una tabla pasajero × tramo.
- **Migración con pasaporte:** si se cambia el documento del cliente por su pasaporte, se crea otra persona.
- **Persona sin documento en producción:** la que dejó la venta de equipaje. Queda como deuda técnica, por decisión del usuario.

## Auditoría del frontend

Detalle en `docs/auditoria-frontend-2026-11-08.md`, "Estado".

- **Hallazgo 3, Siigo:** fuera de alcance mientras no se use Siigo. Si se vuelve a usar, se corrige antes.
- **Hallazgo 14:** falta paginar en el servidor clientes, itinerarios, responsables, comisionistas y usuarios. Está por etapas en `plan-carga-y-tipos-2026-11.md`. No apura con el volumen actual.
- **Resto del hallazgo 12:** el JWT vive en `localStorage`. Cambiarlo se diseña con el backend y CSRF.
- **Resto del hallazgo 16:** los `any`, por etapas en `plan-carga-y-tipos-2026-11.md`.

## Seguridad y sesiones

Detalle en `docs/specs/2026-09-21-autenticacion-y-autorizacion.md` y `2026-09-21-bajas-y-sesiones.md`.

- **Intentos de login:** el límite se cuenta por IP, no por cuenta.
- **`/siigo/*`:** es todo o nada por rol.
- **Caché de sesiones:** está en memoria, así que solo es correcta con una instancia del backend.
- **`liberar_correos_de_eliminados`:** sigue sin correr en producción.

## Menores

- **Toasts:** quedan once implementaciones duplicadas (`2026-09-17-vocabulario.md`).
- **Voucher:** el título "Otros Servicios Reservados" lleva un ícono de avión.
- **Pruebas de Ventas:** `useSalesQuery` y el controlador no tienen pruebas automáticas.
- **Siigo sin recargar:** la factura de Siigo no recarga la tabla de Ventas.

## Datos de prueba en la base local

Quedan a propósito, para volver a probar:
- los usuarios `prueba.propios@local` (id 14) y `prueba.ventas@local` (id 15), con sus contraseñas en el scratchpad de la sesión;
- las ventas 154 a 164;
- un cliente, un responsable, un usuario y un comisionista de prueba, con documentos `9910000010` a `9910000040`;
- un cliente con NIT `900123456` y otro con pasaporte `PA991234`;
- la tabla auxiliar `_prueba_propios_ventas`.

Esa tabla hace que `prisma migrate dev` pida resetear la base local. Mientras exista, las migraciones locales se aplican con `prisma migrate deploy`.
