# Hallazgos de prioridad alta de la auditoría del frontend

Diseño para corregir los hallazgos 1, 2, 4 y 5 de `docs/auditoria-frontend-2026-11-08.md`. El estado de los 16 hallazgos está en la sección "Estado" de ese documento.

**Estado de este diseño: acordado. Implementados el 2 y el 5; faltan el 1 y el 4.**

## Por qué

Son fallos encontrados leyendo el código, no incidentes: en la operación pasan rara vez o nunca (decisión del usuario, 2026-11-09). Por eso cada corrección tiene que ser la mínima, y ninguna justifica rehacer una pantalla ni arriesgar el flujo de ventas.

## Fuera de alcance

- **Hallazgo 3, Siigo.** Hoy no se usa Siigo y no se toca (decisión del usuario, 2026-11-09). Ver "Lo que queda abierto".
- Los hallazgos de prioridad media, aunque toquen los mismos archivos (invalidación de caché, purgar cachés al salir, errores de red).
- Cambiar dónde se guarda el token o cancelar peticiones con `AbortController`.
- Cambiar `createSettlement`: la lógica que registra el pago ya valida las ventas y calcula el monto en el servidor.

## Orden y entrega

Una rama, un commit por hallazgo, en este orden: 2, 1, 5, 4. El 4 va último porque toca el asistente de ventas y lo visual no se puede verificar en este entorno.

El hallazgo 5 cambia el backend. **El backend tiene que estar desplegado antes de publicar el frontend**: el frontend nuevo depende de los campos que agrega. El frontend publicado sigue funcionando con el backend nuevo, porque los campos solo se agregan.

## Hallazgo 2: logout sin Authorization

`logout()` llama a `apiLogout()` y borra el token en el mismo tick. El interceptor de Axios lee `localStorage` después, y la petición sale sin Authorization.

- `logout()` guarda el token antes de limpiar y se lo pasa a `apiLogout(token)`, que manda el header explícito. El interceptor no lo pisa, porque ya no encuentra token.
- La limpieza local ocurre siempre, aunque la revocación falle.

## Hallazgo 1: respuestas de otra sesión

La identidad de una petición es el token con el que salió, sin contador de generaciones: el token cambia en el mismo tick del logout, sin esperar a un render.

- Cada carga de `DataContext` que escribe estado o caché guarda el token al empezar y, al resolver, descarta el resultado si `localStorage.getItem('itea_token')` ya es otro.
- Se aplica a dashboard, ventas, clientes, responsables, usuarios, config, permisos de rol, vuelos, comisionistas (los dos listados) y liquidaciones.
- La comprobación también tiene que cubrir la escritura de la caché: en `fetchSales` y `fetchClients` ocurre dentro del updater de `setData`, que puede correr más tarde.

## Hallazgo 5: comisiones

Hoy la pantalla calcula el acumulado y elige las ventas a liquidar desde `data.sales`, una lista que ella no carga. La columna `comisionistas.acumulado` no la actualiza nadie después del alta: se deja de leer, sin migración.

**Backend**, `commissions.controller.js`:

- `listAgents` devuelve `accumulated` derivado de las ventas y un campo nuevo, `pendingSaleIds`, con las ventas que lo componen. El criterio es el de `getPendingCommission`: `comision_liquidada = false`, sin anuladas y sin eliminadas. La rama `para=venta` no cambia.
- `getAgent` devuelve `accumulated` con `getPendingCommission`.

**Frontend**:

- `CommissionAgents.tsx` deja de recalcular `accumulated`.
- `settleCommissions` manda las `pendingSaleIds` del comisionista que se está liquidando, de modo que se paga lo que se vio. Una venta que entre en ese momento queda para la siguiente liquidación. Una que se anule entre tanto da el 409 que ya existe.
- Después de liquidar se recarga la lista de comisionistas.

**Umbral para "listo para liquidar".** Hoy el directorio usa 50.000 fijos y el detalle usa `paymentThreshold`. Regla confirmada por el usuario (2026-11-10) e implementada en `settlementThreshold()` de `creditUtils.ts`: el umbral del comisionista si es mayor que 0, y 50.000 si no. La usan el directorio, la pestaña de pendientes y el detalle. En producción (2026-11-09) ningún comisionista tiene umbral propio, así que usar solo `paymentThreshold` dejaría el umbral en 0 para todos.

## Hallazgo 4: clientes y comisionistas por nombre

Se sigue el patrón que ya usa el asesor en `Step1Client.tsx`: `value` es el id en texto y `label` lo que se lee.

- `form.clientId` guarda el id. La etiqueta del cliente es el nombre con su documento, para distinguir homónimos.
- Cada `.find(c => c.name === form.clientId)` pasa a comparar por id: `Step1Client.tsx` y las cinco apariciones de `NewSaleWizard.tsx`. Antes de cambiarlo hay que revisar los demás usos con `grep`, incluidos `Step2Products.tsx` y `wizardData.ts`.
- El comisionista también se elige por id. `commissionAgentName` se conserva porque el payload lo manda.
- Un texto que no corresponde a nadie se sigue rechazando con el error que existe hoy.
- La clave del borrador pasa de `itea_new_sale_draft_v2_` a `v3`: los borradores viejos guardan el nombre y se descartan una vez. El logout ya los borra por prefijo.

En producción (2026-11-09) no hay homónimos entre 126 clientes y 2 comisionistas: es prevención.

## Verificación

- `npx tsc --noEmit` y las pruebas de `frontend/tests/`. La lógica que se pueda probar sin la app lleva su prueba primero. Las reproducciones de la auditoría sirven de punto de partida para los hallazgos 1 y 2.
- Hallazgo 5: comparar por SQL el `accumulated` de la API con la suma de las ventas, contra la base local. Levantar la API necesita permiso del usuario.
- Lo visual no se puede verificar en este entorno: el selector de cliente y la pantalla de comisiones los tiene que mirar una persona.
- Antes de implementar el 5, revisar lo que dice de comisiones `docs/specs/2026-09-17-dinero-y-totales.md`: el cambio aplica los invariantes 2 y 3, y si la spec lo contradice se actualiza primero.

## Lo que queda abierto

- **Hallazgo 3, Siigo, sin corregir.** `createSiigoInvoice` devuelve `res.data` en vez de `res.data.data`, así que un dry run se mostraría como factura emitida y una factura real sale sin número ni enlace. Rompe el invariante 4. En producción hay 42 facturas emitidas y ninguna en dry run. **Si se vuelve a usar Siigo, esto se corrige antes.**
