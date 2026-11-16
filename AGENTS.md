# Repository Guidelines

## Reglas compartidas con Claude (obligatorias para Codex)

Este archivo es el punto de entrada de Codex. Antes de trabajar, leé `CLAUDE.md` y las reglas compartidas que se indican abajo; son obligatorias también para Codex. La mención posterior de comandos es una referencia, no una autorización para ejecutarlos.

| Archivo | Cuándo leer y aplicar |
|---|---|
| `CLAUDE.md` | Siempre: reglas obligatorias, criterio crítico, nombres nuevos en inglés y trampas del entorno. |
| `.claude/rules/permissions-and-verification.md` | Siempre: autorizaciones, producción, secretos y límites de verificación. |
| `.claude/rules/business-invariants.md` | Siempre: los seis invariantes; actualizar la spec afectada antes de implementar. |
| `.claude/rules/architecture.md` | Siempre: permisos, respuestas API, ventas, cachés y compatibilidad entre despliegues. |
| `.claude/rules/workflow-and-commits.md` | Siempre: ramas, diseño, prueba previa, pendientes, commits y cierre. |
| `.claude/rules/efficiency-and-code-quality.md` | Siempre: código mínimo, comentarios y uso eficiente del contexto y herramientas. |
| `.claude/rules/database-and-migrations.md` | Al tocar `backend/prisma/`, `backend/db-manual/` o `backend/scripts/`. |
| `.claude/rules/frontend.md` | Al tocar `frontend/`. |

Leé cada archivo una vez por sesión y releelo solo si cambió o falta su contenido en el contexto. Codex debe leer explícitamente estos archivos; no asumir que carga automáticamente `.claude/rules/` ni sus filtros `paths`.

La fuente de verdad del negocio es `docs/specs/README.md` y las specs que indexa. Si una regla compartida contradice `CLAUDE.md` o una spec, señalalo antes de actuar. El resto de este `AGENTS.md` es un resumen y no reemplaza las reglas completas.

Para `ponytail`, comprobá la instalación del proyecto y leé `.agents/skills/ponytail/SKILL.md`; `.claude/skills/ponytail/` enlaza a esa misma skill. Si falta, seguí el procedimiento de `CLAUDE.md`: la instala el usuario, no el agente. No copies las reglas a `.agents/`: esa carpeta está ignorada por Git y las copias podrían desactualizarse.

`.claude/settings.local.json` es configuración local de permisos de Claude, no reglas compartidas ni autorización para Codex. Sus permisos técnicos no sustituyen la autorización explícita en el chat exigida por las reglas del proyecto.

## Project Structure & Module Organization

iTea Soft is Samtur Travel Agency's ERP. `backend/src/` contains Express 5/CommonJS routes, middleware, controllers, services, and utilities. `backend/prisma/` holds the PostgreSQL schema and versioned migrations; `backend/db-manual/` documents manual data operations. `frontend/src/` contains React 19/TypeScript pages, components, contexts, API clients, and utilities; static assets live in `frontend/public/`. Tests live in `frontend/tests/`. Read `docs/specs/` for business invariants and `docs/designs/` for implementation designs, alongside `CLAUDE.md` and `.claude/rules/`.

## Build, Test, and Development Commands

Run npm commands inside the indicated package; there is no root package script.

- `frontend/`: `npm run dev` starts Vite; `npm run build` runs TypeScript and builds `dist/`; `npm test` runs unit tests; `npx tsc --noEmit` checks types.
- `backend/`: `npm run dev` starts Node watch mode; `node --check src/controllers/sales.controller.js` checks syntax.
- `backend/`: `npm run db:migrate -- --name descriptive_name` creates/applies a development migration. Commit the schema and migration together. `npm run build` generates Prisma and applies existing migrations.
- Root: `docker compose up -d --build` rebuilds the local stack: web `:80`, API `:3000/api/v1`, PostgreSQL `:5440`. Source changes require rebuilding images.

## Coding Style & Naming Conventions

Match surrounding code: two-space indentation, semicolons, CommonJS in backend JavaScript, ES imports in frontend TypeScript. Use PascalCase for React components, camelCase for functions, and existing suffixes such as `*.controller.js` and `*.routes.js`. No lint or formatter script is configured. Keep changes minimal; preserve domain terminology and server-authoritative monetary calculations.

## Testing Guidelines

Use `node:test` and strict assertions in `frontend/tests/*.test.mjs`; `cargarTs.mjs` loads TypeScript helpers. Add regression tests for pure frontend logic. There is no configured coverage threshold or backend test suite. Verify other behavior through authorized local API checks and SQL; consult spec verification queries.

## Commit & Review Guidelines

Work on `feat/name` branches and check the branch before committing. Follow Spanish commit subjects: `fix(ventas): ...` or `docs(reglas): ...`; explain the problem and verification in the body. Document nontrivial designs and update affected invariants first. Current workflow uses branch pushes and user-managed merges; do not open PRs or merge automatically. Handoffs should describe changes, validation, and remaining limits.

## Configuration & Agent Instructions

Use package `.env.example` files; never commit credentials or customer dumps. Obtain explicit chat authorization before browsers, local servers, Docker changes, migrations, app requests, or production writes. Do not spawn subagents unless requested. Apply the project `ponytail` skill. Backend merges deploy through Render; frontend deployment is manual on GoDaddy.
