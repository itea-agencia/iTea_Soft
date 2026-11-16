# Pendientes al 2026-11-16

Lo que queda por hacer después de la rama `feat/hallazgo-16-carga-y-mantenimiento`, que se pasó a `feat-bayrol`. Cada punto apunta al documento que lo detalla; este archivo es el índice, no la fuente. Revisado el 2026-11-16 contra producción, en solo lectura.

## Antes de mergear `feat-bayrol` a `main`

1. ~~**Probar en pantalla** lo de la rama~~ y ~~**la venta de las 17 categorías**~~: **validado en pantalla por el usuario el 2026-11-16**, con las secciones 1 a 9 de `pruebas-pantalla-hallazgo-16.md` (paginación y créditos, pasajeros y personas, migración y visa, titular en tours y seguros, servicios vinculados al paquete en voucher y PDF).
2. **Desplegar con el orden correcto.** El merge corre dos migraciones en producción: `20261111190000` borra 5 columnas vacías del tour y el seguro (comprobado por última vez el 2026-11-16, justo antes del merge: 1 tour sin `tour_nombre` y 0 seguros, y las dos migraciones todavía sin aplicar en producción), y `20261111200000` agrega `prod_simcards.email_entrega`. El frontend se publica junto con el backend o enseguida después: con el frontend viejo, una fila de pasajero vacía o un tipo `TI` dan error recién al guardar.
3. **Comprobar después del despliegue**, en solo lectura, que los conteos de `pasajeros-con-documento-2026-11.md` siguen en cero. La única excepción es la persona del equipaje.

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

## Venta completa por la API (2026-11-16)

Detalle en `docs/resultado-venta-completa-api-2026-11-16.md` (venta 168 local).

- **Servicios vinculados al paquete:** implementado y verificado por API/SQL en las ventas locales 169–171, sin cambiar sus totales. Validado en pantalla por el usuario el 2026-11-16; falta publicar backend y frontend. Diseño: `docs/designs/servicios-vinculados-al-paquete-2026-11.md`.
- **Tramo a medio llenar:** un tramo con origen y sin destino (o al revés) se sigue omitiendo sin aviso, como antes del arreglo del catálogo. El formulario pide los dos.
- **Nombres de ida y vuelta (invariante 5):** `supplierName` entra y sale `supplier`; el seguro del auto entra `all_risk`/`basic` y sale `todo_riesgo`/`basico`.
- **Datos que no se leen:** el método de pago al proveedor de cada producto no vuelve en la API; las fechas, origen y destino generales de `detalle_venta` se llenan dispares y nadie los lee.
- **Visa y pasaporte:** el solicitante no queda como pasajero. Falta decidir si es a propósito.
- **Desglose del paquete distinto según el endpoint:** `GET /sales/:id` llama a `agregarPorPadre` sin los `pagosProveedor`, así que el paquete sale como una sola línea (3 en la venta 172); `GET /sales/:id/details`, el que usa la pestaña, trae las 5. El total es el mismo (33.000). Hoy ninguna pantalla lee el desglose de `getById`.

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

- **Plan de equipaje de otra aerolínea (hallazgo 3 de la venta por API):** el plan elegido para un tiquete o un tramo tiene que ser de su aerolínea, o es un 400; un tramo sin plan propio hereda el del tiquete solo si es de su misma aerolínea. Diseño `docs/designs/plan-equipaje-de-su-aerolinea-2026-11.md`.
- **Catálogo sin error (hallazgo 2 de la venta por API):** un proveedor, método de pago, aerolínea, plan de equipaje o aeropuerto escrito que no existe ahora es un 400 que nombra el servicio y el valor, en ventas y abonos; los nombres se encuentran aunque cambien mayúsculas o espacios. Diseño `docs/designs/catalogo-sin-perdida-silenciosa-2026-11.md`. Los 7 productos de junio a agosto sin proveedor quedan como están.
- **Etiqueta del total del paquete:** en la prueba de pantalla del 2026-11-16 se entendió que el total del paquete incluye sus servicios vinculados. No se cambia.
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
- ~~las ventas 198 a 201~~: al 2026-11-16 no existen en la base local (el id más alto es 176). Para abonos sirve la 155, a crédito;
- el usuario administrador `pruebas@itea.test` (id 17), con su contraseña en `SEED_TEST_PASSWORD` de `backend/.env` (no va al repo), para probar por la API;
- las ventas 165 a 167 (titular en tours y seguros), con los pasajeros de documento `9910000101` y `9910000102`;
- la venta 168: las 17 categorías con todos los campos, creada por la API (pasajeros con documentos `99300001xx` a `99300012xx`);
- las ventas 169–171: repetición de la 168 con vínculos guardados (169, total 187.000), dos paquetes con tiquete/check-in/tour vinculados al segundo (170, total 198.000) y el mismo caso con posición vacía intermedia en el request (171, total 198.000);
- las ventas 172 a 176: vínculos al paquete tras la revisión de la validación (172 a 174) y la venta completa con el catálogo nuevo (175, y 176 con nombres en otro caso y un tramo vacío). Desde el plan de equipaje validado, la venta de prueba lleva "Copa Airlines - Basic" (177, y 178 con una escala de AVIANCA sin plan);
- la tabla auxiliar `_prueba_propios_ventas`.

Esa tabla hace que `prisma migrate dev` pida resetear la base local. Mientras exista, las migraciones locales se aplican con `prisma migrate deploy`.
