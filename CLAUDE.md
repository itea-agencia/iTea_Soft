# CLAUDE.md

Convenciones de este repo. Vale igual para una persona o un agente.

## Lo primero

Este es un ERP de agencia de viajes en producción, con clientes y facturación real. Las
pruebas automatizadas son pocas (`frontend/tests/`, solo funciones puras): lo que no se
verifica empíricamente, no está verificado. Lo visual no se puede verificar en este
entorno.

Este archivo tiene lo que no puede faltar nunca. El resto está en `.claude/rules/`, que
Claude Code carga solo:

| Archivo | Qué cubre | Cuándo carga |
|---|---|---|
| `permissions-and-verification.md` | navegador, entorno local, producción, cómo verificar | siempre |
| `business-invariants.md` | los seis invariantes | siempre |
| `architecture.md` | backend, ventas, frontend, deploy | siempre |
| `workflow-and-commits.md` | ramas, specs, commits, cierre | siempre |
| `efficiency-and-code-quality.md` | código mínimo, comentarios, gasto de tokens | siempre |
| `database-and-migrations.md` | schema, migraciones, scripts de datos | al tocar `backend/prisma/`, `db-manual/` o `scripts/` |
| `frontend.md` | React, estado, radios, voucher | al tocar `frontend/` |

La fuente de verdad del negocio es [`docs/specs/`](docs/specs/README.md). Si una regla de
`.claude/rules/` contradice este archivo o una spec, señalalo antes de actuar.

## Reglas obligatorias

### 1. El navegador, solo con autorización

**No abras ni uses ningún navegador sin que el usuario lo autorice en el chat**, cada vez.
Qué entra en esto y cómo verificar sin navegador: `permissions-and-verification.md`.

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

`.agents/` y `.claude/` están en el `.gitignore`, salvo `.claude/rules/`: cada uno instala
las skills en su máquina, pero las reglas son del repo.

Si el usuario decide seguir sin instalarla, aplicá su principio a mano: lo mínimo que
resuelva la tarea, sin capas, opciones ni abstracciones que nadie pidió. Recordáselo en la
siguiente sesión.

### 3. Ser crítico, no complaciente

El usuario pide expresamente que no se le dé la razón por defecto.

- Antes de aceptar una idea, una decisión o un cambio, evaluala contra los invariantes
  (`business-invariants.md`), la seguridad, el costo y el hecho de que esto factura de
  verdad. Si tiene un problema, decilo con claridad y proponé una alternativa; no lo
  suavices.
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
cada vez: ni la API, ni la web, ni Docker, ni migraciones o seeds, ni peticiones contra la
app local. La lista completa y lo que sí se puede sin pedir permiso están en
`permissions-and-verification.md`.

### 5. Sin subagentes salvo que se pidan

No delegues en subagentes ni paralelices con agentes salvo que el usuario lo pida
explícitamente. Cada subagente arranca en frío y vuelve a leer lo que ya está en contexto:
es el camino caro. Esto manda sobre las skills que los lanzan solas
(`subagent-driven-development`, `dispatching-parallel-agents`).

## Trampas del entorno

**El código va horneado en la imagen de Docker.** `COPY . .`, y solo `uploads` está
montado. Un `git pull` no actualiza los contenedores. Después de cualquier cambio en el
backend: `docker compose up -d --build backend` (con el permiso de la regla 4). Esto ya
produjo un diagnóstico falso —"los pasajeros no se guardan" cuando sí se guardaban— y
varias horas perdidas.

**La base está en el 5440 desde el host**, no en el 5432. Un `npm run db:migrate` desde el
host con el puerto equivocado no conecta.

**Todo cambio de esquema va en una migración.** El deploy corre `prisma migrate deploy`,
que solo aplica migraciones ya escritas: editar el schema sin generar la migración deja la
base atrás sin que nada avise. Detalle en `database-and-migrations.md`.

**Antes de commitear, verificá la rama.** `git rev-parse --abbrev-ref HEAD`. Dos commits de
este repo aterrizaron en `main` por no hacerlo, y el `git push origin feat-bayrol` no dio
error: empujó una rama que no había cambiado.

## Comandos

No hay lint. Lo que se puede correr sin permiso:

```bash
cd frontend && npx tsc --noEmit                    # npm run build = tsc + vite build
cd frontend && npm test                            # node --test tests/, sin dependencias nuevas
node --check backend/src/controllers/sales.controller.js   # archivo por archivo
docker exec -i itea_postgres psql -U postgres -d samtur-development   # solo lectura
docker exec -i itea_postgres psql -U postgres -d samtur-development \
  < backend/db-manual/verificar_schema_local.sql   # ¿la base local está al día?
```

Con permiso (regla 4): `docker compose up -d --build backend`, y desde `backend/`
`npm run db:migrate -- --name x` y `npm run db:status`. Local: web en `:80`, API en
`:3000/api/v1`, base en `:5440`.
