# Asiento por pasajero en Viajes Terrestres

## Problema

El voucher de un viaje terrestre muestra mal —o no muestra— los pasajeros. Al trazar el
flujo completo aparecieron dos cosas distintas: una cadena de bugs que hacen que los
pasajeros no lleguen a la base de datos, y un defecto de modelado que ninguno de esos
parches arregla.

**El dato del asiento tiene dos fuentes de verdad que se contradicen.**
`ProdViajesTerrestres` guarda `numero_asiento` y `numero_asiento_regreso` a nivel
producto. `PasajerosDetalle` guarda `asiento` a nivel pasajero. El voucher pinta las dos.

Evidencia en la BD local (`samtur-development`, 3 viajes terrestres, 5 pasajeros):

| venta | asiento producto | asiento pasajero | pasajero |
|---|---|---|---|
| 124 | `12A` | `12A` | Maria (titular) |
| 125 | `asd2` | `asd2` | Daniela (titular) |
| 125 | `asd2` | `asd2` | Maria — **heredado, no es suyo** |
| 126 | `asd`  | `asd`  | Maria (titular) — **heredado** |
| 126 | `asd`  | `AS1`  | James — suyo |

Ningún pasajero tiene asiento de regreso: ese dato solo existe a nivel producto, así que
**un viaje ida y vuelta con varios pasajeros no puede expresar quién va en qué asiento al
regreso.** El formulario ya captura asiento por pasajero, lo cual contradice al modelo.

### Lo que resultó ser el síntoma reportado

El voucher mostraba la tabla de pasajeros con el nombre en blanco y `—` en las columnas
de documento. **No era un bug del código**: el frontend corría en `vite` dev con el working
tree actual, mientras el backend corría en un contenedor construido antes del commit
`33e7d9f`. El backend viejo enviaba `nombreCompleto` / `tipoDocumento` / `nroDocumento` y
el frontend nuevo leía `name` / `docType` / `docNumber`. Las únicas dos claves con el mismo
nombre en ambas versiones —`esTitular` y `asiento`— eran justamente las dos que sí se veían.

Se resolvió con `docker compose up -d --build backend`. Un `up -d` sin `--build` no basta:
con `restart: always` reutiliza la imagen anterior.

### Bugs reales en la cadena de escritura

1. **Todos los pasajeros heredaban el asiento del producto.**
   `sales.controller.js` create y update: `asiento: p.asiento || item.seatNumber || ...`.
   Confirmado en los datos: en la venta 125 los dos pasajeros quedaron con `asd2`, y en la
   126 Maria quedó con `asd` (el del producto) mientras James conservó el suyo.

2. **`passengers: []` cortocircuitaba el fallback.** `hasPassengerInfo = item.passengers || ...`
   trata un array vacío como presencia (todo array es truthy): entraba a la rama, iteraba
   cero veces y no creaba ningún `PasajerosDetalle`. Además `'viajes_terrestres'` no estaba
   en la lista de categorías de respaldo, aunque sí lo estaba en `products.controller.js`.

3. **`update` ignoraba los viajes terrestres por completo.** `landTravelData` (y
   `baggageData`) no estaban en el array `productFields` de `exports.update`. El endpoint
   descartaba el producto en silencio y respondía `success`. Nunca se pudo editar un viaje
   terrestre. **Encontrado al probar, no en la lectura del código.**

4. **`personaId is not defined` en `update`.** Agregar durante una edición cualquier
   producto con pasajeros reventaba con un 500. Afectaba a los 19 productos, no solo a
   viajes terrestres. Solo no se notaba porque los ítems que ya existen se saltan antes de
   llegar a esa línea.

5. **`update` perdía datos que `create` sí guardaba**: `nroReserva` y `nroTiquete`, y el
   `subtotal` no sumaba `taCre`.

6. **El correo del voucher imprimía la clave cruda.** `serviciosMap` no tenía
   `viajes_terrestres` ni `equipaje`.

### Bugs latentes del formulario (no se disparaban en el flujo normal)

