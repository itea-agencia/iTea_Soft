# Un titular por producto — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cada producto con pasajeros guarda exactamente un titular, y tours y seguros permiten elegirlo.

**Architecture:** Una función pura del backend, `markHolder`, decide el titular de cada lista dentro de `create`; cubre también al frontend viejo de GoDaddy. Tours y seguros reciben el radio "Es Titular" de hotel, con los helpers de `passengerHelpers.ts`.

**Tech Stack:** Express 5 + Prisma (CommonJS), React 19 + TS, `node:test`.

**Spec:** `docs/designs/titular-por-producto-2026-11.md` (diseño aprobado el 2026-11-16); invariante 1 en `docs/specs/2026-09-17-datos-por-pasajero.md`.

## Global Constraints

- Rama `feat-bayrol`; verificar con `git rev-parse --abbrev-ref HEAD` antes de cada commit. No se abre PR ni se mergea.
- Nombres nuevos en inglés (`markHolder`, `passengerRows`); comentarios, textos de pantalla y commits en español.
- El campo `esTitular` del contrato API ↔ frontend no se renombra.
- Levantar el backend local y pegarle a la API necesitan permiso del usuario en el chat, cada vez.
- Sin dependencias nuevas.

## Review Focus

- Frontend viejo (sin `esTitular` en tours y seguros): se guarda un titular, el primero. Lo cubre la prueba "nadie marcado" de la tarea 1.
- Lista con un solo pasajero marcado `false` explícito (p. ej. un hotel editado a mano): queda titular igual. Prueba en la tarea 1.
- Lista con varios marcados `true`: se queda el primero marcado, no el primero de la lista. Prueba en la tarea 1.
- `esTitular` llegando como string `"true"` o `1`: no cuenta como marcado (solo `=== true`). Prueba en la tarea 1.
- Borrar al titular en tour o seguro: el botón de eliminar no aparece sobre él. Va a la lista de pruebas en pantalla (tarea 2).

---

### Task 1: Spec y `markHolder` en el servidor

**Files:**
- Modify: `docs/specs/2026-09-17-datos-por-pasajero.md` ("Un solo titular" y "Lo que queda abierto")
- Create: `backend/src/utils/holder.js`
- Modify: `backend/src/controllers/sales.controller.js:1940-1985` (bloque de pasajeros en `create`)
- Test: `frontend/tests/markHolder.test.mjs`

**Interfaces:**
- Produces: `markHolder(rows: Array<{ esTitular?: any }>) => Array<boolean>`, exportado con `module.exports = { markHolder }`. Devuelve un booleano por fila: `true` solo en el primer índice con `esTitular === true`, o en el índice 0 si ninguno lo es. Lista vacía → `[]`.

- [ ] **Step 1: Actualizar la spec primero.** En "Un solo titular", agregar que la regla vale en las seis listas (hotel, paquete, tiquete, terrestre, tour, seguro) y que el servidor la impone con `markHolder` (`utils/holder.js`): el primero marcado o, si nadie, el primero. En "Lo que queda abierto", reemplazar el punto de `esTitular ?? true` por: el tour del 2026-11-07 con varios titulares queda como está, y 20 filas en 10 tiquetes repiten `nro_tiquete` entre pasajeros, escrito por el asesor.

- [ ] **Step 2: Escribir la prueba que falla**

```js
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { markHolder } = require('../../backend/src/utils/holder.js');

test('nadie marcado: titular el primero (frontend viejo de tours y seguros)', () => {
  assert.deepEqual(markHolder([{}, {}, {}]), [true, false, false]);
});
test('marcado uno que no es el primero', () => {
  assert.deepEqual(markHolder([{ esTitular: false }, { esTitular: true }]), [false, true]);
});
test('varios marcados: se queda el primero marcado', () => {
  assert.deepEqual(markHolder([{}, { esTitular: true }, { esTitular: true }]), [false, true, false]);
});
test('un solo pasajero con false explicito sigue siendo titular', () => {
  assert.deepEqual(markHolder([{ esTitular: false }]), [true]);
});
test('solo true booleano cuenta como marcado', () => {
  assert.deepEqual(markHolder([{}, { esTitular: 'true' }, { esTitular: 1 }]), [true, false, false]);
});
test('lista vacia', () => {
  assert.deepEqual(markHolder([]), []);
});
```

