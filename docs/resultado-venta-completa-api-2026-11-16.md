# Venta completa por la API, 2026-11-16

Venta **168** en la base local, creada con `POST /api/v1/sales` como `pruebas@itea.test`. Lleva las 17 categorías con todos los campos que lee cada `PRODUCT_HANDLERS`, pasajeros propios en las seis listas, las cuatro secciones de tramos (ida, escala de ida, regreso, escala de regreso), tres pagos a proveedores en el paquete y un check-in y un tour vinculados al paquete. El payload está armado a partir de los handlers del controlador, no copiado del asistente: las horas se mandaron sin `-05:00`, así que las horas corridas 5 horas al leer son del payload y no un error.

## Lo que quedó bien

- Total 187.000, pagada, pago con método y referencia; costo, TA y TA crédito por producto.
- Cada campo enviado quedó guardado en su tabla `prod_*`, en las 17 categorías, y vuelve en `GET /sales/168`.
- Pasajeros con su asiento, asiento de regreso, booking y tiquete, y un titular por producto, el elegido.
- Los cuatro tipos de tramo, en orden, con asiento y tiquete propios.
- Los tres pagos a proveedores del paquete, con proveedor y método.

## Lo que no está bien

1. **El vínculo de un servicio a su paquete no se guarda.** El asistente manda `linkedToPlanIndex` y `create` no lo lee: `parent_detalle_id` queda vacío. En producción hay 0 servicios vinculados. Se corrige en `docs/designs/servicios-vinculados-al-paquete-2026-11.md`.
2. **(Corregido el 2026-11-16, `catalogo-sin-perdida-silenciosa-2026-11.md`.) Un valor que no está en el catálogo se pierde sin error.** `resolveSupplierId`, `resolveAirlineId`, `resolvePaymentMethodId` y `resolveBaggagePlanId` devuelven `null` si el nombre no existe, y la venta se guarda sin ese dato. Con un aeropuerto, `construirTramoVuelo` devuelve `null` y el tramo entero se descarta. Visto en el código, no forzado en la venta: el asistente elige de listas, así que el riesgo viene de otros clientes de la API o de un nombre que cambie en el catálogo.
3. **(Corregido el 2026-11-16, `plan-equipaje-de-su-aerolinea-2026-11.md`.) El plan de equipaje no se valida contra la aerolínea.** Un tiquete de Copa se guardó con un plan de equipaje de Avianca.
4. **(Corregido el 2026-11-16, `catalogo-por-id-2026-11.md`.) Nombres distintos a la ida y a la vuelta (invariante 5).** El proveedor entra como `supplierName` en 13 formularios y sale como `supplier`. El seguro del auto entra como `all_risk`/`basic` y sale como `todo_riesgo`/`basico`; el voucher entiende los dos.
5. **Datos que se guardan y nunca se leen.** El método de pago al proveedor de cada producto (`metodo_pago_proveedor_id`) no vuelve en la API, salvo en los pagos del paquete. Las columnas generales de `detalle_venta` (`fecha_inicio_viaje`, `fecha_fin_viaje`, `origen`, `destino`) se llenan de forma dispareja (el destino del tiquete es la primera escala, la llegada de la SIM queda como fin de viaje) y ningún código las lee.
6. **Visa y pasaporte no registran al solicitante como pasajero.** Nombre y documento quedan como texto del producto, sin fila en `pasajeros_detalle`. No hay regla escrita que diga si es a propósito.

## Lo que no se probó

Los vouchers adjuntos y su envío por correo (apagados), y el PDF.

## Verificación del arreglo de vínculos (2026-11-16)

Se conservó la venta 168 original. Con autorización del usuario se reconstruyó el backend después de detectar que el controlador del contenedor no coincidía con el archivo del repositorio; antes de las solicitudes se comprobaron hashes de controlador/helper. La comprobación inicial del frontend por la cadena «Paquete:» fue insuficiente: existía también en el bundle anterior. Posteriormente, al revisar el PDF de la 169, se confirmó que el contenedor frontend todavía servía el resumen viejo «SERVICIOS ADICIONALES VINCULADOS», que omitía fechas. El usuario autorizó reconstruir también solo frontend; la revisión visual debe repetirse con ese build. Se ejecutaron seis casos locales, sin adjuntos ni envío de correos:

