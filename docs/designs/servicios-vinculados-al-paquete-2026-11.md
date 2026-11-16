# Servicios vinculados al paquete

Diseño del 2026-11-16. Rama `feat-bayrol`. Invariante 3, spec `docs/specs/2026-09-17-dinero-y-totales.md`.

Estado: diseño aprobado e implementado. Pruebas automáticas, build y seis casos locales por API/SQL verificados el 2026-11-16; ventas nuevas 169, 170 y 171. Pendientes la revisión visual del usuario y la publicación. El alcance incluye backend y reorganizar los bloques del voucher para las 16 categorías de servicios; supera un arreglo aislado del vínculo.

## Por qué

El asistente deja vincular cualquier servicio que no sea un paquete (tiquete, hotel, seguro, tour, check-in y los demás) a un paquete de la misma venta, y lo manda en `linkedToPlanIndex`: la posición del paquete en `planData`. `create` nunca lee ese dato, así que `parent_detalle_id` queda vacío. Ya existen `agregarPorPadre` (el total pagado a proveedores del paquete), una representación resumida de los servicios dentro del paquete en el voucher y la prueba de pantalla 4.5. El diagnóstico previo reportó 0 servicios vinculados en producción; ese conteo no se repitió en esta revisión. En la venta 168 de prueba, el check-in y el tour vinculados quedaron sueltos.

## Objetivo

- Un servicio vinculado en el asistente queda guardado con `parent_detalle_id` apuntando al paquete elegido.
- Un vínculo a un paquete que no existe se rechaza con un 400 que dice qué servicio y por qué, en vez de perderse.
- Regla confirmada en chat: cualquier servicio puede vincularse a un solo paquete de la misma venta. Los paquetes no pueden vincularse entre sí.
- El voucher muestra cada servicio vinculado una sola vez, dentro de su paquete y conservando todos los datos de su bloque independiente. Incluye equipaje. El usuario confirmó incluir el cambio de frontend y su publicación; la ejecución del despliegue requiere confirmación aparte.

No es objetivo: editar vínculos después de creada la venta (no hay edición de ventas), reconstruir vínculos perdidos en ventas viejas, ni modificar Siigo. Que una venta vieja no tenga vínculo guardado no permite deducir si el usuario había elegido uno.

Sería un fracaso: que cambie el total de la venta. El vínculo solo agrupa; `monto_total` sigue saliendo de todas las filas.

## Enfoques

- **A. Ids generados en el servidor y el vínculo después del create (elegido).** Cada `detalle_venta` recibe su id con `crypto.randomUUID()` antes del create anidado; después, dentro de la misma transacción, un `updateMany` por paquete pone `parentDetalleId` a sus hijos. No depende del orden en que Prisma inserta las filas de un create anidado.
- **B. `parentDetalleId` en el mismo create anidado, con los paquetes primero.** Una sola escritura, pero depende de que Prisma inserte en el orden del arreglo para que la clave foránea al hermano exista. Descartado: si ese orden cambia, la venta entera falla.
- **C. El frontend manda el id del paquete.** El paquete no tiene id antes de guardarse. Descartado.

El usuario confirmó el enfoque A. Para el voucher confirmó reutilizar los bloques completos existentes dentro del paquete: preserva los datos y una sola implementación por categoría. Se descartó mantener bloques independientes para las versiones vinculadas, porque duplicaría lógica y facilitaría divergencias de campos. El resumen actual tampoco satisface la conservación de datos acordada.

## Diseño

**Función pura** `resolvePlanLinks(data, products)` en `backend/src/utils/planLinks.js`, llamada antes de abrir la transacción, junto a `passengerError`: recorre cada categoría y devuelve `[{ field, itemIndex, planIndex }]` por servicio vinculado, o lanza un 400 `VALIDATION_ERROR` que nombra el servicio con el nombre de `NOMBRE_CATEGORIA` ("Tour #1", "Paquete #2"). Sin vínculo es `undefined`, `null` o `''`; el índice solo se acepta como entero o como texto de dígitos (`/^\d+$/`), porque `Number()` también convierte `'1e0'`, `'0x1'` o `' 1'`; tiene que apuntar a una posición de `planData` con un paquete no vacío; un paquete con vínculo se rechaza. Prueba en `frontend/tests/planLinks.test.mjs`, como `markHolder`.

Comprobar el tipo antes de convertir: booleanos, arreglos, objetos y texto compuesto solo por espacios son inválidos; no pueden convertirse accidentalmente en el paquete 0.

**En `create`** (`sales.controller.js`):

