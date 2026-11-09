# Al escribir código y gasto de tokens

## Al escribir código

**Comentá el porqué, no el qué.** El código dice lo que hace. El comentario dice por qué se
eligió eso, qué se rompió antes, qué alternativa se descartó. Los comentarios de este repo
citan ventas concretas y errores reales; mantenelo así.

**Mirá si ya existe.** Buena parte del trabajo reciente fue descubrir que el modelo ya
soportaba lo que se pedía y solo faltaba leerlo o mostrarlo. `parentDetalleId`,
`asiento_regreso` y el desglose de Siigo ya estaban antes de que se usaran.

**Un cambio repetido en muchos lugares es la señal de que falta una función.** "Cuánto
cuesta este ítem" estaba escrito a mano en dieciocho sitios; mover la plata de lugar le
acertó a ninguno.

## Gasto de tokens

**El prompt caching es obligatorio**, tanto al trabajar en este repo con un agente como en
cualquier código que este proyecto llegue a escribir contra la API de Anthropic. Un prefijo
de prompt que cambia de un llamado a otro invalida el caché y multiplica el costo sin
necesidad.

- No reformules ni repitas en cada mensaje contenido que ya está en contexto (CLAUDE.md,
  archivos ya leídos, resultados de herramientas previos). Si no cambió, no se vuelve a leer.
- Agrupá llamadas a herramientas independientes en un mismo turno en lugar de una por una:
  cada ida y vuelta de más es contexto repetido.
- Ante tareas o preguntas simples, andá directo: un `grep` o una lectura dirigida, no
  recorrer el código entero. Si el usuario da un dato concreto (un número de venta, un
  id), empezá por ese dato antes de rastrear el flujo completo.
- No releas archivos completos cuando alcanza con un rango de líneas.
- Verificá solo lo afectado mientras trabajás; el chequeo completo (`tsc` del frontend,
  `node --check` del backend, consultas de las specs tocadas), una vez antes del commit.
- Respuestas al usuario breves: qué se hizo, qué falta y qué decidir.
- Si se implementa una integración propia con la API de Anthropic, el contenido estable del
  prompt (system prompt, instrucciones, pocos-shots) va marcado con `cache_control` y antes
  del contenido variable, nunca al revés.