`LandTravelForm.tsx` construía la fila de pasajero por defecto como variable local del
render, sin propagarla con `onChange`, y tenía un error de precedencia
(`client?.name || client ? plantilla : ''`, donde `||` liga más que `?:`). Ninguno de los
dos llegaba a manifestarse porque `form.clientId` guarda el nombre del cliente, el wizard
obliga a elegirlo en el paso 1 y `INITIAL_LAND_TRAVEL(client)` sembraba el titular
correctamente. Se corrigieron igual, junto al `name` de los radios de titular, que usaba
`Math.random()` en cada render y desagrupaba los botones.

## Objetivo

Al terminar:

- Un viaje terrestre ida y vuelta con N pasajeros guarda y muestra **el asiento de ida y el
  de regreso de cada pasajero**, distintos entre sí.
- El voucher lista siempre a los pasajeros del viaje terrestre, con el titular primero,
  sin que el asesor tenga que tocar la sección de pasajeros para que se guarden.
- Ningún pasajero muestra un asiento que no es suyo.
- Existe una sola fuente de verdad para el asiento: el pasajero.

Verificable: crear una venta con un viaje terrestre ida y vuelta y 3 pasajeros con asientos
`1A/1B/1C` (ida) y `9A/9B/9C` (regreso); el voucher debe mostrar las 6 asignaciones
correctas, y `pasajeros_detalle` debe tener 3 filas con `asiento` y `asiento_regreso`
distintos.

## Fuera de alcance

- **No** se refactoriza la duplicación entre `sales.controller.js` y
  `products.controller.js`. Es la causa raíz de que estos bugs existan por duplicado, pero
  unificarla toca los 19 productos. Aquí solo se corrigen ambos lados en paralelo.
- **No** se toca el asiento de los otros 18 productos (tiquetería usa `TramosVuelo.asiento`,
  que es otro modelo y funciona).
- **No** se introducen tests automatizados. El repo no tiene ninguno; montar el arnés es un
  trabajo aparte. La verificación de este cambio es manual.
- **No** se arregla `findOrCreatePersona` (duplica `Personas` cuando hay nombre sin
  documento, y devuelve el `personaId` del cliente ante filas vacías). Es un problema
  transversal a todos los productos; se documenta como riesgo, no se ataca aquí.
- **No** se añaden archivos de migración de Prisma. El proyecto no los usa.

## Diseño

### Modelo

`PasajerosDetalle` gana una columna:

```
asientoRegreso  String?  @map("asiento_regreso")
```

`ProdViajesTerrestres` pierde dos: `numeroAsiento` y `numeroAsientoRegreso`. El resto del
modelo (empresa, origen, destino, fechas, horas, localizador, `esIdaYVuelta`) no cambia:
son atributos del viaje, no del pasajero.

`asientoRegreso` queda nullable y sin uso para los otros productos. Es el precio de que
`PasajerosDetalle` sea la tabla compartida por las 19 categorías.

### Flujo de datos

```
LandTravelForm
  passengers[]: { name, docType, docNumber, esTitular, asiento, asientoRegreso }
        │  (sin seatNumber/returnSeatNumber a nivel producto)
        ▼
POST/PUT /sales   { landTravelData: [ { ...viaje, passengers[] } ] }
        │
        ▼
sales.controller  →  PasajerosDetalle { asiento, asiento_regreso }
        │              (sin herencia desde el producto)
        ▼
GET /sales/:id    →  mapPassengers  →  PRODUCT_TRANSFORMS.viajes_terrestres
        │              titular primero
        ▼
VoucherPDF        →  tabla de pasajeros; columna ASIENTO REGRESO solo si isRoundTrip
```

### Contrato del formulario

El formulario deja de fabricar filas en el render. La normalización (garantizar al menos un
pasajero, garantizar que exactamente uno sea titular) se hace en un efecto que **sí
commitea** vía `onChange`, de modo que el estado y lo que se ve coincidan siempre.

Los dos `FormField` de asiento a nivel producto (`LandTravelForm.tsx:83-89` y `:131-137`)
desaparecen. La tabla de pasajeros gana una columna "Asiento Regreso" que solo se renderiza
cuando `travel.isRoundTrip` es verdadero.

### Guardas del backend

En los tres puntos de escritura (`sales.controller.create`, `sales.controller.update`,
`products.controller.productHandler.create`) la detección de pasajeros pasa a tratar un
array vacío como **ausencia**, no como presencia, y `viajes_terrestres` se añade a la lista
de categorías que siempre generan al menos un pasajero (donde falta).

