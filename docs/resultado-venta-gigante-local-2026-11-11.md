# Venta gigante local: resultado por API

Fecha: 2026-11-11. Rama `feat-bayrol`, código de aplicación `1016e36`; las correcciones de migración y visa que salieron de esta prueba son los commits `a357200` y `4db83f9`. Solo entorno Docker local; sin navegador, envíos de correo ni llamadas a Siigo.

## Preparación

- Backend reconstruido con `docker compose up -d --build backend`.
- Se aplicaron **tres** migraciones, confirmadas en `_prisma_migrations` a las 23:52:50 UTC del 2026-11-11: `20261109210809_proveedores_creado_por`, `20261111190000_quitar_campos_sin_uso_tour_seguro` y `20261111200000_simcard_email_entrega`. El informe inicial omitió la primera, aunque también se aplicó durante el arranque.
- La migración de tour y seguros ya eliminó de la base local `prod_tours.tour_nombre` y `prod_seguros.cobertura_usd`, `dias_cobertura`, `fecha_inicio_vigencia` y `fecha_fin_vigencia`. Se confirmó su ausencia en `information_schema.columns` durante la auditoría posterior.
- Antes de migrar: cero tours con nombre no vacío y cero seguros con cobertura, días o vigencia significativos.
- Usuario sintético `prueba.gigante@local`, id 10, rol administrador local. Creado directamente con Prisma y contraseña bcrypt para disponer de acceso inicial; las pruebas de ventas se ejecutaron mediante HTTP autenticado con `/auth/login`.
- Clientes sintéticos: 108 (Ana Prueba Gigante) y 109 (Luis Prueba Gigante). Responsable sintético: 10 (Rosa Prueba Gigante).

## Venta 198

Creación HTTP 201. Una fila de producto de cada una de las 17 categorías. Lectura completa y lectura de cada categoría por `/sales/198/details`: HTTP 200, una fila y total 1 por categoría.

- Costo de proveedores: 170.000; TA: 17.000; TA crédito: 0; total: 187.000.
- Se envió deliberadamente `total: 1` y `status: pagado` con un abono de 17.000. El servidor calculó 187.000 y guardó `abonado`.
- Plan con dos filas de pagos a proveedores: sus importes se incluyeron en el total.
- Pago posterior por 170.000: estado `pagado`, abonado acumulado 187.000 y salida de la cartera. Pago adicional rechazado con HTTP 409.
- Comprobación SQL mediante Prisma: 17 detalles; suma de subtotales y suma de pagos iguales al total.
- Sin incremento de personas durante la creación de la venta; se reutilizaron las personas de los clientes de prueba.
- Vehículos, equipaje y mascota apuntan al cliente. Tiquete con asientos 11A y 11B, un único titular y dos tramos de vuelo.
- Correo de entrega de eSIM conservado como `prueba@example.invalid`.

## Rechazos sin escrituras

Cada caso se intentó por POST `/sales`. Se compararon antes y después los conteos de ventas, personas, detalles y pagos; permanecieron iguales.

| Caso | HTTP |
|---|---|
| Sin productos | 400 |
| Fila de huésped vacía | 400 |
| CC con letras | 400 |
| Tipo `TI` inexistente en catálogo | 400 |
| Documento repetido entre huéspedes | 400 |
| Correo de entrega eSIM inválido | 400 |
| Pagos superiores al total | 409 |

## Datos disponibles para pantalla

| Venta | Uso | Estado final | Total | Abonado | Saldo |
|---|---|---|---:|---:|---:|
| 198 | Revisar 17 categorías y PDF | pagado | 187.000 | 187.000 | 0 |
| 199 | Probar créditos y abonos | abonado | 100.000 | 20.000 | 80.000 |
| 200 | Comprobar estado anulado | anulado | 100.000 | 20.000 | No cobrar |
| 201 | Revisar campos completos y PDF (ver abajo) | pagado | 187.000 | 187.000 | 0 |

La venta 200 fue anulada por endpoint; un pago posterior devolvió 409 y no reactivó la venta. No se generaron filas de facturación Siigo para ninguna de estas ventas.

## Límites

La primera prueba no envió proveedores ni varios campos opcionales; no acreditaba su conservación. Tras la revisión del usuario se ejecutó la prueba completa de la venta 201 que se detalla abajo. Una prueba HTTP no verifica el montaje de formularios, validaciones del navegador, conservación del estado visual ni el PDF final. Esos casos siguen en `pruebas-pantalla-hallazgo-16.md`.

