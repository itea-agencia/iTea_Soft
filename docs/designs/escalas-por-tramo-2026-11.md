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

**D1. ¿Qué se hace con las ventas viejas de varios tramos?**
- **A (recomendada):** solo se les pone el sentido, ida o regreso, con la regla de hoy. Ninguna
  queda marcada como escala. El resultado en pantalla es idéntico al actual.
- B: revisar a mano las 18 ventas y marcar las escalas en una lista explícita dentro del script.
  Da un historial más rico, pero para vuelos que ya pasaron y basándose en una deducción.

**D2. ¿Dónde se muestra la marca "Escala"?**
- **A (recomendada):** en Itinerarios (calendario, lista y modal de check-in) y en los modales de
  cliente y responsable. Las escalas siguen en la pestaña de su sentido y suman a su contador.
- B: además, en el voucher y en el detalle de la venta. El voucher lo ve el cliente y su
  paginación es delicada, por eso conviene hacerlo aparte.

**D3. ¿Una escala necesita su propio check-in?**
- **A (recomendada):** sí, no se cambia nada. Cada tramo sigue con su check-in pendiente.
- B: que la escala herede el de su tramo principal. Depende de cómo opera cada aerolínea y cambia
  las alertas de pendientes, así que sería otro trabajo.

**D4. ¿"Añadir Tramo" sigue en el formulario?** Esa sección y "Con Escalas" hacen casi lo mismo,
y un asesor que cargue una conexión con "Añadir Tramo" no verá la marca de escala.
- **A (recomendada):** se conserva, porque un viaje con varios destinos la necesita (venta 27). Se
  agrega una línea de ayuda que explique la diferencia. Lo de "Añadir Tramo" queda como `ida`.
- B: quitarla y dejar solo "Con Escalas". Más simple, pero un viaje con estadías quedaría marcado
  como si fueran escalas.

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

- El formulario acepta una llegada anterior a la salida (ventas 18 y 190).
- `POST /sales` no rechaza un cliente inactivo: el bloqueo está solo en la pantalla (`f142cbd`).
