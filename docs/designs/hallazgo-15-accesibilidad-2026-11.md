# Hallazgo 15: accesibilidad de ventanas y campos

Diseño del hallazgo 15 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario.

## Problema

El modal compartido no se anuncia como diálogo, no maneja el foco ni Escape, y su botón de cerrar solo tiene un icono. Las etiquetas de `FormField` no están asociadas a su control. Cada modal escribe por su cuenta en `body.style.overflow`, así que cerrar uno libera el fondo con otro abierto. Además, un clic fuera de la ventana cerraba también los formularios y podía perder lo escrito.

## Diseño

Decisiones del usuario:

- En los formularios, ni Escape ni el clic afuera cierran: se cierran con la X, Cancelar o Guardar. Son el asistente de venta, abonos y pagos, anular venta, cliente, comisionista, liquidación, responsable, usuario, Gestión Interna y enviar check-in (`hasForm`).

Decisiones del implementador, mostradas al usuario y aceptadas:

- Las ventanas de consulta y confirmación cierran con Escape y clic afuera.
- El aviso de vouchers fallidos sigue cerrando solo con su botón.
- Con ventanas una sobre otra, Escape cierra solo la de arriba (`utils/modalStack.ts`).
- Al abrir, el foco entra a la ventana, Tab no sale de ella y al cerrar vuelve a donde estaba.
- La ventana se anuncia con su título y la X dice "Cerrar".
- Un clic en la etiqueta lleva a su campo, y el error queda asociado al campo.
- Sin cambios visuales ni de backend.

`FormField` asocia la etiqueta solo si su hijo es un control de `Form.tsx` o un control nativo. Los selectores de fecha y los contenedores siguen como estaban.

## Verificación

Pruebas de `utils/modalStack.ts`, `tsc` y `npm test`. El teclado y el lector de pantalla los tiene que probar una persona.