No se probó en esta venta el vínculo de un tour a un plan, las escalas de vuelo ni los permisos de un rol con alcance propios. Se mantiene pendiente su prueba específica. No se modificaron datos de producción.

## Segunda prueba: venta 201 con campos completos

Se conservaron las ventas anteriores. Se reutilizaron los clientes 108 y 109, el responsable 10 y el usuario 10. Total 187.000, estado final pagado tras un abono de 17.000 y el pago de 170.000. Se repitieron los siete rechazos sin escrituras.

Cada comprobación siguiente comparó request, base de datos y los endpoints de detalle completo y paginado:

| Campo | Resultado |
|---|---|
| Proveedor de las 17 categorías | Relación guardada y nombre devuelto en ambos detalles; se ejercitaron `supplier` y `supplierName` según formulario |
| Pagos del paquete | Dos filas con conceptos transporte y hotel, proveedor, método y sus importes |
| Equipaje de ida y regreso | Políticas del catálogo conservadas: AVIANCA Flex y AVIANCA Light respectivamente |
| Referencia del hotel en paquete | `HOTEL-QA-2027` |
| Punto de encuentro del tour | `Recepcion Hotel Prueba` |
| Espacio de convención | `Salon principal 100 m2` |
| Mesa de restaurante | `Terraza junto a ventana` |
| Ocasión especial | `Aniversario de prueba` |
| Maletas de check-in | `Una maleta de 23 kg` |
| Garantía del auto | `Garantia de prueba terminacion 4242` (texto sintético) |
| Documento de migración | CC, `991111260010`, con vencimiento conservado |
| Documento de visa | Pasaporte, `PA99111126`, vencimiento `2031-06-30` |

### Corrección confirmada

El detalle de migración y visa leía `passportNumber`, aunque la API devuelve `docNumber`. Se corrigieron ambos bloques para mostrar Tipo de Documento y Nro Documento. El voucher también muestra el tipo elegido y el número, sin llamar pasaporte a una CC. Decisión del usuario reflejada primero en la spec de vocabulario.

No se necesitaron cambios de backend ni migraciones adicionales: los campos enviados se conservaron. La ausencia del resto de campos en la venta 198 provenía del payload incompleto.

### Verificación del frontend

- 115 pruebas aprobadas y TypeScript sin errores.
- Render de `VoucherPDF` con React a HTML: comprobados documento CC y pasaporte y ocho valores de la venta, sin rótulo fijo N° Pasaporte ni etiqueta de costo de proveedor. Esta comprobación se ejecutó con un script temporal, fuera de la suite de funciones puras.
- Build del frontend Docker con TypeScript y Vite aprobado. Se actualizó el frontend local para la revisión del usuario.
- Sin navegador ni generación de PDF con html2canvas: quedan pendientes layout, paginación del PDF y comparación visual de pestañas. El HTML comprobado no certifica el PDF final.

## Auditoría posterior de migración y visa

- En el estado auditado, el commit `a357200` ya reemplazaba Documento Solicitado por Trámite Migratorio en el voucher; no se duplicó ese cambio.
- Se encontraron otras dos inconsistencias: las vistas seguían llamando Vencimiento Pasaporte al campo que ambos formularios llaman Vencimiento de Documento, y el voucher de visa no mostraba ese vencimiento.
- Se unificó el rótulo en ambos detalles y en el voucher de migración, y se agregó el vencimiento al voucher de visa. Sin cambios de esquema, backend o nombres de campos del contrato.
- Verificación: TypeScript y `git diff --check` aprobados. Render real de React a HTML con documentos CC y Pasaporte, fechas 01/01/2030 y 30/06/2031, y datos vacíos; se comprobaron los bloques individuales de migración y visa, sin `Invalid Date`, `undefined` o `null` visibles. Los vacíos muestran un guion largo.
- Sin otros errores encontrados en el alcance revisado (formulario, escritura y lectura del servidor, tipos, detalle y HTML del voucher de migración y visa). Esto no certifica todas las categorías ni la apariencia del PDF final.
- El usuario confirmó que el vencimiento es el del documento elegido, no siempre el del pasaporte. Eso reemplazó la decisión anotada esa mañana en la spec de vocabulario, que quedó corregida (`4db83f9`).
- El usuario confirmó que la comprobación del HTML fue un render real del voucher, no una lectura del código.
- El contenedor web local se reconstruyó con `4db83f9`; la app en `:80` ya muestra estos cambios. Falta la revisión visual del usuario y, tras el merge, publicar el frontend en GoDaddy.
