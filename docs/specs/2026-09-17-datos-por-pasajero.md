# Lo que es de una persona vive en la persona

**Fecha:** 2026-09-17 · **Módulo:** ventas, todos los productos con pasajeros

## El invariante

El asiento, el booking y el número de tiquete son **de cada pasajero**, no del producto.
Un producto con varios pasajeros no puede guardar un solo valor y repartirlo: dos personas
no viajan en el mismo asiento.

Corolario: **un pasajero sin dato queda sin dato.** Nunca se hereda el del producto para
rellenar el hueco.

## Qué pasó sin él

El mismo defecto apareció en las cuatro categorías que llevan pasajeros, una por una.

**Viajes terrestres.** `prod_viajes_terrestres` guardaba `numero_asiento` y
`numero_asiento_regreso` a nivel producto. Se movieron a `pasajeros_detalle` y se borraron
las columnas, con un backfill previo (`backend/db-manual/backfill_asientos_viajes_terrestres.js`).

**Paquetes.** `prod_planes` guardaba `nro_reserva` y `nro_tiquete` únicos, y el backend los
copiaba a todos los integrantes. Se eliminaron; el booking y el tiquete viven en el
pasajero, y `numero_confirmacion` pasó a `referencia_hotel`, que es lo que de verdad es: la
referencia que entrega el hotel, una por paquete.

**Hotelería.** La lectura descartaba `esTitular` y `nroReserva` de cada huésped aunque
`mapPassengers` ya los proveía, y el formulario no los capturaba.

**Tiquetería.** El caso más enredado, y el único donde los datos de producción lo probaron:

| Venta | Tramos | Asiento del tramo | Asiento de los pasajeros | Pax |
|---|---|---|---|---|
| 7 | ida / regreso | `4B` / `6E` | `4B` | 1 |
| 16 | ida / regreso | `8A` / `2D` | `8A` | 1 |
| 19 | ida | `11A` | `11A`, `11A` | **2** |
| 142 | ida / regreso | `12B` / `7A` | `12B`, `"12A - 7B"` | 2 |

Tres síntomas del mismo problema: en 7 y 16 el asiento de **regreso** existía solo en el
tramo y el pasajero no lo tenía; en 19 dos pasajeros figuraban en el **mismo asiento
11A**, que es imposible; y en 142 alguien escribió **dos asientos en un campo**
(`"12A - 7B"`) porque no había dónde poner el segundo.

La causa raíz en tiquetería era doble: el asiento y el código de reserva se ocultaban al
titular (`!pax.esTitular &&`), así que los suyos salían del nivel producto e iguales para
todos; y `seatNumber` se derivaba del **primer** pasajero y volvía a la escritura como
valor heredado.

## Dónde vive la regla

- `PasajerosDetalle` (`backend/prisma/schema.prisma`): `asiento`, `asientoRegreso`,
  `nroReserva`, `nroTiquete`, `esTitular`. Es el único lugar donde vive esto.
- `reservaDePasajero()` y `asientoDePasajero()` en `backend/src/controllers/sales.controller.js`:
  deciden si se hereda del producto. **No heredan** en `hoteleria`, `planes`,
  `tiqueteria` ni `viajes_terrestres`; en las demás se conserva el comportamiento
  histórico, porque son productos de un solo pasajero donde el dato sí es del producto.
- `frontend/src/components/sales/forms/passengerHelpers.ts`: `setTitular`, `hayTitular`,
  `idxTitular`, `sanearCodigo`. Se comparte la lógica —donde vivían los bugs— y se deja
  duplicado el markup, que es genuinamente distinto entre productos.

### Quién es el pasajero en vehículos y equipaje

En `renta_vehiculos`, `equipaje` y `servicio_mascotas` el pasajero es siempre el cliente titular de la venta (`CATEGORIAS_PASAJERO_ES_CLIENTE`). El nombre que se escribe en el formulario no crea ni busca una persona: el conductor y su licencia quedan en `prod_autos` (`conductor_nombre`, `licencia_nro`) y el pasajero del equipaje en `prod_equipajes.pasajero_nombre`.

