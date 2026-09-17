# CLAUDE.md

Convenciones de este repo. Vale igual para una persona o un agente.

## Lo primero

Este es un ERP de agencia de viajes en producción, con clientes y facturación real. **No
hay pruebas automatizadas**: lo que no se verifica empíricamente, no está verificado.

## Trampas del entorno

**El código va horneado en la imagen de Docker.** `COPY . .`, y solo `uploads` está
montado. Un `git pull` no actualiza los contenedores. Después de cualquier cambio en el
backend: `docker compose up -d --build backend`. Esto ya produjo un diagnóstico falso
—"los pasajeros no se guardan" cuando sí se guardaban— y varias horas perdidas.

**La base está en el 5440 desde el host**, no en el 5432. Un `npx prisma db push` desde el
host con el puerto equivocado no conecta.

**`prisma db push --accept-data-loss` corre en el deploy.** No hay migraciones. Quitar una
columna del schema la borra en producción sin aviso. Si tiene datos, hay que moverlos
primero y dejar el script en `backend/db-manual/`.

**Antes de commitear, verificá la rama.** `git rev-parse --abbrev-ref HEAD`. Dos commits de
este repo aterrizaron en `main` por no hacerlo, y el `git push origin feat-bayrol` no dio
error: empujó una rama que no había cambiado.

## Producción

Se puede **leer** producción con el `DIRECT_URL` de `backend/.env.production` (el session
pooler, puerto 5432; el del 6543 no sirve para `psql`). Para **escribir**, el patrón es un
script en `backend/db-manual/`: transaccional, con conteo antes y después, y una guarda que
aborta si algo no cuadra.

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

**Cuidado con los dos controladores.** `sales.controller.js` y `products.controller.js`
tienen transforms paralelos para los mismos productos, y divergieron: campos que uno guarda
y el otro no, un método de pago que uno resuelve por nombre y el otro espera como id, un
endpoint de seguros que nunca funcionó. Al tocar uno, revisá el otro.

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

Terminar con la línea de atribución que indique el entorno.

## Verificar

No hay suite. El patrón es: tocar, reconstruir el contenedor, probar por la API contra la
base local, y comprobar con SQL que el dato quedó como se esperaba. Las specs traen
consultas listas para los invariantes que importan.

No hay navegador headless en este entorno: **lo visual no se puede verificar**. Cuando un
cambio sea de interfaz, decilo explícitamente en vez de darlo por bueno.
