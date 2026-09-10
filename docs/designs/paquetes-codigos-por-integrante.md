# Paquetes: códigos por integrante y separar hotel de transporte

## Problema

El formulario de paquetes tenía dos defectos, reportados al usarlo.

**1. Los códigos eran del paquete, no de cada integrante.** `prod_planes` guardaba
`nro_reserva` y `nro_tiquete` a nivel producto —uno para todo el paquete— y el backend los
copiaba a todos los integrantes por igual (`p.nroReserva || item.reservationNumber` en
`sales.controller.js`). Es el mismo defecto que tenía el asiento de viajes terrestres.

Evidencia en producción (2 paquetes):

| plan | nro_reserva | nro_tiquete | integrante |
|---|---|---|---|
| TEMPORADA ALTA ADZ | `S-001-27297` | `0000000127297` | Juan David, con los mismos valores heredados |
| Plan Vacaciones de Junio (`supplier`) | null | null | Yulisa, sin códigos |

**2. La información se mostraba toda junta.** Un bloque llamado "Reservación y Transporte"
mezclaba número de reservación, número de vuelo, número de tiquete, confirmación, cuatro
fechas de vuelo y dos de hotel. En el detalle era peor: una sola rejilla de 16 celdas donde
"Reserva", "Nro Tiquete" y "Confirmación" caían entre campos de hotel y de vuelo sin nada que
dijera a cuál pertenecían.

### Cómo llegan los datos en la realidad

El usuario lo precisó: el hotel entrega **una** referencia por paquete (`PH_3510R-1`), y el
operador entrega **un booking por pasajero**. El campo `numero_confirmacion` no era una
confirmación: era esa referencia.

**Bug que eso destapó:** las dos validaciones exigían que la confirmación fuera exactamente 6
caracteres alfanuméricos, y el saneo del input borraba el `_`. O sea, `PH_3510R-1` era
imposible de escribir y habría sido rechazado.

### Tres bugs preexistentes en la misma superficie

1. **`getPaginatedDetails` devolvía el documento vacío.** Armaba su propio array de pasajeros
   en vez de reusar `mapPassengers`, y leía `pd.persona.nroDocumento` — el campo en `Personas`
   es `documento`. El bloque de integrantes rediseñado habría nacido sin documentos.
2. **`flights.controller` leía el código de reserva del paquete**, no del pasajero
   (`p.nroReserva`, donde `p` es el registro de `prodPlanes`). Al quitar la columna, el tablero
   de check-in habría quedado sin código.
3. **`createPlan` en `products.controller`** escribía las tres columnas eliminadas: habría
   respondido 500 con `Unknown arg` a cualquier cliente de esa ruta.

Y uno que el cambio **activaba**: `SaleDetailModal` resolvía el documento como
`pax.docNumber || pax.nroDocumento || pax.nroTiquete`. Inofensivo mientras los integrantes no
traían tiquete; en cuanto lo trajeran, un integrante sin documento habría mostrado su número
de tiquete como si fuera la cédula.

## Decisiones

- Los códigos pasan a `pasajeros_detalle`, que ya tenía las columnas, y **se eliminan** de
  `prod_planes`. Una sola fuente de verdad.
- `numero_confirmacion` se renombra a `referencia_hotel`. El nombre viejo mentía sobre el dato
  y arrastraba la validación equivocada.
- Todos los códigos son **opcionales**: llegan días después de vender.
- Etiquetas: **"Booking"** por integrante, **"Ref. Hotel"** por paquete. Son las palabras que
  usa el negocio.

## Diseño

### Modelo

`ProdPlanes` pierde `nroReserva` y `nroTiquete`, y `numeroConfirmacion` pasa a
`referenciaHotel @map("referencia_hotel")`. `PasajerosDetalle` no cambia: ya tenía
`esTitular`, `nroReserva` y `nroTiquete`.

No hizo falta backfill. Se verificó antes de tocar el schema que los códigos del paquete ya
estuvieran en el integrante (estaban, por la herencia) y que `numero_confirmacion` estuviera
nulo en las dos filas.

### Contrato

Nivel paquete: `confirmationNumber` → `hotelReference`; `reservationNumber` y `ticketNumber`
desaparecen. Por integrante:

```
guests: [{ name, docType, docNumber, esTitular, nroReserva, nroTiquete }]
```

`nroReserva` es el booking del hotel de esa persona; `nroTiquete`, su tiquete aéreo. Se
mantienen esos nombres en vez de inventar `bookingCode` porque es exactamente la forma que ya
devuelve el transform de tiquetería y que ya aceptan las dos rutas de escritura. La coherencia
de vocabulario se resuelve en las etiquetas, no en las claves.

**La escritura no necesitó cambios**: `getPassengerList` ya aceptaba `data.guests`, y create y
update ya persistían los tres campos por pasajero. Solo faltaba que el formulario los enviara.

