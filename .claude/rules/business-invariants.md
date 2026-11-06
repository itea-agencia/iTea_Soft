# Invariantes que no hay que romper

Están desarrollados en `docs/specs/` (índice en `docs/specs/README.md`), que es la fuente de
verdad. Si un cambio toca uno, la spec se actualiza **primero**, no después. En corto:

1. **Lo que es de una persona vive en la persona.** Asiento, booking y tiquete van en
   `pasajeros_detalle`, uno por pasajero. Un pasajero sin dato queda sin dato: no se hereda
   el del producto para rellenar. Esto se rompió en las cuatro categorías con pasajeros,
   una por una, y dejó dos pasajeros en el mismo asiento en producción.

2. **El servidor manda sobre el dinero.** Los totales se derivan de las filas dentro de la
   transacción. Un importe que llega calculado del cliente se ignora. Confiar en el
   navegador ya marcó una venta como pagada sin ningún pago.

3. **Un agregado se deriva, no se guarda.** El total de un paquete sale de sus pagos. Una
   copia almacenada se desincroniza y nadie se entera.

4. **La interfaz no afirma lo que no puede saber.** Una factura existe en Siigo solo si su
   estado es `emitida`. Dry run, borrador y timbrada son tres cosas distintas.

5. **Cada cosa se llama igual en todo el flujo, y cosas distintas se llaman distinto.**
   Unificar "Booking" y "Cód. Reserva" fue un error que hubo que revertir.

6. **El esquema solo cambia por una migración versionada.** Antes el deploy corría
   `db push --accept-data-loss`, que borraba columnas sin preguntar y no dejaba rastro.