| Caso | Resultado |
|---|---|
| Repetir la 168 | Venta 169, 201: check-in y tour con padre paquete, total 187.000 |
| Dos paquetes; tiquete procesado antes | Venta 170, 201: tiquete, check-in y tour vinculados al segundo paquete, total 198.000 |
| Posición vacía intermedia en `planData` | Venta 171, 201: los mismos tres servicios vinculados al paquete de la posición original 2, total 198.000 |
| Tour con índice 5 y un solo paquete | 400 `VALIDATION_ERROR`, mensaje identifica «Tours #1», sin registros nuevos |
| Tiquete a una posición vacía y pasajero nuevo | 400 `VALIDATION_ERROR`, mensaje identifica «Tiquetería #1»; rollback completo, incluida la persona de prueba |
| Paquete vinculado al paquete 0 | 400 `VALIDATION_ERROR`, mensaje identifica «Planes #1», sin registros nuevos |

En las tres ventas válidas se verificó por GET el padre y los agregados del paquete contra los importes del payload. SQL confirmó `monto_total = sum(costo_proveedor + ta + ta_cre)`, 2/3/3 vínculos respectivamente y ningún padre de otra venta o categoría distinta de `planes`. En los tres rechazos se compararon conteos antes/después de ventas, detalles, pagos de venta, pagos a proveedores, pasajeros y personas: todos iguales. El pasajero nuevo del caso de rollback no quedó creado.

Pruebas automáticas: helper del índice (3 casos), controlador real sin API con frontera Prisma sustituida (4 casos) y render estático del voucher (19 casos, incluidas las 16 categorías no paquete). Se observaron fallos antes del arreglo y después los casos pasaron. `npm test` pasó sus 22 archivos; build de frontend, sintaxis de backend y `git diff --check` pasaron. Vite conserva un aviso de chunks mayores de 500 kB.

**No verificado visualmente:** voucher/PDF, alturas y saltos de página. El usuario lo revisará en su navegador con la sección 9 de `pruebas-pantalla-hallazgo-16.md`. Las ventas 169–171 no tienen equipaje vinculado ni las otras categorías vinculadas: su comprobación de contenido es automática y falta la visual. No se modificó producción ni se publicaron archivos. Los hallazgos 2 a 6 siguen abiertos.

**Actualización de frontend local:** reconstrucción autorizada completada; TypeScript/Vite pasaron. La lectura posterior del contenedor confirmó `Sales-i5SIwF0A.js` con el renderizador `embedded` y ausencia del resumen anterior en todos los assets. Falta recargar con Ctrl+F5 y regenerar el PDF de la 169 para la confirmación visual; no se crearon nuevas ventas por esta actualización.

**Revisión de la validación (2026-11-16):** la regla pasó a `resolvePlanLinks`, antes de la transacción. Con el backend reconstruido (controlador y helper del contenedor idénticos al repo), se repitieron los casos: ventas 172 (2 vínculos, 187.000), 173 (3 vínculos al segundo paquete, 198.000) y 174 (3 vínculos con posición vacía intermedia, 198.000), todas con `monto_total` igual a la suma de sus filas y ningún padre fuera de la venta o de `planes`. Cuatro rechazos con HTTP 400 y el servicio nombrado ("Tour #1", "Tiquetería #1", "Paquete #2", y `'0x0'` como índice): ventas, detalles, pagos, pagos a proveedores, pasajeros y personas con el mismo conteo antes y después.

**Arreglo del catálogo (2026-11-16):** con el backend reconstruido (controlador y `catalog.js` del contenedor idénticos al repo), la venta completa se guardó igual (175, 187.000), y también con `' clic  kiu'` como proveedor, `'copa airlines'` como aerolínea y un tramo vacío (176: proveedor 9, aerolínea 3, 4 tramos). Nueve rechazos con 400 que nombran servicio y valor: proveedor, método de pago al proveedor, aerolínea, plan de equipaje, aeropuerto de una escala, método de un pago del cliente, proveedor de un pago del paquete, método de pago de la venta y `'123 Viajes'`, que ya no se toma como el id 123. Ventas, detalles, pagos, pagos a proveedores, pasajeros, personas y tramos con el mismo conteo antes y después. Un abono a la venta 155 con método inexistente dio 400 sin cambiar sus pagos ni su estado.