### Formulario

El bloque combinado se partió en dos, y el nombre del hotel se movió al bloque que le
corresponde:

```
PAQUETE       Nombre del Plan · Tipo de Transporte · Adultos · Menores
HOTEL         Nombre · Ref. Hotel · Ingreso · Salida          (ámbar, Building2)
TRANSPORTE    N° Vuelo/Placa · Ida (Salida, Llegada) · Regreso (Salida, Llegada)
                                                                (azul, Plane/Bus)
INTEGRANTES   una tarjeta por persona, con Booking y N° Tiquete
FINANCIERO    sin cambios
```

El ámbar no es decorativo: es el color que el sistema ya asigna a hotelería en
`SaleEditModal` `SERVICE_CONFIG`. Cada bloque cierra con una nota que dice dónde se registra
el código de cada persona, para que el asesor no lo busque en el lugar equivocado.

La rama `supplier` sigue ocultando Hotel y Transporte, pero **muestra los integrantes con sus
códigos**: el operador entrega un código por persona y antes no había dónde ponerlo.

### Integrantes

Cada fila pasó de 3 controles sin etiqueta a una tarjeta con el patrón de tiquetería: badge
"Titular", radio agrupado con `useId()`, y dos rejillas — datos de identidad y códigos.

El botón de borrar no se renderiza sobre el titular, así el invariante "al menos un
integrante" se sostiene sin depender de `guests.length > 1`, que permitía borrarlo.

**Sobre compartir componente**: se extrajo la *lógica* a
`frontend/src/components/sales/forms/passengerHelpers.ts` (`setTitular`, `hayTitular`,
`idxTitular`, `sanearCodigo`) y se duplicó el *markup*. El bloque de pasajeros ya estaba
duplicado dos veces y las copias divergieron: `TicketForm` agrupa los radios con
`name={\`titular-${idx}\`}`, un grupo por fila, así que permite marcar varios titulares a la
vez; `LandTravelForm` ya lo corrigió con `useId()`. Se comparte donde vivían los bugs y se
duplica lo que de verdad difiere entre productos. Un componente que absorba las tres variantes
necesitaría render-props y quedaría con un solo consumidor hasta que alguien migre las otras
dos.

### Detalle

De una rejilla de 16 celdas a la anatomía que ya usa tiquetería: cabecera con identidad y
dinero, bloque Hotel en ámbar, bloque Transporte en azul con Ida y Regreso, y la lista de
integrantes.

`renderTicketPassengers` se parametrizó de forma aditiva (`{ title, reservaLabel }`) para que
paquetes diga "Integrantes" y "Booking:" sin alterar tiquetería ni viajes terrestres, que
siguen con sus valores por defecto. No hizo falta escribir nada nuevo: esa función ya mostraba
el badge de titular y los chips de reserva y tiquete.

### Voucher

La cadena unida `nombre (doc)` se reemplazó por la tabla de pasajeros que ya existía para
viajes terrestres, con las columnas NOMBRE · TIPO DOC. · N° DOCUMENTO · BOOKING · N° TIQUETE.
El booking es justamente lo que el cliente necesita para presentarse en el hotel.

## Fuera de alcance

- **No se puede editar un paquete existente.** `PUT /sales/:id` salta los productos que ya
  tienen `id`, así que los códigos solo se capturan al crear la venta. Limitación previa que
  ahora se nota más.
- **`PUT /sales/:saleId/products/plan/:id`** manda el body crudo a Prisma, sin transform. Está
  muerto desde la interfaz.
- **`esTitular: p.esTitular ?? true`** en los cuatro puntos de escritura: si el cliente no
  manda el flag, todos quedan titulares. Para paquetes ya no aplica —el formulario lo manda
  siempre—, pero sigue afectando a hotelería, seguros y tours. Cambiarlo altera los 19
  productos y merece su propio paso.
- **Un paquete aéreo queda sin dónde guardar el localizador del vuelo.** El valor que había
  (`S-001-27297`) parece un localizador de operador, no un booking de hotel. Por ahora va en
  Observaciones; si hace falta, se agrega `nroReservaVuelo` a `PasajerosDetalle`.

## Verificación

Alta de venta con un paquete de dos integrantes con códigos distintos:

```
nombres        booking     tiquete         es_titular
Juan David     BK-AAA111   0000000127297   t
Maria Isabel   BK-BBB222   0000000127298   f
ref_hotel guardada: PH_3510R-1
```

Cada integrante conservó **su** código, que es el defecto que se venía a corregir. Y
`PH_3510R-1` entró íntegro, con el guion bajo que el saneo viejo borraba.

La lectura devuelve `hotelReference` y los tres campos por integrante, y ya no devuelve
`reservationNumber` ni `ticketNumber` a nivel paquete.