- [ ] **Step 3: Correrla y ver que falla.** `cd frontend && node --test tests/markHolder.test.mjs` → FAIL, `Cannot find module`.

- [ ] **Step 4: Implementar `markHolder` en `backend/src/utils/holder.js`**, con un comentario del porqué (el `?? true` marcaba titulares a todos los pasajeros de tours y seguros; tour del 2026-11-07).

- [ ] **Step 5: Correr la prueba.** `cd frontend && node --test tests/markHolder.test.mjs` → 6 pass.

- [ ] **Step 6: Usarla en `create`.** Renombrar `pasajerosDetalleData` a `passengerRows` en el bloque. Calcular `const holders = markHolder(passengers.map(p => p.raw))` antes del `for`, y en cada fila `esTitular: holders[i]` (el `for...of` pasa a iterar con índice). En `nroTiquete`, dejar `p.nroTiquete || null`, sin `item.ticketNumber`. `node --check backend/src/controllers/sales.controller.js` → sin salida.

- [ ] **Step 7: Commit** de la spec, `holder.js`, el controlador y la prueba: `fix(ventas): un solo titular por producto, el elegido o el primero, y el tiquete no se copia del producto`.

### Task 2: Radio de titular en tours y seguros

**Files:**
- Modify: `frontend/src/types/index.tsx:191` (`GuestInfo`)
- Modify: `frontend/src/components/sales/wizardData.ts` (`INITIAL_INSURANCE.members[0]` y `guests[0]` del tour, línea ~375)
- Modify: `frontend/src/components/sales/forms/TourForm.tsx`, `frontend/src/components/sales/forms/InsuranceForm.tsx`
- Modify: `docs/pruebas-pantalla-hallazgo-16.md`

**Interfaces:**
- Consumes: `setTitular(lista, idx)` y `hayTitular(lista)` de `forms/passengerHelpers.ts`.
- Produces: `GuestInfo` con `esTitular?: boolean`.

- [ ] **Step 1:** Agregar `esTitular?: boolean` a `GuestInfo`. Sembrar `esTitular: true` en el primer integrante de `INITIAL_INSURANCE` y en el primer huésped del tour inicial, con el mismo comentario de por qué que tiene hotel.

- [ ] **Step 2:** En `TourForm.tsx` e `InsuranceForm.tsx`, copiar el bloque de `HotelForm.tsx:139-182`: `const titularGroup = useId()`, `const hasHolder = hayTitular(lista)`, por fila `const isHolder = row.esTitular || (!hasHolder && idx === 0)`, etiqueta "Titular", radio "Es Titular" con `onChange={() => onChange({ guests|members: setTitular(lista, idx) })}`, y el botón de eliminar solo cuando `!isHolder`. Agregar filas con `esTitular: false`. Mantener la condición actual de "más de uno" para eliminar.

- [ ] **Step 3: Verificar.** `cd frontend && npx tsc --noEmit` → sin errores; `npm test` → todas pasan.

- [ ] **Step 4:** Agregar a `docs/pruebas-pantalla-hallazgo-16.md`: en tour y en seguro, el primero aparece como titular; elegir otro mueve la etiqueta; el titular no tiene botón de eliminar; el detalle y el voucher muestran primero al elegido.

- [ ] **Step 5: Commit**: `feat(ventas): tours y seguros permiten elegir el titular, como hotel`.

### Task 3: Verificación contra la base local y cierre

**Files:**
- Modify: `docs/pendientes-2026-11.md`

- [ ] **Step 1: Pedir permiso** para `docker compose up -d --build backend` y para crear ventas de prueba por la API local.

- [ ] **Step 2:** Con permiso, crear por `POST /api/v1/sales` tres ventas: un tour con dos `guests` sin `esTitular` (payload del frontend viejo), un tour con el segundo marcado y un seguro con dos `members`. Comprobar en SQL (`docker exec -i itea_postgres psql -U postgres -d samtur-development`): exactamente una fila `es_titular = true` por `detalle_venta_id`, la esperada en cada caso.

La evidencia del fallo es la prueba unitaria de la tarea 1 y el tour del 2026-11-07 en producción; esta tarea confirma el arreglo en la escritura real.

- [ ] **Step 3:** En `pendientes-2026-11.md`, quitar "Titular por defecto" de "Datos por pasajero" y sumar a "Antes de mergear" la prueba en pantalla de tours y seguros. Commit `docs: pendientes sin el titular por defecto` y `git push origin feat-bayrol`.