1. Cada `detalleObj` lleva `id: randomUUID()`.
2. Los paquetes se cuentan por su posición en `data.planData`, incluidas las filas vacías que el loop salta, para que el índice que manda el asistente coincida. Un paquete saltado no tiene id; vincular a él es un 400.
3. Durante el recorrido se guardan los vínculos pendientes por id del hijo e índice del paquete. Solo después de construir todos los detalles se resuelven contra el mapa completo de paquetes: los tiquetes se recorren antes que los paquetes y también deben poder vincularse. El índice de cada servicio sale de lo que ya devolvió `resolvePlanLinks`, así que dentro de la transacción no queda nada que validar.
4. Tras resolver todos los vínculos y ejecutar `tx.ventas.create`, un `tx.detalleVenta.updateMany({ where: { id: { in: hijos } }, data: { parentDetalleId } })` por paquete, dentro de la misma transacción.
5. El mensaje de error dice la categoría y el número del servicio, como `passengerError`: "Tour #1: el paquete vinculado no existe".

**Voucher.** Reutilizar los bloques actuales de cada categoría para los servicios independientes y vinculados, conservando datos, pasajeros y la opción actual de mostrar precios. No mantener una segunda versión resumida. El servicio vinculado se excluye de las secciones independientes y se renderiza dentro de su paquete. Implementado con `renderServices(parentId)` y bloques `embedded`, también para equipaje; se retiró `getChildrenForPlan` y su resumen incompleto.

Detalle técnico para cumplir la conservación de datos en PDF: `Sales.tsx` reparte tarjetas por sus hijos directos. Evitar envolver todos los servicios del paquete en un bloque indivisible; mantener cortes entre sus bloques y repetir el contexto del paquete en las continuaciones. No introducir como parte de este arreglo un paginador nuevo ni resolver el límite previo de tablas individuales más altas que una página.

**Compatibilidad y publicación.** El código local del asistente manda `linkedToPlanIndex` y `wizardData.ts` corrige los índices cuando se quita un paquete. La afirmación sobre el bundle publicado en GoDaddy proviene del diagnóstico previo; no se verificó en esta revisión. El alcance acordado requiere publicar frontend y backend. Propuesta técnica del agente: publicar primero el frontend compatible con ventas sin vínculos y después el backend, para evitar que el voucher anterior muestre los vínculos nuevos con el resumen incompleto. Comprobar esa compatibilidad en local antes de preparar el despliegue. No requiere migración: la columna y la relación ya existen.

**Nombres.** Lo nuevo va en inglés: `resolvePlanLinks`, `planDetailIds`, `childLinks`.

**Revisión del 2026-11-16.** La primera versión validaba dentro de la transacción, después de buscar proveedores y crear personas que luego se revertían, y se probaba cargando el controlador entero en una máquina virtual con un Prisma simulado (`createPlanLinks.test.mjs`), que se rompía con cualquier dependencia nueva. Al sacar la regla a una función pura llamada antes de la transacción, esa prueba se borró: la regla se prueba directo y la escritura real se verifica por la API. El mensaje dice "Paquete", como la interfaz, y no "Planes" (invariante 5).

**Spec primero.** Se actualizó `2026-09-17-dinero-y-totales.md` antes del código: la fila "Total de un paquete" indica que el vínculo se guarda al crear desde `linkedToPlanIndex`, solo admite servicios a paquetes de la misma venta y un índice inválido es un 400.

## Verificación

- Prueba unitaria de `resolvePlanLinks`: sin vínculo, servicio antes que el paquete, posición vacía, fuera de rango, formatos que `Number()` aceptaría (`'1e0'`, `'0x1'`, espacios), paquete vinculado a paquete y el nombre del servicio en el mensaje. Falla antes de la función.
- Con permiso: reconstruir el backend y repetir la venta 168 por la API. El check-in y el tour quedan con `parent_detalle_id` del paquete, `monto_total` sigue en 187.000, y `GET /sales/:id` trae `parentDetalleId` y los `totals` del paquete sumando sus hijos. Un `linkedToPlanIndex: 5` con un solo paquete da 400 y no crea nada.
- `node --check`, `npm test`.
- Con permiso: probar varios paquetes, un tiquete vinculado al segundo y una posición vacía intermedia sin desplazar índices. Rechazar vínculos a la posición vacía, sin paquetes y entre paquetes. Ante un rechazo, verificar que tampoco queden personas nuevas, detalles ni pagos de esa solicitud.
- Frontend: `npx tsc --noEmit` y build. Verificar voucher con cada categoría vinculada, especialmente equipaje, vuelos y pasajeros: una sola aparición dentro del paquete, con todos sus datos; servicios independientes sin cambios. Incluir mostrar y ocultar precios, paquetes múltiples y contenido que ocupe varias páginas.
- Lo visual incluye la prueba 4.5 de `pruebas-pantalla-hallazgo-16.md`. El usuario confirmó que revisará el voucher y el PDF desde su navegador, con una lista de comprobación preparada durante la implementación. Esta revisión no queda cubierta por las pruebas de API.
