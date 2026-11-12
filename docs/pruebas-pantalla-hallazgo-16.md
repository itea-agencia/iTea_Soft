# Pruebas de pantalla antes de integrar hallazgo 16

Ejecutar en el entorno local actualizado, con datos de prueba. Anotar por caso: resultado esperado, resultado observado, id de venta y captura si falla. Una prueba por API no sustituye estas comprobaciones del asistente y del PDF.

## Datos preparados por API el 2026-11-11

- Usuario administrador local: `prueba.gigante@local`; contraseña entregada en el chat.
- Venta 198: las 17 categorías, pagada, total 187.000. Revisar sus pestañas y generar su PDF.
- **Usar preferentemente la venta 201 para revisar campos:** incluye proveedores de las 17 categorías, equipaje distinto por tramo, referencia del hotel, recogida del tour, espacio del evento, mesa y ocasión del restaurante, maletas de check-in, garantía del auto y documentos y vencimientos de migración y visa. La 198 omitía esos campos en su request.
- Venta 199: total 100.000, abonado 20.000 y saldo 80.000. Usarla para probar créditos y pagos en pantalla.
- Venta 200: anulada. Comprobar que no se ofrece como deuda cobrable.
- Clientes: Ana Prueba Gigante (108) y Luis Prueba Gigante (109). Responsable: Rosa Prueba Gigante (10).
- Backend y migraciones actualizados; frontend Docker reconstruido con el commit `4db83f9` (documento, trámite y vencimiento de migración y visa). Recargar con Ctrl+F5 antes de revisar la venta 201.
- Evidencia y límites: `resultado-venta-gigante-local-2026-11-11.md`.

## 1. Preparar

1. Confirmar que backend y frontend locales corresponden al commit que se quiere integrar y que las migraciones están aplicadas. El frontend de Docker también necesita reconstrucción para mostrar los cambios.
2. Entrar a `http://localhost` con un usuario de pruebas autorizado.
3. Identificar un cliente, responsable y dos pasajeros de prueba con nombre, apellido, tipo y documento válidos y distintos.
4. Desmarcar los envíos de vouchers. No usar emisión Siigo ni datos de clientes reales.

## 2. Recorrer las 17 categorías en el asistente

1. Ventas → Nueva venta: seleccionar cliente y asesor.
2. Seleccionar las 17 categorías: tiquetería, hotelería, seguros, planes, check-in, migración, SIM, equipaje, vehículos, fincas, tours, convenciones, restaurantes, visa, pasaporte, mascotas y viajes terrestres.
3. Abrir cada formulario y completar los campos obligatorios. Asignar a cada producto costo proveedor 10.000, TA 1.000 y TA crédito 0, cuando corresponda. Si un plan usa pagos a varios proveedores, repartir esos mismos importes entre sus filas para no duplicar el costo.
4. En productos con listas, cargar dos pasajeros distintos. Marcar solo uno como titular. Poner asientos, bookings y tiquetes distintos donde el formulario los permita.
5. Cambiar entre formularios y volver: deben conservar los valores y no quedar pantallas vacías.
6. Avanzar a pago. Si se usaron exactamente los importes anteriores, sin servicios vinculados ni cargos adicionales, el total esperado es 187.000. Compararlo con el desglose real.
7. Registrar un pago por el total, guardar y anotar el id. Debe quedar pagada y aparecer una sola vez.
8. Reabrir el detalle y sus pestañas: deben aparecer los 17 productos y los datos propios de cada pasajero.
9. Generar el PDF: revisar pasajeros, fechas, importes públicos y ausencia de costos del proveedor.

## 3. Validaciones de personas y pasajeros

1. En una venta nueva, dejar vacía una fila de huésped o pasajero e intentar avanzar: debe indicar categoría, pasajero y motivo.
2. Probar documento vacío, CC con letras, nombre con números y nombre completo de una sola palabra. Debe impedir avanzar.
3. Poner el mismo documento en dos pasajeros del mismo producto: debe rechazarlo.
4. Corregir los datos: debe permitir avanzar y conservar lo ya escrito.
5. Revisar que check-in, migración, visa y SIM usan los tipos del catálogo.
6. En mascotas, comprobar que el dueño es de solo lectura. Volver al paso 1 y cambiar el cliente: debe actualizarse el dueño.
7. En clientes, responsables, usuarios y comisionistas, intentar guardar un nombre o documento inválido y después uno válido. Editar solo el teléfono y reabrir: el tipo y documento deben conservarse.

