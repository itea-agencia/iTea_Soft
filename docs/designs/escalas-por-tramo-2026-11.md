# Escalas de ida y de regreso en cada tramo

> Plan escrito el 2026-11-05. Sale de dos arreglos previos: `1a03057` (cada tramo muestra su
> aerolínea) y `5355e58` (un solo ida no tiene regreso). Las decisiones **D1…D4** las toma el
> usuario antes de la fase que las necesita; cada una trae una recomendación, no una decisión.

## El problema

El asesor le dice al sistema qué es cada tramo: el formulario tiene una sección por cada cosa.
El servidor lo aplana todo en una lista numerada (`orden`) y esa información se pierde. Después,
itinerarios la adivina:

| El asesor lo cargó en | Se guarda | Itinerarios muestra |
|---|---|---|
| Trayecto de ida (`legs`) | `orden` | Ida |
| Escala de ida (`outboundStops`) | `orden` | Ida, sin marca de escala |
| Regreso (`returnLeg`) | `orden` | Regreso |
| Escala de vuelta (`returnStops`) | `orden` | Regreso, sin marca de escala |

Y la adivinanza falla en dos casos de ida y vuelta, aunque hoy ninguna venta cae en ellos:

- Una escala de ida que sale otro día queda como regreso: la regla es "lo que no sale el primer
  día es regreso".
- Un ida y vuelta con escalas en un solo día: todo lo que no sea el tramo 1 queda como regreso.

## La solución

**Guardar en cada tramo lo que el asesor ya dijo**, en lugar de deducirlo después. Se descartó
deducir las escalas por el tiempo entre tramos: el usuario no quedó convencido, y con ese método
una escala larga y una estadía corta se confunden.

Una columna nueva en `tramos_vuelo`:

```prisma
enum TipoTramo {
  ida
  escala_ida
  regreso
  escala_regreso
}
```

Un solo campo y no dos (`sentido` + `es_escala`): así no hay combinaciones que no significan
nada, y son exactamente las cuatro secciones del formulario.

**El servidor lo asigna según la sección del payload de la que viene el tramo.** No se recibe
como un dato aparte que el navegador pueda mandar contradictorio.

La API de vuelos conserva `type: 'ida' | 'regreso'` y agrega `esEscala: boolean`. Así las
pestañas, los contadores y los modales que hoy leen `type` siguen funcionando sin cambios.

## Qué no entra

- **Editar tramos de una venta ya creada.** Hoy no existe; `create` es el único que los escribe.
- **Paquetes (`prod_planes`).** Tienen una ida y un regreso con campos propios, no tramos.
- **Cambiar el check-in.** Cada tramo sigue teniendo el suyo (ver D3).
- **Corregir fechas mal digitadas.** Hay tramos con la llegada antes de la salida (ventas 18 y
  190). Es otro problema: el formulario no lo valida. Queda en "Lo que queda abierto".

## Las ventas ya registradas

Foto de producción del 2026-11-05: 215 tramos.

| Modo | Tramos por producto | Productos | Tramos |
|---|---|---|---|
| Solo ida | 1 | 125 | 125 |
| Solo ida | 2 o 3 | 15 | 31 |
| Ida y vuelta | 2 | 20 | 40 |
| Ida y vuelta | 3 o 4 | 5 | 19 |

Los productos de un solo tramo y los ida y vuelta de dos no tienen duda. En los otros 20 productos
(18 ventas activas y 2 anuladas o eliminadas) **no se sabe cuáles tramos fueron escalas**: la
información se perdió al guardar. Las 18 activas ya volaron, la última el 2026-10-27, así que no
afectan la operación.

Fuera de `flights.controller.js`, ningún código supone que el tramo 2 es el regreso: el resto solo
usa `orden` para ordenar.

Recomendación en **D1**: conservar su sentido y no marcarles escala, en lugar de afirmar algo que
no se puede saber (invariante 4).

## Decisiones

Tomadas por el usuario el 2026-11-05.

**D1. ¿Qué se hace con las ventas viejas de varios tramos?** → **A**, solo se les pone el sentido,
ida o regreso, con la regla de hoy. Ninguna queda marcada como escala.

**D2. ¿Dónde se muestra la marca "Escala"?** → **A**, en Itinerarios (calendario, lista y modal de
check-in) y en los modales de cliente y responsable. No toca el voucher ni el detalle de venta.

**D3. ¿Una escala necesita su propio check-in?** → **B**, la escala hereda el check-in de su tramo
principal. Se aparta de la recomendación del plan (que era no cambiar nada), porque en la práctica
una escala no tiene check-in propio: si todos los tramos van en una misma reserva, el check-in del
primer vuelo emite las tarjetas de embarque de todo el trayecto. Diseño detallado el 2026-11-05:

