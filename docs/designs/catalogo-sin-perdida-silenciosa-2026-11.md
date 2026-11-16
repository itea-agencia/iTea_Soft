# Un dato de catálogo que no existe se rechaza, no se pierde

Diseño del 2026-11-16. Rama `feat-bayrol`. Hallazgo 2 de `docs/resultado-venta-completa-api-2026-11-16.md`. Invariante 4 (la interfaz no afirma lo que no puede saber): una venta guardada "con éxito" sin el proveedor que eligió el asesor afirma algo falso.

## Por qué

`create` resuelve por nombre el proveedor, el método de pago, la aerolínea, el plan de equipaje y los aeropuertos con `resolveSupplierId`, `resolvePaymentMethodId`, `resolveAirlineId`, `resolveBaggagePlanId` y `resolveAirportId` (`sales.controller.js`). Si el nombre no existe, devuelven `null` y la venta se guarda sin ese dato; un aeropuerto que no existe hace que `construirTramoVuelo` descarte el tramo entero. No es solo un riesgo de otros clientes de la API: el `Combobox` del asistente acepta texto libre, así que "Clic Kiu" en vez de "CLIC KIU", o un proveedor que aún no está cargado, se guarda sin proveedor.

Medido en producción el 2026-11-16, en solo lectura: 7 productos sin proveedor, todos de junio a agosto, y ninguno desde octubre; 1 tiquete sin aerolínea (2026-09-19); 0 pagos sin método. Hay 4 proveedores y 2 aerolíneas con espacios al borde del nombre (en local, `AVIANCA `), que una comparación exacta no encuentra.

Además, los resolvedores tratan como id cualquier valor que empiece con un número: `parseInt('123 Viajes')` es 123, y un id que no existe termina en un 500 por clave foránea. Hoy ningún proveedor empieza con un dígito.

## Objetivo

- Un valor no vacío que no se encuentra en su catálogo rechaza la venta (o el pago) con un 400 `VALIDATION_ERROR` que dice qué servicio, qué campo y qué valor: "Tour #1: el proveedor «Clic Kiu» no existe".
- Un nombre se encuentra aunque difiera en mayúsculas o espacios al borde.
- Un id solo se acepta si es un entero completo y existe.

No es objetivo: crear proveedores al vuelo (cada error de tipeo ensuciaría el catálogo y el contador del dashboard), restringir el `Combobox` a la lista (pide publicar el frontend; queda como mejora aparte), ni corregir los 7 productos viejos sin proveedor (no se sabe qué se escribió).

Sería un fracaso: rechazar una venta que hoy se guarda bien. Un campo vacío sigue siendo válido donde hoy lo es; solo cambia el caso del valor escrito que no existe.

## Enfoques

- **A. Rechazar lo que no se encuentra (elegido por el usuario).** Ningún dato se pierde y el catálogo no se ensucia. Con el frontend viejo, el asesor ve el error y elige de la lista.
- **B. Crear el proveedor si no existe.** Descartado: ensucia el catálogo y no sirve para aerolíneas ni aeropuertos.
- **C. Restringir el campo a la lista en el frontend.** Complemento posible, no reemplazo: no protege a otros clientes de la API y pide publicar.

## Diseño

**Índice de catálogo en memoria.** Los catálogos son chicos (en producción: 66 aeropuertos, 28 proveedores, 19 aerolíneas, 48 políticas de equipaje, 11 métodos de pago, 2 tarjetas de agencia). Al empezar `create` y `registerPayment` se cargan una vez y se arma un índice por tipo. Funciones puras en `backend/src/utils/catalog.js`:

- `buildIndex(rows)`: `rows` es `[{ id, keys: [...] }]`; devuelve el índice con los ids y cada clave normalizada (recorte de espacios, minúsculas, espacios internos colapsados).
- `findId(index, value)`: `null` si el valor está vacío (`undefined`, `null`, `''` o solo espacios); el id si es un entero completo (número o texto `/^\d+$/`) que existe, o si la clave normalizada existe; `undefined` si no se encuentra.

Claves por catálogo: proveedor por `nombre`; aerolínea por `nombre`; método de pago por `nombre` de `metodos_pago` y por `nombre` de `tarjetas_agencia` (apunta al método de la tarjeta, como hoy); plan de equipaje por `"<aerolínea> - <tarifa>"`, que es lo que manda el asistente, y por la tarifa sola solo si es única entre todas las aerolíneas; aeropuerto por `codigo_iata`.

**En el controlador.** Los cinco resolvedores pasan a leer el índice en vez de la base, y si `findId` devuelve `undefined` lanzan el 400 con el nombre del servicio (`NOMBRE_CATEGORIA`, como en los vínculos), el campo y el valor. Los transforms que resuelven aerolínea y equipaje (tiquete, paquete, equipaje) reciben el contexto como cuarto argumento. Un tramo sin origen ni destino se sigue omitiendo como hoy (es una fila vacía del formulario); uno con un aeropuerto que no existe se rechaza. Los pagos del cliente (`payments[].method`) pasan por el mismo índice; `registerPayment`, también. El método principal de la venta no se valida contra el catálogo: se deriva de los pagos (el de un pago único; vacío con varios o ninguno). El asistente manda ahí "Mixto" o "Otro", que no existen, y la primera versión de este arreglo rechazaba por eso toda venta con dos o más pagos (22 en producción); se corrigió antes del merge.

La validación ocurre dentro de la transacción, mientras se arman los productos: un rechazo revierte las personas que se hayan creado para productos anteriores. Se eligió así para no duplicar en una pasada previa la lista de campos que ya leen los handlers; si una lista aparte quedara desalineada, el dato volvería a perderse sin aviso. El costo es trabajo descartado en una venta inválida, que es rara.

**Nombres.** Lo nuevo va en inglés: `buildIndex`, `findId`, `catalog`.

**Spec primero.** Una fila nueva en "Dónde vive la regla" de `2026-09-17-dinero-y-totales.md`: proveedor y método de pago son los datos con que se concilia cada pago, y una referencia a un catálogo que no existe es un 400, nunca un dato vacío.

## Verificación

- Prueba unitaria de `buildIndex` y `findId` en `frontend/tests/catalog.test.mjs`: vacío, nombre exacto, mayúsculas y espacios, id numérico y texto, id inexistente, `'123 Viajes'` no es un id, tarifa ambigua sin aerolínea, aeropuerto por código. Falla antes del módulo.
- Con permiso: reconstruir el backend y repetir la venta 168 por la API (debe guardarse igual, con `AVIANCA ` y nombres en otro caso resolviendo bien). Después, una venta por cada tipo con un valor inexistente (proveedor, método de pago al proveedor, aerolínea, plan de equipaje, aeropuerto de una escala, método del pago del cliente) y un abono con un método inexistente: 400 con el servicio y el valor, sin registros nuevos.
- `node --check`, `npm test`.
- Sin cambios de interfaz: el asesor ve el mensaje de error que ya muestra el asistente al guardar.