## 4. Campos y vouchers corregidos

1. SIM: elegir entrega por correo, dejar correo vacío o inválido y avanzar: debe bloquear. Usar `prueba@example.invalid`, guardar y reabrir: debe conservarlo. Ese correo es solo evidencia; no marcar envío de voucher.
2. SIM: cambiar a otro método de entrega; el correo deja de ser obligatorio.
3. Finca con mascotas: completar el tipo y revisar el voucher; no debe aparecer `null`.
4. Verificar que no se piden los campos retirados de finca, migración y SIM.
5. Crear un plan con tour vinculado y fecha; revisar el PDF: el tour debe mostrar su fecha.
6. Migración y visa en la venta 201: el formulario de migración dice "Trámite Migratorio" y "Vencimiento de Documento"; las pestañas y el PDF muestran Tipo de Documento, número y Vencimiento de Documento, y el PDF de visa trae el vencimiento. Con CC no debe aparecer la palabra pasaporte. El vencimiento es el del documento elegido.

## 5. Listado y paginación

1. Ir a una página posterior a la primera. Aplicar un filtro y luego limpiarlo: ambas acciones deben volver a la página 1.
2. Buscar `_`, `%` y `50%`: deben buscar esos caracteres literales, sin traer registros por comodines.
3. Filtrar un día con ventas conocidas cerca de medianoche. Comparar fechas con el día de Colombia mostrado en tabla.
4. Con datos descartables, dejar una sola venta en la última página de un filtro de estado. Anularla: debe ir a la última página válida y conservar el paginador.
5. Entrar con un usuario de alcance propios: recorrer páginas, búsqueda y créditos; no debe ver ventas ajenas.

## 6. Créditos y actualización del detalle

1. Crear una venta de prueba con pago parcial, responsable y vencimiento futuro. Anotar total, abono y saldo.
2. En Listado elegir Finalizado; pasar a Crédito y Cobros: ese filtro no debe ocultar la cartera.
3. Elegir cliente y filtros dentro del panel. Registrar un abono: deben conservarse la selección y los filtros.
4. Comprobar que se actualizan saldo y tarjeta del cliente. Los totales generales deben representar toda la cartera permitida, aunque haya filtros del panel.
5. Abrir el detalle, cerrarlo, pagar o anular la venta y reabrirlo: debe mostrar el estado nuevo.
6. Para simular fallo de recarga, abrir DevTools → Network → Request blocking y bloquear solo las peticiones del listado de ventas. Refrescar desde el panel: debe conservar las cifras anteriores, advertir que pueden estar desactualizadas y ofrecer Reintentar. Quitar el bloqueo y reintentar: debe recuperar los datos.

## 7. Carga de pantallas y PDF

1. Con Network abierto y caché deshabilitada, entrar primero al login y después recorrer las pantallas permitidas. Deben cargarse sus archivos al necesitarlos; menú y encabezado deben permanecer visibles durante la carga.
2. Generar el primer PDF y comprobar que se descargan las librerías necesarias y se produce el archivo.
3. En una sesión local descartable, bloquear en Network el archivo de una pantalla aún no abierta. Navegar a ella: debe intentar una recarga automática y después mostrar el error con Recargar si sigue bloqueado, sin bucle. Quitar el bloqueo y recargar.
4. Repetir con el archivo requerido para el PDF. La recarga puede perder cambios de un formulario abierto; hacer esta prueba sin trabajo pendiente.
5. Para almacenamiento bloqueado o archivo reemplazado durante publicación, usar un entorno de prueba controlado y registrar el caso como pendiente si no se reprodujo. No darlo por aprobado solo porque las pruebas unitarias pasen.

## Cierre

La venta por endpoints verifica persistencia y reglas del servidor. El cierre del hallazgo requiere además completar el recorrido visual del asistente, la navegación y el PDF. Conservar los ids de prueba; no borrar ni anular registros reales para preparar casos.
