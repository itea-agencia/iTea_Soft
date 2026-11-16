# Pendientes al 2026-11-16

Lo que queda por hacer después de la rama `feat/hallazgo-16-carga-y-mantenimiento`, que se pasó a `feat-bayrol`. Cada punto apunta al documento que lo detalla; este archivo es el índice, no la fuente. Revisado el 2026-11-16 contra producción, en solo lectura.

## Antes de mergear `feat-bayrol` a `main`

1. **Probar en pantalla** lo de la rama, que no se pudo verificar visualmente. La lista está en cada diseño:
   - la paginación de Ventas y el panel de créditos (`correcciones-auditoria-paginacion-2026-11.md`, puntos de revisión 3 a 8);
   - la tarjeta del cliente en créditos, el tipo de mascota, los campos quitados de finca, migración y SIM, el correo de entrega de la eSIM y el voucher del tour vinculado;
   - pasajeros y personas (`pasajeros-con-documento-2026-11.md`): el error por pasajero en el asistente, el catálogo de tipos en check-in, migración, visa y SIM, el dueño de la mascota en solo lectura y el nombre de comisionistas.
   - titular en tours y seguros (`titular-por-producto-2026-11.md`): el radio, que el titular no se borre, y que detalle y voucher lo muestren primero (sección 8 de `pruebas-pantalla-hallazgo-16.md`);
   - migración y visa (commits `a357200` y `4db83f9`): formulario, pestaña y PDF de la venta 201 deben decir "Trámite Migratorio", "Tipo de Documento", "Nro/N° Documento" y "Vencimiento de Documento", y el PDF de visa debe traer el vencimiento. El vencimiento es el del documento elegido, no siempre el del pasaporte (`2026-09-17-vocabulario.md`).
2. **Probar a mano la venta de las 17 categorías** (hallazgo 16). Ya se cargó por API en local: la 201 es la completa, con proveedores y todos los campos; la 198 fue un primer intento con datos incompletos. Falta la revisión en pantalla, con la lista de `pruebas-pantalla-hallazgo-16.md`; lo verificado por API está en `resultado-venta-gigante-local-2026-11-11.md`. Por API tampoco se probaron el tour vinculado a un plan, las escalas, un rol con alcance propios ni el PDF final: esos quedan solo para la pantalla.
3. **Desplegar con el orden correcto.** El merge corre dos migraciones en producción: `20261111190000` borra 5 columnas vacías del tour y el seguro (comprobado otra vez el 2026-11-16: 1 tour sin `tour_nombre` y 0 seguros; conviene repetir el conteo justo antes del merge, porque el borrado no se deshace), y `20261111200000` agrega `prod_simcards.email_entrega`. El frontend se publica junto con el backend o enseguida después: con el frontend viejo, una fila de pasajero vacía o un tipo `TI` dan error recién al guardar.
4. **Comprobar después del despliegue**, en solo lectura, que los conteos de `pasajeros-con-documento-2026-11.md` siguen en cero. La única excepción es la persona del equipaje.

## Dinero (invariante 2)

Detalle en `docs/specs/2026-09-17-dinero-y-totales.md`, "Lo que queda abierto".

- **`ventas.es_credito`:** está desactualizada y solo la lee Siigo. Hay que quitarla con una migración.
- **Estado derivado en el asistente:** el `useEffect` de totales sigue escribiendo estado derivado.

## Datos por pasajero

Detalle en `docs/specs/2026-09-17-datos-por-pasajero.md`.

- **Escalas:** guardan un asiento por tramo, compartido. Cerrarlo pide una tabla pasajero × tramo.
- **Migración con pasaporte:** si se cambia el documento del cliente por su pasaporte, se crea otra persona.

## Deuda técnica de datos viejos

Ventas y registros anteriores a los arreglos, que se dejan como están por decisión del usuario (2026-11-16): son muy viejos y hoy no importan. No se corrigen salvo que el negocio lo pida.

- **Ventas 84 y 86:** anuladas con la comisión liquidada.
- **Venta 64:** sus pagos superan el total.
- **`monto_pagado_credito`:** no coincide con la suma de los pagos en ventas creadas antes del 2026-10-23.
- **Venta 19:** dos pasajeros en el asiento `11A`.
- **Persona sin documento en producción:** la que dejó la venta de equipaje.

## Auditoría del frontend

Detalle en `docs/auditoria-frontend-2026-11-08.md`, "Estado".

- **Hallazgo 3, Siigo:** fuera de alcance mientras no se use Siigo. Si se vuelve a usar, se corrige antes. Ojo: en producción `SIIGO_DRY_RUN` está en `false` y los endpoints siguen activos, así que "no se usa" depende de que nadie pulse Facturar. Si se deja Siigo, conviene apagarlo de verdad (dry run en Render o quitar el permiso).
- **Hallazgo 14:** falta paginar en el servidor clientes, itinerarios, responsables, comisionistas y usuarios. Está por etapas en `plan-carga-y-tipos-2026-11.md`. No apura con el volumen actual.
- **Resto del hallazgo 12:** el JWT vive en `localStorage`. Cambiarlo se diseña con el backend y CSRF.
- **Resto del hallazgo 16:** los `any`, por etapas en `plan-carga-y-tipos-2026-11.md`.

## Seguridad y sesiones

Detalle en `docs/specs/2026-09-21-autenticacion-y-autorizacion.md` y `2026-09-21-bajas-y-sesiones.md`.

- **Intentos de login:** el límite se cuenta por IP, no por cuenta.
- **`/siigo/*`:** es todo o nada por rol.
- **Caché de sesiones:** está en memoria, así que solo es correcta con una instancia del backend.

## Cerrado en esta revisión

- **`liberar_correos_de_eliminados`:** no tiene nada que hacer en producción. El 2026-11-16 había 0 candidatos (inactivos con la persona eliminada y sin `deleted_at`); el único usuario eliminado ya tiene el correo liberado. Queda 1 inactivo con la persona viva, que es un "Desactivar" normal o un caso a revisar a mano, no trabajo del script.

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
- el usuario administrador `prueba.gigante@local` (id 10), con su contraseña entregada en el chat;
- las ventas 198 a 201: 198 con las 17 categorías, 199 a crédito con $80.000 de saldo para probar abonos, 200 anulada (rechaza pagos) y 201 completa;
- el usuario administrador `pruebas@itea.test` (id 17), con su contraseña en `SEED_TEST_PASSWORD` de `backend/.env` (no va al repo), para probar por la API;
- las ventas 165 a 167 (titular en tours y seguros), con los pasajeros de documento `9910000101` y `9910000102`;
- la tabla auxiliar `_prueba_propios_ventas`.

Esa tabla hace que `prisma migrate dev` pida resetear la base local. Mientras exista, las migraciones locales se aplican con `prisma migrate deploy`.