- **Quién es "el tramo principal".** El `ida`/`regreso` con el `orden` más próximo por debajo,
  dentro del mismo producto. En la práctica hay uno solo por sentido, así que no hay ambigüedad.
  Esto no toca los `ida` de "Añadir Tramo" (multidestino, D4): esos siguen con su check-in propio,
  como hoy — la escala es otra sección del formulario, no la misma.
- **Se deriva, no se guarda** (mismo invariante que el total de una venta). La columna
  `checkinStatus` propia de la fila de la escala **queda sin usar**: nunca se lee ni se escribe.
  El estado que se muestra sale siempre del tramo principal, calculado al leer — en
  `flights.controller.js`, en el mismo lugar donde ya se calcula `esEscala` (Fase 2), agrupando por
  producto como ya se hace ahí.
- **En pantalla.** La escala desaparece de "Pendientes de check-in" (D2): no hay botón, no hay
  accion. En el calendario y la lista de Itinerarios sigue apareciendo con la marca "Escala",
  mostrando el mismo estado que su tramo principal.
- **Servidor.** `PUT /flights/:id/checkin` rechaza (400) un intento directo sobre una escala: aunque
  la interfaz no ofrezca el boton, el servidor no acepta una escritura en un dato que ya se decidio
  que no significa nada.

**D4. ¿"Añadir Tramo" sigue en el formulario?** → **A**, se conserva. Verificado contra el código
(`TicketForm.tsx:957`): hoy "Añadir Tramo" solo existe en la sección de Ida, no hay equivalente en
Regreso, así que lo que agregue queda marcado `ida` sin ambigüedad.

### Decidido por el agente, para revisar

- **El nombre visible es "Escala de regreso"**, no "de vuelta": la spec de vocabulario dice
  "Regreso, nunca Vuelta". El formulario hoy dice "Trayecto de Vuelta" y "Escalas de Vuelta", y
  ese desvío se corrige en la Fase 3.
- **Una sola función arma los tramos.** Los cuatro bloques casi idénticos de `sales.controller.js`
  (unas 100 líneas) se reemplazan por una: agregar el tipo en cuatro sitios es la señal que
  describe el `CLAUDE.md`. Unifica también el cálculo de `orden`, que hoy mezcla `i + 1` y
  `length + 1` y podría repetir un número si se salta un tramo vacío (hoy: 0 repetidos).

## Plan de trabajo

Rama `feat/escalas-por-tramo`. Las fases 1 a 3 se despliegan juntas. Las fases 4 y 5 van después
de que eso esté en producción.

### Fase 0. Spec primero

- Agregar a `docs/specs/2026-09-17-vocabulario.md`: **Escala de ida** y **Escala de regreso**.

### Fase 1. Guardar el tipo

- Migración `tipo_tramo`: crea el enum y la columna **nullable**. No toca filas.
- `sales.controller.js`: la función que arma los tramos recibe el tipo según la sección.
- Prueba que falla, y la misma debe dar bien después (necesita permiso de la regla 4): crear en
  local una venta con las cuatro secciones y consultar:

```sql
SELECT orden, tipo_tramo FROM tramos_vuelo WHERE prod_tiqueteria_id = '<id>' ORDER BY orden;
-- esperado: 1 ida, 2 escala_ida, 3 regreso, 4 escala_regreso
```

Casos que también se prueban: solo ida directo; solo ida con escala; ida y vuelta directo; escala
de ida que sale al día siguiente; ida y vuelta con escalas en el mismo día. Estos dos últimos son
los que hoy fallan.

### Fase 2. Leer el tipo

- `flights.controller.js`: `type` y `esEscala` salen de `tipoTramo`. Si es `NULL` (venta anterior
  al deploy), se usa la regla actual para no romper nada en la transición.
- `mapLegs` en `sales.controller.js` devuelve `tipoTramo`.
- Verificación con el `flights.list` real en producción, en una transacción de solo lectura:
  **0 tramos cambian de pestaña** respecto a antes del deploy.

### Fase 3. Mostrarlo

- `types/index.tsx`: `esEscala` en `Flight`.
- Marca "Escala" en las pantallas que resulte de **D2**.
- `flights.controller.js`: el `checkin` de una escala sale del tramo principal (**D3**), calculado
  al leer, agrupando por producto igual que `esEscala`. Las escalas se excluyen de "Pendientes de
  check-in".
- `flights.controller.js` (`updateCheckin`): rechaza con 400 un intento de check-in directo sobre
  una escala.
- `TicketForm.tsx`: "Vuelta" → "Regreso" en los títulos, y la ayuda de **D4**.
- Verificación: `tsc` y `build`. Lo visual lo confirma el usuario en pantalla.

### Fase 4. Rellenar lo viejo

Script `backend/db-manual/rellenar_tipo_tramo.sql` y `.sh`, con el patrón de siempre: transaccional,
conteo antes y después, y una guarda que aborta si algo no cuadra. **Escribe en producción: se
confirma con el usuario antes de correrlo.**

