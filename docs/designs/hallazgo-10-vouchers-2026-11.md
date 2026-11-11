# Hallazgo 10: vouchers anunciados sin confirmar el envío

Diseño del hallazgo 10 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario.

## Problema

Al guardar una venta, el mensaje decía "vouchers enviados al cliente" si había alguno marcado, sin saber qué pasó. El backend omite el envío sin correo o sin archivo, solo registra los fallos en el log y no devuelve ningún resultado. Va contra el invariante 4. Los adjuntos no se guardan, así que un voucher fallido no se puede reenviar desde el sistema.

## Diseño

Decisiones del usuario:

- Basta con decir cuál falló, para mandarlo a mano. No se agrega reenvío desde la venta.
- Antes de guardar, si un voucher marcado no se va a poder enviar (el cliente no tiene correo o falta el archivo), una advertencia con Volver y Guardar igual. No bloquea la venta.
- Si todos se envían: el mensaje verde con la cantidad y el correo.
- Si alguno falla: una ventana que solo se cierra con su botón, con cuál falló y por qué, sin confeti.

Decisiones del implementador, mostradas al usuario y aceptadas:

- Un voucher es un correo por producto, aunque lleve varios adjuntos.
- Con varios productos iguales se numeran por su posición: Tours 1, Tours 2.
- Si unos salen y otros no, la ventana dice cuántos se enviaron y cuáles fallaron.
- El motivo es genérico, sin el texto técnico del proveedor de correo.
- Sin reintento automático.

**Backend:** `create` devuelve `voucherDelivery: { sent: [etiqueta], failed: [{ label, reason }] }`. Solo agrega un campo: el frontend publicado sigue funcionando. "Enviado" significa que el proveedor aceptó el correo, no que el cliente lo recibió.

## Verificación

Pruebas de `utils/voucherDelivery.ts`, `tsc`, `npm test` y `node --check`. La respuesta de la API y las pantallas las tiene que probar una persona contra la app local.

## Lo que queda abierto

- Al cerrar la advertencia, el fondo puede volver a desplazarse con el asistente abierto: cada modal escribe por su cuenta en `body.style.overflow`. Es parte del hallazgo 15.
