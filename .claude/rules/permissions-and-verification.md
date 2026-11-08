# Permisos, producción y verificación

## Navegador

No abras ni uses ningún navegador sin que el usuario lo autorice en el chat, cada vez. Esto
incluye el navegador integrado (`mcp__Claude_Browser__*`, `preview_start`), Claude in
Chrome y cualquier herramienta que abra páginas. Para verificar, primero `tsc`, `curl` y
SQL. Si de verdad hace falta mirar la interfaz, pedilo y esperá el sí.

## Entorno local

Sin autorización en el chat, cada vez, no se hace nada de esto:

- `npm run dev` en `backend/` o `frontend/`, o arrancar la API o la web por otro medio;
- `docker compose up` / `down` / `--build`, o iniciar, detener o reconstruir contenedores;
- `npm run db:migrate`, `db:seed`, `db:reset` o `db:deploy` contra la base local;
- peticiones (`curl`, `fetch`) contra la app local, o crear o borrar datos en ella.

Sí se puede sin pedir permiso: `npx tsc --noEmit` y `npm run build` en `frontend/`,
`node --check` en el backend, y consultas de **solo lectura** a la base local
(`docker exec -i itea_postgres psql ...`) o a producción (ver abajo). Si una verificación
necesita la app levantada, pedilo y esperá el sí.

## Producción

Se puede **leer** producción con el `DIRECT_URL` de `backend/.env.production` (el session
pooler, puerto 5432; el del 6543 no sirve para `psql`). Una lectura va dentro de
`BEGIN READ ONLY` y trae conteos, no datos de clientes.

Para **escribir**, el patrón es un script en `backend/db-manual/`: transaccional, con
conteo antes y después, y una guarda que aborta si algo no cuadra. Toda escritura en
producción (Supabase, variables o deploys de Render, Vercel) se confirma con el usuario
antes de correrla.

Nunca imprimir `SIIGO_ACCESS_KEY`. Los volcados de base traen datos reales de clientes y no
entran al repo: la regla `*.sql` del `.gitignore` está para eso, y la única excepción es
`backend/db-manual/`.

## Verificar

La única suite es `frontend/tests/` (`npm test`, `node:test`): cubre funciones puras del
frontend, como validar o comparar fechas. Cada lógica nueva que se pueda probar sin la app
levantada lleva ahí su prueba; `tests/cargarTs.mjs` carga un `.ts` de `src/` sin bundler.
Para lo demás, el patrón es: tocar, reconstruir el contenedor, probar por la API contra la
base local, y comprobar con SQL que el dato quedó como se esperaba. Reconstruir y pegarle a
la API necesitan permiso; `tsc`, `npm test`, `node --check` y las lecturas SQL, no. Las specs traen
consultas listas para los invariantes que importan.

No hay navegador headless en este entorno: **lo visual no se puede verificar**. Cuando un
cambio sea de interfaz, decilo explícitamente en vez de darlo por bueno.
