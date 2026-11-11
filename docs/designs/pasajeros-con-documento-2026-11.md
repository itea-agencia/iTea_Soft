# Toda persona que entra a una venta o a un módulo tiene nombre y documento válidos

**Fecha:** 2026-11-11 · **Rama:** `feat/hallazgo-16-carga-y-mantenimiento` · **Estado:** diseño aprobado (2026-11-11)

## Por qué

`findOrCreatePersona` (`backend/src/controllers/sales.controller.js`) busca al pasajero por documento y, si no llega documento, crea una persona nueva. Cada venta con un pasajero sin documento deja otra fila en `personas` que nadie puede reconocer después. Así se duplicó al cliente en vehículos y equipaje (corregido en `387b327`).

En la agencia no se cargan pasajeros sin nombre ni documento, y se puede exigir siempre, sin excepciones para bebés ni extranjeros (usuario, 2026-11-11). El objetivo es prevenir: que el sistema no deje pasar uno por error, ni desde la pantalla ni por la API.

Revisando las validaciones salió además que el servidor confía en la pantalla también en los módulos de personas. Clientes, usuarios, responsables y comisionistas validan formato en el navegador, pero su backend solo revisa el largo del documento (`isDocNumberOutOfRange`). El usuario decidió cerrar eso en el mismo trabajo.

## Datos de producción (2026-11-11, solo lectura)

- **Pasajeros:** 101 personas distintas. Todas cumplen la regla de clientes (documento de 6 a 15 caracteres con el formato de su tipo, y nombre con solo letras), salvo la persona sin documento de la venta de equipaje. Tipos usados: CC 88, T.I 6, REG 4, PPT 2 y 1 sin tipo, que es esa misma persona.
- **Módulos de personas:** clientes 128, usuarios 5, responsables 11 y comisionistas 2. Ninguna persona falla la regla en documento, formato, tipo, nombre ni apellido.

La regla nueva no deja a ningún registro real sin poder editarse.

## Objetivos

1. El servidor rechaza una venta si algún pasajero no tiene nombre, documento y tipo válidos, o si una fila de pasajero llega vacía.
2. El asistente exige lo mismo en cada formulario con pasajeros, antes de dejar avanzar.
3. El servidor de clientes, usuarios, responsables y comisionistas valida lo mismo que su pantalla: tipo, documento con formato y nombre.
4. En servicio de mascotas el dueño es el cliente de la venta y se muestra en solo lectura.
5. Todos los formularios con pasajero eligen el tipo de documento del catálogo de la base.

## No objetivos

- No se limpia la persona sin documento que ya existe en producción: queda como deuda técnica (usuario).
- No cambia qué datos son de cada pasajero (asiento, booking, tiquete): eso es la spec `datos-por-pasajero`.
- No cambia el caso de migración con pasaporte (anotado en esa spec).
- No se migran ni corrigen datos guardados: producción ya cumple.

## Anti-objetivos

- Que una venta o un registro legítimo de hoy quede bloqueado.
- Que el servidor arregle el dato por su cuenta: no asigna el cliente a una fila vacía, no inventa un documento y no recorta. Rechaza con un mensaje que dice qué falló.

## La regla, una sola

Es la de la pantalla de clientes (`frontend/src/utils/docNumber.ts`, `validateDocNumber`), decidida por el usuario:

- **Tipo de documento:** obligatorio, y tiene que existir en `tipos_documento` (por `abreviatura`).
- **Documento:** obligatorio, de 6 a 15 caracteres tras `trim`. CC solo números; NIT/RUT con números y un guion opcional antes del dígito de verificación; pasaporte solo letras y números. Los demás tipos (CE, PPT, REG, T.I, NUI) solo el largo.
- **Nombre:** donde hay nombre y apellido separados (clientes, usuarios, responsables), cada uno obligatorio, solo letras (con tildes y ñ) y espacios, máximo 40. Donde hay un solo nombre completo (pasajeros, comisionistas), obligatorio, mismas letras, máximo 80, y **con al menos dos palabras** (nombre y apellido; usuario). Con una sola palabra, `findOrCreatePersona` guardaba el apellido como "Temporal"; ningún pasajero de producción está así.

Va en dos lugares que se mantienen iguales:

- **Backend:** una función en `backend/src/utils/persons.js` (junto a `isDocNumberOutOfRange`, que pasa a usarla o se reemplaza) que devuelve el primer error o `null`. Validar que el tipo exista necesita la base, así que esa parte la hace quien llama.
- **Frontend:** `validateDocNumber` ya existe; se agrega lo del nombre al lado, en una función pura con prueba en `frontend/tests/`.

El mismo par de comentarios que ya tiene `docNumber.ts` ("el backend aplica el mismo rango") se actualiza para que cada lado nombre al otro.

## Ventas