**Plan de equipaje de su aerolínea (2026-11-16):** con el backend reconstruido, la venta de prueba con el plan de AVIANCA en el tiquete de Copa dio 400, y un tramo con plan propio de otra aerolínea también; sin registros nuevos. Con "Copa Airlines - Basic" se guardó (177: los cuatro tramos con el plan de Copa), y con una escala de AVIANCA sin plan propio (178) esa escala quedó con su aerolínea y sin plan, y las demás con el de Copa.

**Datos de catálogo por id (2026-11-16):** con la migración aplicada en local y el backend reconstruido, la venta con todos los ids (181) guardó la tarjeta y dejó vacío el método en cada producto y pago de paquete; la misma con los nombres de hoy (182) guardó el método sin tarjeta, y con nombres de tarjeta (183) la tarjeta. Siete rechazos con 400 (proveedor, tarjeta, aerolínea, plan de equipaje, proveedor de un pago del paquete, método de un pago del cliente y aerolínea de un tramo) sin registros nuevos. Abonos con `paymentMethodId` y con `method` aceptados. Un paquete terrestre con empresa libre se guardó (184). `GET /sales/:id` y `/details` devuelven los pares id y nombre, sin `supplierName` ni `airlineName`, y el mismo desglose del paquete (5 líneas, 33.000). El script de la corrección, probado en local con ROLLBACK, abortó por la guarda de conteos.

## Preparación por API para la revisión visual de la sección 10

El usuario autorizó reconstruir el frontend y preparar por API las pruebas de catálogo; autorizó usar `ponytail` global al faltar la instalación local. Se reconstruyó solo frontend y se verificó que el backend coincide por hashes de controlador y `catalog.js`. No se cambió código, configuración, esquema ni producción. Sin adjuntos, correos o Siigo; la sesión de pruebas se cerró al terminar.

- **185:** 17 categorías por id, total 187.000; 16 detalles con tarjeta y 3 pagos de paquete con tarjeta. GET y `/details` coinciden en los ids enviados y nombres de proveedor, aerolínea, equipaje, tarjeta y método; seguro `all_risk`. Los cuatro tramos conservan los ids y «Copa Airlines - Basic». El desglose del paquete coincide entre endpoints y muestra PRECOMPRAS CLIC AIR en sus tres pagos y Samtur Bancolombia Negocios en sus servicios vinculados.
- **186:** auto con `insuranceType: basic`, total 11.000; mismo contrato en ambas lecturas.
- **187:** paquete terrestre con empresa libre y tres pagos, total 11.000; la empresa no se persiste, límite previo documentado, pero no se intenta resolver como aerolínea y la venta se guarda.
- **SQL:** cada total coincide con la suma de sus detalles. Ningún detalle con tarjeta copia su método; los 6 pagos de paquete con tarjeta de las ventas 185/187 también mantienen vacío el método guardado, para derivarlo de su tarjeta al leer.
- **Siete rechazos 400:** ids inexistentes de proveedor, tarjeta, aerolínea y equipaje; proveedor de texto fuera del catálogo; equipaje de otra aerolínea; método inexistente del pago del cliente. Se compararon antes/después los conteos de ventas, detalles, personas, pagos de venta, pagos a proveedores y pasajeros: sin registros nuevos.
- **Autocompletado preparado:** el catálogo contiene TEMPORADA ALTA ADZ (id 1), proveedor VIAJES VIASSA y aerolínea AVIANCA. La selección y el autocompletado se verifican en pantalla, no por crear una venta desde la API.

El usuario confirmó los siete puntos visuales de la sección 10: interacción de Combobox, tarjetas, filtrado, autocompletado y voucher/PDF. Reportó dos incidencias adicionales (documentos del resumen y nombres/iconos de pestañas), documentadas en la sección 11 de la lista visual; su corrección se verifica por separado.
