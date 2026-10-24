# CLAUDE.md

Convenciones de este repo. Vale igual para una persona o un agente.

## Lo primero

Este es un ERP de agencia de viajes en producción, con clientes y facturación real. **No
hay pruebas automatizadas**: lo que no se verifica empíricamente, no está verificado.

## Reglas obligatorias

### 1. El navegador, solo con autorización

**No abras ni uses ningún navegador sin que el usuario lo autorice en el chat**, cada vez.
Esto incluye el navegador integrado (`mcp__Claude_Browser__*`, `preview_start`), Claude in
Chrome y cualquier herramienta que abra páginas. Para verificar, primero `tsc`, `curl` y
SQL (ver [Verificar](#verificar)). Si de verdad hace falta mirar la interfaz, pedilo y
esperá el sí.

### 2. Skill `ponytail` en toda tarea

Usá la skill `ponytail` siempre que crees o corrijas código o cumplas una tarea: favorece la
solución más simple y mínima que funciona.

**Tiene que estar instalada a nivel de proyecto.** Al empezar cada sesión, antes de escribir
código, comprobá que existe `.claude/skills/ponytail/`. Si no está:

1. **Detenete** y pedile al usuario que la instale desde la raíz del repo:

   ```bash
   npx skills add https://github.com/dietrichgebert/ponytail --skill ponytail
   ```

2. **La instalación la corre el usuario, no el agente.** Es código de un repositorio de
   terceros, y un agente no descarga ni ejecuta código de fuentes externas por su cuenta.
3. Cuando el usuario confirme, verificá que la carpeta exista y activá la skill.

`.agents/` y `.claude/` están en el `.gitignore`: cada uno la instala en su máquina.

Si el usuario decide seguir sin instalarla, aplicá su principio a mano: lo mínimo que
resuelva la tarea, sin capas, opciones ni abstracciones que nadie pidió. Recordáselo en la
siguiente sesión.

### 3. Ser crítico, no complaciente

El usuario pide expresamente que no se le dé la razón por defecto.

- Antes de aceptar una idea, una decisión o un cambio, evaluala contra los
  [invariantes](#invariantes-que-no-hay-que-romper), la seguridad, el costo y el hecho de
  que esto factura de verdad. Si tiene un problema, decilo con claridad y proponé una
  alternativa; no lo suavices.
- Cuestioná las prioridades cuando haga falta (p. ej., una feature nueva mientras
  producción tiene un riesgo abierto) y señalá los riesgos aunque no se pregunten.
- Si el usuario tiene razón, decilo en una frase y seguí; no alabes ni repitas su argumento.
- Ser crítico no autoriza a bloquear: si el usuario decide seguir tras escuchar la
  objeción, se respeta y se deja constancia en "Lo que queda abierto" de la spec que
  corresponda, o en el mensaje de commit.
- Lo mismo con tu propio trabajo: revisá tus propuestas con la misma exigencia y corregí
  tus errores en cuanto los veas.

### 4. No ejecutar el proyecto sin consentimiento

**No levantes ni modifiques el entorno local del usuario sin que lo autorice en el chat**,
cada vez. Esto incluye:

- `npm run dev` en `backend/` o `frontend/`, o arrancar la API o la web por otro medio;
- `docker compose up` / `down` / `--build`, o iniciar, detener o reconstruir contenedores;
- `npm run db:migrate`, `db:seed`, `db:reset` o `db:deploy` contra la base local;
- peticiones (`curl`, `fetch`) contra la app local, o crear o borrar datos en ella.

Sí se puede sin pedir permiso: `npx tsc --noEmit` y `npm run build` en `frontend/`,
`node --check` en el backend, y consultas de **solo lectura** a la base local
(`docker exec -i itea_postgres psql ...`) o a producción (ver [Producción](#producción)).
Si una verificación necesita la app levantada, pedilo y esperá el sí.

## Trampas del entorno

**El código va horneado en la imagen de Docker.** `COPY . .`, y solo `uploads` está
montado. Un `git pull` no actualiza los contenedores. Después de cualquier cambio en el
backend: `docker compose up -d --build backend` (con el permiso de la regla 4). Esto ya produjo un diagnóstico falso
—"los pasajeros no se guardan" cuando sí se guardaban— y varias horas perdidas.

**La base está en el 5440 desde el host**, no en el 5432. Un `npm run db:migrate` desde el
host con el puerto equivocado no conecta.

**Todo cambio de esquema va en una migración.** El deploy corre `prisma migrate deploy`,
que solo aplica migraciones ya escritas. Editar el schema y no generar la migración deja la
base atrás sin que nada avise: `npm run db:migrate -- --name lo_que_cambia`, y se commitea
el schema junto con la migración. **`db:push` se retiró a propósito**: sincronizaba sin
dejar historial. Si el cambio borra o mueve datos, primero se agrega lo nuevo, después se
mueven los datos con un script de `backend/db-manual/`, y recién entonces se quita lo viejo
en una segunda migración.

**Antes de commitear, verificá la rama.** `git rev-parse --abbrev-ref HEAD`. Dos commits de
este repo aterrizaron en `main` por no hacerlo, y el `git push origin feat-bayrol` no dio
error: empujó una rama que no había cambiado.

## Producción

Se puede **leer** producción con el `DIRECT_URL` de `backend/.env.production` (el session
pooler, puerto 5432; el del 6543 no sirve para `psql`). Para **escribir**, el patrón es un
script en `backend/db-manual/`: transaccional, con conteo antes y después, y una guarda que
aborta si algo no cuadra. Toda escritura en producción (Supabase, variables o deploys de
Render, Vercel) se confirma con el usuario antes de correrla. Una lectura va dentro de
`BEGIN READ ONLY` y trae conteos, no datos de clientes.

Nunca imprimir `SIIGO_ACCESS_KEY`. Los volcados de base traen datos reales de clientes y no
entran al repo: la regla `*.sql` del `.gitignore` está para eso, y la única excepción es
`backend/db-manual/`.

## Invariantes que no hay que romper

Están desarrollados en [`docs/specs/`](docs/specs/README.md). En corto:

1. **Lo que es de una persona vive en la persona.** Asiento, booking y tiquete van en
   `pasajeros_detalle`, uno por pasajero. Un pasajero sin dato queda sin dato: no se hereda
   el del producto para rellenar. Esto se rompió en las cuatro categorías con pasajeros,
   una por una, y dejó dos pasajeros en el mismo asiento en producción.

2. **El servidor manda sobre el dinero.** Los totales se derivan de las filas dentro de la
   transacción. Un importe que llega calculado del cliente se ignora. Confiar en el
   navegador ya marcó una venta como pagada sin ningún pago.

3. **Un agregado se deriva, no se guarda.** El total de un paquete sale de sus pagos. Una
   copia almacenada se desincroniza y nadie se entera.

4. **La interfaz no afirma lo que no puede saber.** Una factura existe en Siigo solo si su
   estado es `emitida`. Dry run, borrador y timbrada son tres cosas distintas.

5. **Cada cosa se llama igual en todo el flujo, y cosas distintas se llaman distinto.**
   Unificar "Booking" y "Cód. Reserva" fue un error que hubo que revertir.

6. **El esquema solo cambia por una migración versionada.** Antes el deploy corría
   `db push --accept-data-loss`, que borraba columnas sin preguntar y no dejaba rastro.

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
  `sales.controller.js` tiene más de 3.000.
- Verificá solo lo afectado mientras trabajás; el chequeo completo (`tsc` del frontend,
  `node --check` del backend, consultas de las specs tocadas), una vez antes del commit.
- Respuestas al usuario breves: qué se hizo, qué falta y qué decidir.
- Si se implementa una integración propia con la API de Anthropic, el contenido estable del
  prompt (system prompt, instrucciones, pocos-shots) va marcado con `cache_control` y antes
  del contenido variable, nunca al revés.

## En el frontend

- Estado derivado se calcula en el render, no en un `useEffect` que escribe estado.
- No mutar: `next[idx].campo = valor` tras un spread superficial escribe sobre el estado.
- Los radios de "titular" se agrupan con `useId()`. Con `` name={`titular-${idx}`} `` se
  pueden marcar varios a la vez.
- El voucher lo ve el cliente: **no expone costos de proveedor**.

## Mensajes de commit

En español, explicando el problema antes de la solución. Qué se rompía, por qué, qué
alternativa se descartó y cómo se verificó. Los de este repo son largos a propósito: son la
única documentación de decisiones que sobrevive.

La primera línea sigue la forma del historial, `tipo(área): qué`, p. ej.
`fix(creditos): una venta anulada ya no suma a la deuda del cliente`.

Terminar con la línea de atribución que indique el entorno.

## Flujo de trabajo

1. Una rama por feature, `feat/nombre`, desde `main` actualizado.
2. Antes de implementar algo no trivial, el diseño va en `docs/designs/` (sale de la skill
   de brainstorming). Si el cambio toca un invariante, la spec de `docs/specs/` se
   actualiza **primero**, no después.
3. Como no hay suite, la prueba que falla es una consulta SQL, un `curl` o un conteo que
   muestra el problema. Después va el código mínimo, y la misma verificación tiene que dar
   lo esperado.
4. Lo que queda pendiente o se decidió no arreglar va en "Lo que queda abierto" de la spec.
   Si hubo un script de `backend/db-manual/`, su estado va en el README de esa carpeta.
5. Al cerrar: commit y push de la rama. **No se abre PR**: el merge lo hace el usuario, y
   mergear a `main` despliega (Render corre `prisma migrate deploy` solo).

## Verificar

No hay suite. El patrón es: tocar, reconstruir el contenedor, probar por la API contra la
base local, y comprobar con SQL que el dato quedó como se esperaba. Reconstruir y pegarle a
la API necesitan permiso (regla 4); `tsc`, `node --check` y las lecturas SQL, no. Las
specs traen consultas listas para los invariantes que importan.

No hay navegador headless en este entorno: **lo visual no se puede verificar**. Cuando un
cambio sea de interfaz, decilo explícitamente en vez de darlo por bueno.