- Solo toca filas con `tipo_tramo IS NULL`. Si no cambia nada, no falla al repetirlo.
- Según **D1**: solo ida → `ida`. Ida y vuelta → el primer día es `ida` y el resto `regreso`; si
  todo es un mismo día, el tramo 1 es `ida` y el resto `regreso`.
- Guarda: al final, 0 filas en `NULL`, y el total de tramos igual al del principio.
- Comprobación: `flights.list` da la misma pestaña que antes del script para todos los tramos.
- Queda anotado en `backend/db-manual/README.md`.

### Fase 5. Quitar lo viejo

Solo con la Fase 4 aplicada en producción y verificada:

- Segunda migración: `tipo_tramo` pasa a `NOT NULL`.
- Se elimina de `flights.controller.js` la regla que adivina el sentido por fecha y por orden.

## Riesgos

- **Backend y frontend no se despliegan a la vez.** No es problema: con el backend viejo,
  `esEscala` llega `undefined` y no se muestra ninguna marca.
- **Migración en producción.** Agregar un enum y una columna nullable no bloquea ni mueve datos.
- **Asesores usando "Añadir Tramo" para conexiones.** Esas conexiones no llevarán la marca. La
  ayuda de **D4** lo reduce, pero no lo evita.
- **Sin suite de pruebas.** Toda la verificación es la descrita en cada fase.

## Lo que queda abierto

Hallazgos sin resolver al 2026-11-05, comprobados contra el código de ese día. Ninguno se arregla
con este plan. El orden es por lo que conviene mirar primero, y es propuesta del agente.

### Pueden causar un daño real

1. **El sitio web de una aerolínea no se valida.** Se guarda lo que llegue (`config.controller.js:236`)
   y la grilla lo dibuja como enlace: un `javascript:...` guardado se ejecutaría al hacer clic. En
   proveedores ya se corrigió (`6d79b6a`). Tampoco se valida en el formulario (`Config.tsx`).
2. **`POST /sales` acepta un cliente inactivo.** El bloqueo está solo en los selectores de la
   pantalla; el servidor solo comprueba que el cliente exista (`sales.controller.js:1716`).
3. **Un tiquete acepta una llegada anterior a la salida.** `NewSaleWizard.tsx:450` solo exige que
   las fechas estén; los paquetes sí las comparan (línea 630). Ya hay datos así en producción (ventas
   18 y 190), y esas fechas salen en el voucher.
4. **El token sigue en `localStorage` (C7).** Falta decidir entre una CSP en el frontend, que es la
   opción recomendada, y un proxy en Vercel. Se descartó el subdominio propio. Ver
   [`cierre-pendientes-2026-10.md`](cierre-pendientes-2026-10.md).

### Sin probar

5. **Borrador de venta con un cliente que se desactivó después.** Puede quedar sin titular válido.
6. **Tres arreglos desplegados sin confirmación en pantalla:** la aerolínea por tramo en el check-in
   (`1a03057`), solo ida sin regreso (`5355e58`) y el sitio web opcional del proveedor (`6d79b6a`).
   Los dos primeros se verificaron contra datos de producción; el tercero, solo con la regla aislada.

### Visuales

7. **Al desactivar un cliente, la fila destella en rojo.** El toast ya es verde, y falta decidir si
   el destello se queda (`Clients.tsx:556`).
8. **Los toasts no tienen variante de modo oscuro**, y están copiados en cada pantalla (Usuarios,
   Clientes y Responsables, además de Configuración).
9. **Voucher:** las observaciones de los tours ("Toures") siguen sin respetar los saltos de línea
   (`VoucherPDF.tsx:827`). Un párrafo o una tabla más altos que una hoja no se pueden partir y se
   recortan.

### Menores

10. **`flights.list` no usa el total que calcula.** `total` se consulta y se ignora; la paginación
    que devuelve se calcula con `data.length` (`flights.controller.js:27` y `:292`). El frontend pide
    5.000 filas, así que hoy no se nota.
11. **`.gitignore:115`** parece dos reglas pegadas: `frontend/pdf_formatobackend/test*.js`.
12. **Tramos sin aerolínea:** 37 no tienen aerolínea propia y usan la del tiquete, y hay 1 tiquete
    sin ninguna.

### Del entorno, no del código

13. **La base local es una copia de producción** desde el 2026-10-28, con correos reales de clientes:
    desde local no hay que disparar nada que envíe correos. Los volcados están fuera del repo, en
    `ITEA/backups-produccion/`, incluida la base de pruebas anterior.

### Descartado a propósito, para no volver a evaluarlo

- **Lock de facturación en Postgres (C3):** documentado, no implementado, porque el pooler de
  Supabase no lo soporta.
- **Ventas 84, 86 y 93, y buscar la factura en Siigo antes de reintentar:** el usuario las dejó fuera.