Un **pasajero explícito** es cada elemento de la lista que devuelve `getPassengerList(item)` (`passengers`, `passengerInfo`, `guests` o `members`). Cada uno tiene que cumplir la regla con su `name`/`fullName`, `docType` y `docNumber`. Una fila sin nombre ni documento se rechaza con el mismo mensaje.

Un **pasajero implícito** es el que hoy arma `create` sin lista, con el nombre y el documento del ítem (check-in, migración, SIM y las demás de `CATEGORIAS_CON_PASAJERO_IMPLICITO`). Cumple la misma regla (usuario). Si el ítem no trae ni nombre ni documento, sigue siendo el cliente, como hoy: no es una fila vacía del formulario, es el titular implícito.

Las categorías de `CATEGORIAS_PASAJERO_ES_CLIENTE` no se validan, porque su pasajero es el cliente. Hoy son vehículos y equipaje, y se agrega **servicio de mascotas**.

La validación va en `create`, antes de la transacción, y recorre `PRODUCT_HANDLERS` con la misma lógica que arma los pasajeros, para que las dos no se separen. Los tipos se consultan una vez por venta. Responde `400 VALIDATION_ERROR`, por ejemplo con "Hotelería #1, pasajero 2: la cédula solo debe contener números".

`create` es el único camino que escribe pasajeros (verificado: no hay edición de productos).

## El asistente

`wizardValidation.ts` aplica la regla a cada pasajero de:

| Categoría | Dónde | Hoy |
|---|---|---|
| Tiquetería | `passengers` | solo valida el tiquete del titular; **sin selector de tipo** |
| Hotelería | `guests` | no valida documento |
| Seguros | `members` | no valida documento |
| Planes | `guests` | integrantes opcionales, documento de 5 a 20 |
| Tours | `guests` | no valida documento |
| Viajes terrestres | `passengers` | no valida documento |
| Check-in | ítem | exige documento; lista fija de tipos (`TI`, `PP`) |
| Migración | ítem | documento de 5 a 20; lista fija de tipos |
| Visa | ítem | documento de 5 a 20; lista fija de tipos |
| SIM card | ítem | no exige documento |

Visa no crea pasajero en el servidor (no está en las listas de pasajero), pero su formulario pasa a la misma regla para que el rango no cambie según dónde se cargue a alguien.

**Tipos de documento:** check-in, migración y visa dejan su lista fija y usan `data.config.documentTypes`, como hotel o planes. Tiquetería agrega un selector de tipo por pasajero. Hoy esas listas mandan `TI` y `PP`, que no están en el catálogo (`T.I`, `Pasaporte`), y el servidor guarda a la persona sin tipo.

**Mascotas:** "Nombre del dueño" pasa a solo lectura con el nombre y el documento del cliente elegido en el paso 1. Se deriva del cliente actual, así que si el cliente cambia se actualiza solo. `ownerName` deja de mandarse.

## Módulos de personas

`create` y `update` de clientes, responsables, usuarios y comisionistas validan la regla en el servidor, además del largo que ya validaban, y responden `400` con el mismo `code` que hoy (`INVALID_DOC_NUMBER`) o uno nuevo para el nombre. En el `update`, se valida lo que llega; un campo que no llega no se exige.

Inconsistencia que se cierra: la pantalla de comisionistas solo exige que el nombre no esté vacío. Pasa a la regla del nombre completo.

## Verificación

- **Pruebas puras** en `frontend/tests/` de la regla de nombre y documento y de la validación de pasajeros. Tienen que fallar antes de implementarse.
- **Por la API local** (con permiso):
  - pasajero sin documento, fila vacía, CC con letras, tipo inexistente y nombre con números dan 400 y no crean filas en `personas`;
  - una venta completa de las categorías con pasajeros sigue dando 201;
  - una venta de mascotas no crea persona;
  - en cada módulo, alta y edición con un dato inválido dan 400, y con uno válido 200/201.
- **En producción**, solo lectura: después del despliegue, los conteos de este documento siguen en cero.

## Despliegue

El frontend se publica junto con el backend o enseguida después. Con el frontend viejo, hay ventas que hoy pasan en silencio y van a dar error al guardar:
- una fila de pasajero vacía;
- un tipo `TI` o `PP`;
- un tiquete con un pasajero sin tipo.

No rompe ventas bien cargadas, pero el asesor lo vería como un error del servidor.

## Decisiones del agente (revisables)

- Máximo 80 para el nombre completo: 40 + 40, como clientes.
- Visa pasa a la regla aunque no crea pasajero.
- En el `update` de los módulos se valida solo lo que llega.
- La spec `datos-por-pasajero` se actualiza primero.

## Lo que queda a criterio de quien lo construya

- El texto exacto de los mensajes, siempre con categoría, número de pasajero y motivo.
- Si la validación de ventas se escribe aparte o dentro del bucle, mientras corra antes de la transacción.
- El `code` del error de nombre en los módulos.

## Lo que queda abierto

- La persona sin documento de la venta de equipaje en producción (deuda técnica).