Antes `findOrCreatePersona` buscaba por documento y, sin documento, creaba una persona nueva. En vehículos el documento era el número de licencia, que el formulario deja vacío por defecto; en equipaje nunca hay documento. Cada venta dejaba un duplicado del cliente en `personas` (la venta local 154 creó dos; producción tiene uno, de una venta de equipaje). Decisión del usuario, 2026-11-11.

### Todo pasajero tiene nombre y documento

Ningún pasajero entra a una venta sin nombre completo (al menos dos palabras), tipo del catálogo `tipos_documento` y documento con el formato de clientes (6 a 15 caracteres; CC solo números; NIT con guion opcional; pasaporte alfanumérico). Una fila de pasajero vacía se rechaza: no se convierte en el cliente. Lo validan el servidor (`passengerError` en `create`, con las reglas de `backend/src/utils/persons.js`) y el asistente (`passengerError` en `wizardValidation.ts`, con `frontend/src/utils/docNumber.ts`), con la misma regla.

Excepciones: el titular implícito de check-in, migración, SIM y las demás de `CATEGORIAS_CON_PASAJERO_IMPLICITO`, cuando el ítem no trae ni nombre ni documento, sigue siendo el cliente; y en `CATEGORIAS_PASAJERO_ES_CLIENTE` (vehículos, equipaje y servicio de mascotas) el pasajero es siempre el cliente.

Antes, un pasajero sin documento creaba una persona nueva en cada venta, imposible de reconocer después. En producción había uno, de una venta de equipaje (sigue ahí: deuda técnica). Decisión del usuario, 2026-11-11; diseño `docs/designs/pasajeros-con-documento-2026-11.md`.

### Un solo titular

`name={titularGroup}` con `useId()` en los cuatro formularios. TicketForm usaba
`` name={`titular-${idx}`} ``, un grupo de radios por fila, así que se podían marcar
**varios titulares a la vez**. Fue el último en corregirse.

### Nada de mutar el estado en el render

`rawPax[0].esTitular = true` y `next[idx].asiento = valor` tras una copia superficial
escribían sobre el estado. Se deriva con `idxTitular` y se escribe con `updatePax`.

## Cómo verificarlo

Dos pasajeros del mismo producto no pueden compartir asiento en el mismo tramo:

```sql
SELECT dv.venta_id, pd.asiento, count(*)
FROM pasajeros_detalle pd
JOIN detalle_venta dv ON dv.id = pd.detalle_venta_id
WHERE pd.asiento IS NOT NULL AND pd.asiento <> ''
GROUP BY dv.venta_id, pd.asiento HAVING count(*) > 1;
```

Y ningún asiento debería traer dos valores pegados:

```sql
SELECT id, asiento FROM pasajeros_detalle WHERE asiento LIKE '%-%' OR asiento LIKE '% %';
```

## Lo que queda abierto

- **La venta 19** sigue con dos pasajeros en el asiento `11A`. El backfill la lista y no la
  toca: el dato es ambiguo y necesita que una persona decida de quién es.
- **Las escalas** conservan `tramos_vuelo.asiento`, un valor por tramo compartido. Es el
  único caso sin columna propia por pasajero, y de 117 tiquetes en producción solo 5 tienen
  más de dos tramos, 4 de ellos de un pasajero. Cerrarlo bien pide una tabla
  `pasajero × tramo`.
- **`esTitular: p.esTitular ?? true`** en los caminos de escritura sigue marcando titular a
  todos cuando el producto no envía el dato. Afecta a las categorías que aún no capturan
  titular.
- **Migración con pasaporte**: si el asesor cambia el documento del cliente por su pasaporte, se crea otra persona con el pasaporte como documento. Una persona tiene un solo `documento`.
- **La persona sin documento que dejó la venta de equipaje en producción** no se limpió: el código ya no crea más, y limpiarla queda para decidir.
