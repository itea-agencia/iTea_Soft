# Hallazgo 13: adjuntos sin validar el límite anunciado

Diseño del hallazgo 13 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario.

## Problema

El campo de adjuntos anuncia un máximo de 10 MB, pero no se comprueba el tamaño, el tipo ni el total antes de convertir todo a base64, y no se maneja un error de lectura. El servidor acepta 50 MB por venta: por encima de eso, el asesor recibe un error genérico después de esperar la subida.

## Diseño

Decisiones del usuario:

- Un archivo de más de 10 MB se rechaza solo a él: los demás se agregan y un mensaje lo nombra.
- Si los adjuntos de la venta superan los 37 MB en total, se avisa cuánto pesan y no se guarda: la venta queda abierta para quitar alguno. Los 37 MB salen de los 50 MB del servidor, porque base64 pesa 4/3 del archivo.

Decisiones del implementador, mostradas al usuario y aceptadas:

- Tipos permitidos, los que ya anuncia el campo: PDF, JPG, PNG y DOC/DOCX. Se mira la extensión, no el contenido.
- Si un archivo no se puede leer, el mensaje lo nombra y los demás siguen.
- El mensaje queda bajo el campo hasta la siguiente selección.
- Vale igual para el campo de un solo archivo.
- El total cuenta todos los adjuntos, con o sin "enviar voucher", porque todos viajan al servidor.
- Solo cambia el frontend.

## Verificación

Pruebas de `utils/voucherFiles.ts` y del total de `utils/voucherDelivery.ts`, `tsc` y `npm test`. Lo visual lo tiene que mirar una persona.