El asiento se toma **solo** del pasajero. Se elimina el encadenamiento
`|| item.seatNumber || item.seat`.

### Lectura

`mapPassengers` (`sales.controller.js:254`) ordena con el titular primero y expone
`asientoRegreso`. El `docType` deja de caer a `String(tipoDocumentoId)` — si la relación no
resuelve, devuelve cadena vacía y el voucher pinta `—` en vez de un número suelto.

## Decisiones y alternativas

| Decisión | Elegimos | Descartamos | Por qué |
|---|---|---|---|
| Dónde vive el asiento | En `PasajerosDetalle` | En `ProdViajesTerrestres` | El caso real (varios pasajeros, asientos distintos, ida y vuelta) no se puede expresar a nivel producto. El formulario ya lo capturaba por pasajero. |
| Columnas del producto | Eliminarlas | Dejarlas deprecadas | Dejarlas mantiene las dos fuentes de verdad vivas y el próximo que lea el código las volverá a llenar. Solo hay 3 filas que migrar. |
| Asiento de regreso | Columna nueva `asiento_regreso` | Reusar `nota` o serializar JSON en `asiento` | Una columna nullable es más barata que parsear texto, y `PasajerosDetalle` ya tiene campos específicos por producto (`nroReserva`, `nroTiquete`). |
| Normalización de pasajeros | Efecto que commitea al estado | Seguir fabricando filas en el render | La causa exacta del bug: lo que se ve no es lo que se envía. |
| Herencia del asiento del producto | Eliminarla | Aplicarla solo al titular | Si el asiento vive en el pasajero, no hay nada de dónde heredar. |
| Duplicación de controladores | Corregir ambos lados por separado | Unificar en un helper compartido | Unificar toca los 19 productos sin tests que respalden. Se deja anotado como deuda. |
| Migración | Script de backfill + `db push` | Introducir `prisma migrate` | El proyecto no usa migraciones; cambiar eso es una decisión de infraestructura aparte. |

## Riesgos y desconocidos

**`db push --accept-data-loss` corre en el deploy.** `backend/render.yaml` define
`buildCommand: npm install && npm run build`, y `build` es
`npx prisma generate && npx prisma db push --accept-data-loss`. En cuanto se despliegue el
schema nuevo, las dos columnas se eliminan **sin aviso**. Si el backfill no corrió antes,
el dato se pierde. Mitigación: correr el script contra producción y verificar el conteo
*antes* de mergear.

**Cuántas filas hay en producción.** En local son 3. La funcionalidad se commiteó el
2026-08-24 (`33e7d9f`), así que producción debería tener pocas o ninguna — pero hay que
confirmarlo, no asumirlo. El script debe reportar cuántas filas tocó.

**No hay tests.** Todo se verifica a mano. El riesgo real es romper otro producto al tocar
el bloque de pasajeros compartido en `sales.controller.js:1495` y `:1946`: ese código lo
usan las 19 categorías. Detección temprana: después del cambio, crear una venta con
tiquetería multi-pasajero y otra con hotelería, y verificar que sus pasajeros siguen
guardándose.

**`findOrCreatePersona` sigue duplicando personas.** Fuera de alcance, pero significa que
añadir un pasajero con nombre y sin documento crea una `Persona` nueva en cada guardado.
Con el fix de este diseño se van a guardar *más* pasajeros que antes, así que el problema
se va a notar más. Vale la pena vigilar el crecimiento de la tabla `personas`.

**Bug latente en el mismo archivo.** `LandTravelForm.tsx` agrupa los radios de titular con
`name={\`titular-land-${travel.ticketLocator || Math.random()}\`}`. `Math.random()` se
evalúa en cada render, así que cuando el localizador está vacío los radios dejan de estar
agrupados y se puede marcar más de un titular. Se corrige de paso porque está dentro de la
sección de pasajeros que ya vamos a tocar.

## Estado

Implementado y verificado el 2026-08-24. Verificaciones ejecutadas contra la BD local:

- Venta ida y vuelta con 3 pasajeros y 6 asientos distintos: se guardan y se leen correctos.
- Titular fuera de posición en el payload: sale primero en la respuesta.
- `passengers: []`: cae al titular de la venta en vez de quedar sin pasajeros.
- Edición: no duplica el producto reenviado con su `id`, agrega el nuevo con sus pasajeros
  y persiste `nroReserva`.
