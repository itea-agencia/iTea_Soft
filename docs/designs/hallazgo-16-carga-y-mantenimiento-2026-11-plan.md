# Hallazgo 16: plan de implementación

> Ejecución en línea, tarea por tarea, sin subagentes (regla 5 de `CLAUDE.md`).

**Objetivo:** cargar cada pantalla cuando se usa y dejar el código más mantenible, sin cambiar qué hace la app.

**Arquitectura:** cinco commits de menor a mayor riesgo. Lo que se mueve se mueve con un script, no se reescribe.

**Tecnología:** React 19, Vite 6, `node:test`. `esbuild` ya viene con Vite: no se agrega ninguna dependencia.

**Diseño:** `docs/designs/hallazgo-16-carga-y-mantenimiento-2026-11.md`.

## Restricciones

- Rama `feat/hallazgo-16-carga-y-mantenimiento`. Verificar la rama antes de cada commit.
- No cambian las claves de `localStorage` ni los tiempos: ventas y clientes 5 minutos, usuarios 3, configuración 15, dashboard 5.
- No cambian las validaciones, sus mensajes ni lo que se envía al servidor.
- Nombres nuevos en inglés; comentarios y mensajes en español.

## Puntos de revisión

1. Una pestaña abierta durante una publicación pide un archivo que ya no existe: recarga una vez, sin bucle. (Tarea 2)
2. Con `sessionStorage` bloqueado, el fallo de carga no debe romper la app. (Tarea 2)
3. La generación de PDF falla por un archivo que ya no existe: mismo manejo. (Tarea 2)
4. Una caché con JSON corrupto o sin token se trata como vacía. (Tarea 3)
5. Con varios errores en un paso, se muestra el último mensaje, como hoy. (Tarea 4)

---

### Tarea 1: limpiar restos

**Archivos:** `frontend/vite.config.ts`, `frontend/src/pages/Sales.tsx`.

- [ ] Comprobar con `grep` que nadie importa con versión ni con `@/`.
- [ ] Quitar todos los alias de `resolve.alias`, y `totals` de `Sales.tsx`.
- [ ] `npx tsc --noEmit`, `npm test` y `npx vite build --outDir <temporal>` pasan.
- [ ] Commit.

### Tarea 2: carga por pantallas

**Archivos:** crear `frontend/src/utils/lazyReload.ts`, `frontend/src/components/ui/PageSkeleton.tsx`, `frontend/src/components/ui/ChunkErrorBoundary.tsx`. Modificar `App.tsx`, `components/layout/Layout.tsx`, `pages/Sales.tsx`. Prueba: `frontend/tests/lazyReload.test.mjs`.

**Produce:** `importWithReload<T>(load: () => Promise<T>, storage, reload): Promise<T>`.

- [ ] Pruebas: al cargar bien, limpia la marca y devuelve el módulo; al primer fallo, guarda la marca y recarga; con la marca puesta, rechaza sin recargar; si `storage` lanza un error, rechaza sin recargar.
- [ ] Verificar que fallan, implementar y verificar que pasan.
- [ ] `App.tsx`: `lazy` para todas las páginas salvo `Login`. `Layout.tsx`: `ChunkErrorBoundary` y `Suspense` con `PageSkeleton` alrededor de `Outlet`.
- [ ] `Sales.tsx`: importar `html2canvas` y `jspdf` al generar el PDF, con `importWithReload`.
- [ ] `tsc`, `npm test` y `vite build`: el archivo principal baja de 2,9 MB. Commit.

### Tarea 3: unificar cachés

**Archivos:** crear `frontend/src/utils/createCache.ts`. Modificar los cuatro `utils/*Cache.ts`. Prueba: `frontend/tests/createCache.test.mjs`.

**Produce:** `createCache<T>(baseKey: string, ttlMs: number)` con `read(): T | null`, `write(data: T): void`, `remove(): void`.

- [ ] Pruebas: la clave es `<baseKey>_<userId>` y `<baseKey>_anonymous` sin token; vence al pasar el TTL y borra la entrada; JSON corrupto devuelve `null`; `localStorage` lleno no lanza error.
- [ ] Verificar que fallan, implementar y verificar que pasan.
- [ ] Reescribir los cuatro módulos sobre `createCache`, con las mismas funciones exportadas.
- [ ] `tsc` y `npm test`, incluido `salesCache.test.mjs`. Commit.

### Tarea 4: validaciones del asistente

**Archivos:** crear `frontend/src/components/sales/wizardValidation.ts`, `frontend/tests/bundleTs.mjs` (como `cargarTs`, pero resuelve imports con `esbuild`). Modificar `NewSaleWizard.tsx`. Prueba: `frontend/tests/wizardValidation.test.mjs`.

**Produce:** `validateWizardStep(step: number, form: WizardFormData, context: { clients: any[]; commissionAgentsForSale?: any[]; asesores: { id: number }[] }): { errors: Record<string, string>; message: string | null }`.

- [ ] Pruebas, con los valores actuales del código: cliente vacío, cliente que no existe, asesor inválido, comisionista no registrado; sin productos; tiquete con reserva inválida da `tiqueteriaValidation` y su mensaje; con dos servicios inválidos, `message` es el último; venta a crédito sin responsable ni vencimiento; vencimiento pasado; venta pagada sin errores.
- [ ] Verificar que fallan.
- [ ] Mover con un script el cuerpo de `validateStep`, cambiando solo `triggerError(x)` por `message = x`. `validateStep` queda como envoltorio que llama a `setErrors` y a `triggerError`.
- [ ] Verificar que el cuerpo movido es idéntico al original salvo ese cambio.
- [ ] `tsc` y `npm test`. Commit.

### Tarea 5: formularios del asistente

**Archivos:** crear `frontend/src/components/sales/ActiveProductForm.tsx`. Modificar `NewSaleWizard.tsx`.

- [ ] Mover con un script el JSX de `renderActiveForm` a `ActiveProductForm`, como componente de módulo.
- [ ] Pasar por props lo que `tsc` reporte como faltante. Sin reescribir el JSX.
- [ ] Verificar que el JSX movido es idéntico al original.
- [ ] `tsc`, `npm test` y `vite build`. Marcar el hallazgo 16 en la auditoría. Commit y push.
- [ ] **Prueba manual de la venta de las 17 categorías**, a cargo del usuario, antes de integrar la rama.