- Regresión: tiquetería multi-pasajero y hotelería con `guests` siguen funcionando.
- Backfill: 4 asientos de regreso migrados del producto al pasajero, 0 asientos de ida
  sobrescritos.

Datos de prueba creados durante la verificación (ventas 127–133 y personas `9000000*`)
eliminados de la BD de desarrollo.

Pendiente: correr el backfill en producción antes de desplegar el schema.

## Plan de implementación

Cada paso es verificable por separado.

1. **Backfill (antes de tocar el schema).**
   `backend/scripts/backfill_asientos_viajes_terrestres.js`: para cada
   `prod_viajes_terrestres`, copiar `numero_asiento` a `pasajeros_detalle.asiento` donde
   esté vacío, y `numero_asiento_regreso` a `asiento_regreso`. Reportar filas afectadas.
   *Verificación:* correrlo en local, comprobar que las 5 filas quedan con asiento y que
   James conserva `AS1`.

2. **Schema.** Añadir `asientoRegreso` a `PasajerosDetalle`, eliminar `numeroAsiento` y
   `numeroAsientoRegreso` de `ProdViajesTerrestres`. `npx prisma db push`.
   *Verificación:* `\d pasajeros_detalle` y `\d prod_viajes_terrestres` en psql.

3. **Backend — escritura.** `sales.controller.js` (`:1140`, `:1495-1510`, `:1946-1975`) y
   `products.controller.js` (`:112-120`, `:589-602`): array vacío = ausencia, añadir
   `viajes_terrestres` a las listas de respaldo, eliminar la herencia del asiento, persistir
   `asientoRegreso`. De paso, en `update`: recuperar `nroReserva`/`nroTiquete` (hoy se
   pierden al editar) e incluir `taCre` en el `subtotal` de `:2080`, que hoy no lo suma.
   *Verificación:* POST de una venta con 3 pasajeros y asientos distintos; consultar
   `pasajeros_detalle` directamente.

4. **Backend — lectura.** `mapPassengers` (`:254`) ordena titular primero, expone
   `asientoRegreso`, arregla el fallback de `docType`. `PRODUCT_TRANSFORMS.viajes_terrestres`
   (`:653`) deja de emitir `seatNumber`/`returnSeatNumber`.
   *Verificación:* `GET /sales/:id` devuelve `landTravelData[0].passengers` completo y
   ordenado.

5. **Backend — correo.** `serviciosMap` (`:2359`) gana `viajes_terrestres: 'Viaje Terrestre'`
   y `equipaje: 'Equipaje'`, que hoy faltan y hacen que el email liste la clave cruda.
   *Verificación:* enviar un voucher por correo de una venta con viaje terrestre.

6. **Frontend — tipos y estado.** `types/index.tsx:595` (quitar `seatNumber` y
   `returnSeatNumber` de `LandTravelData`, añadir `asientoRegreso?` al pasajero) y
   `wizardData.ts:289` (`INITIAL_LAND_TRAVEL` siembra siempre un pasajero, como
   `INITIAL_TICKET`).
   *Verificación:* `npm run build` compila (`tsc` señala todos los usos huérfanos).

7. **Frontend — formulario.** `LandTravelForm.tsx`: eliminar los dos campos de asiento del
   bloque del viaje, normalizar los pasajeros con commit real, corregir la precedencia de
   `:168`, añadir "Asiento Regreso" por pasajero condicionado a `isRoundTrip`, y arreglar el
   `name` de los radios.
   *Verificación:* abrir el wizard sin tocar la sección de pasajeros y confirmar en el
   payload de red que `passengers` viaja con una fila.

8. **Frontend — presentación.** `VoucherPDF.tsx:586,590` (quitar los `DataCell` de asiento,
   añadir la columna condicional) y `ProductDetailsModal.tsx:495,502` (lo mismo).
   *Verificación:* el escenario del Objetivo, extremo a extremo, descargando el PDF.

9. **Regresión de los otros productos.** Crear una venta con tiquetería multi-pasajero y una
   con hotelería; confirmar que sus pasajeros siguen guardándose y mostrándose.

10. **Producción.** Contar filas de `prod_viajes_terrestres`, correr el backfill, verificar,
    y recién entonces desplegar.
