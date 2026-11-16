# Servicios vinculados al paquete — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. El repositorio prohíbe subagentes salvo solicitud expresa: ejecutar en esta sesión, sin delegar.

**Estado:** implementación y verificaciones automáticas/API/SQL realizadas el 2026-11-16. Ventas 169–171 listas para la revisión visual del usuario; publicación y cierre pendientes.

**Goal:** Guardar los vínculos de servicios a paquetes y mostrar cada servicio completo una sola vez dentro de su paquete en el voucher, sin cambiar los totales de la venta.

**Architecture:** El servidor asigna UUID a los detalles, resuelve los vínculos con el mapa completo de paquetes y los aplica después del create en la misma transacción. El voucher reutiliza los bloques de categoría actuales para servicios independientes y vinculados, conservando sus datos y los cortes del PDF.

**Tech Stack:** Express 5/CommonJS, Prisma/PostgreSQL, React 19/TypeScript, node:test, Vite/esbuild existentes. Sin dependencias nuevas.

**Spec:** `docs/designs/servicios-vinculados-al-paquete-2026-11.md` (aprobado en chat); `docs/specs/2026-09-17-dinero-y-totales.md`.

## Global Constraints

- Cualquier servicio puede vincularse a un solo paquete de la misma venta. Los paquetes no pueden vincularse entre sí.
- El vínculo solo agrupa; `monto_total` sigue saliendo de todas las filas.
- El voucher muestra cada servicio vinculado una sola vez, dentro de su paquete y conservando todos los datos de su bloque independiente. Incluye equipaje.
- No editar ventas viejas, modificar Siigo, crear migraciones ni añadir dependencias.
- Funciones, variables y tipos nuevos en inglés; mensajes y documentación en español.
- Actualizar la spec antes del código. Prueba que falla antes del arreglo.
- No tocar cambios ajenos presentes en el workspace. Revisar `git status --short`, rama y archivos AGENTS aplicables antes de implementar o commitear.
- API, servidores, reconstrucción de Docker y escrituras de datos requieren autorización explícita para esa etapa. No ejecutar `backend/npm run build`: aplica migraciones.
- El usuario hará la revisión visual desde su navegador. No abrir navegadores del agente.
- Preparar primero el resultado revisable; no publicar, mergear ni abrir PR. Publicar requiere confirmación del usuario.

## Review Focus

1. Índice 0 y valores que se convierten accidentalmente en 0: probar en tarea 1.
2. Tiquete recorrido antes que su paquete y posiciones vacías: integración en tarea 2.
3. Rechazo después de crear personas dentro de la transacción: comprobar rollback completo en tarea 2.
4. Campos o pasajeros que desaparecen, equipaje separado o servicios duplicados: render estático en tarea 3.
5. Paquete con varios servicios que supera una página: estructura en tarea 3 y revisión del PDF por el usuario en tarea 4.

## Mapa de archivos

- Modificar `docs/specs/2026-09-17-dinero-y-totales.md`: contrato del vínculo y total inalterado.
- Crear `backend/src/utils/planLinks.js`: validación pura de índice.
- Crear `frontend/tests/planLinks.test.mjs`: contrato del helper CommonJS, siguiendo `markHolder.test.mjs`.
- Modificar `backend/src/controllers/sales.controller.js`: únicamente preparación y persistencia de vínculos en `create`.
- Modificar `frontend/src/components/sales/VoucherPDF.tsx`: reutilizar los bloques por categoría y agrupar por padre.
- Modificar `frontend/tests/bundleTs.mjs`: permitir importar el componente ignorando CSS en pruebas; conservar los loaders actuales.
- Crear `frontend/tests/voucherPlanLinks.test.mjs`: pruebas de contenido con `react-dom/server`, ya instalado.
- Modificar `frontend/src/components/sales/VoucherPDF.css` y `frontend/src/pages/Sales.tsx` solo si lo necesita el corte de bloques vinculados; mantener el algoritmo actual y sus demás comportamientos.
- Modificar `docs/pruebas-pantalla-hallazgo-16.md`, `docs/resultado-venta-completa-api-2026-11-16.md` y `docs/pendientes-2026-11.md`: instrucciones y evidencia real, sin marcar lo no ejecutado como aprobado.

## Tarea 1: Contrato y validación del índice

**Interfaces:** `planLinkIndex(value, planCount)` exportado por CommonJS; produce `number | null`, o lanza `Error` con `statusCode = 400` y `code = 'VALIDATION_ERROR'`.

- [x] Actualizar primero la fila «Total de un paquete» de la spec: vínculo al crear por `linkedToPlanIndex`, padre paquete de la misma venta, índice inválido rechazado, ningún cambio en totales almacenados.
- [x] Crear la prueba con `createRequire`, como `markHolder.test.mjs`. Afirmaciones mínimas:

```js
for (const value of [undefined, null, '']) {
  assert.equal(planLinkIndex(value, 2), null);
}
for (const value of [0, '0', 1, '1']) {
  assert.equal(planLinkIndex(value, 2), Number(value));
}
for (const value of [-1, 2, 0.5, 'no', false, true, ' ', [], {}, Infinity, NaN]) {
  assert.throws(() => planLinkIndex(value, 2), {
    statusCode: 400, code: 'VALIDATION_ERROR',
  });
}
assert.throws(() => planLinkIndex(0, 0), { statusCode: 400 });
```

- [x] Desde `frontend/`, ejecutar `node --test tests/planLinks.test.mjs`; comprobar que falla porque el módulo aún no existe.
- [x] Implementar el helper: aceptar solo número o texto numérico no vacío; comprobar entero y rango tras convertir. No usar truthiness para detectar el índice 0.
- [x] Repetir el comando; todas las afirmaciones deben pasar.

## Tarea 2: Guardar vínculos de forma atómica

**Consumes:** helper de tarea 1; arrays actuales del request.
**Produces:** `parentDetalleId` persistido; mismo contrato de respuesta de create y GET actual; error 400 contextual ante vínculo inválido.

- [x] Revisar todos los usos de `PRODUCT_HANDLERS` y `create` con `rg`; conservar validaciones, cálculo monetario y envío posterior de vouchers.
- [x] Preparar casos de integración sintéticos a partir de la venta 168, sin credenciales en archivos versionados. Para probar por API, pedir autorización cuando payloads y verificaciones estén preparados. Sin permiso, conservar esta verificación como pendiente.
- [ ] Con permiso, reproducir el fallo antes del código: venta nueva con check-in y tour enlazados produce detalles sin padre. No modificar la venta 168 original. Desactivar envío de correos en las solicitudes de prueba.
- [x] Importar `randomUUID` de `node:crypto`. Asignar `id` a cada detalle que realmente se guarda. Registrar IDs de paquetes en un array que conserve los índices originales de `data.planData`, sin compactar filas vacías.
- [x] Recoger vínculos pendientes con ID del hijo, índice del padre y contexto de categoría/posición original. Validar índice con el helper. Rechazar un paquete con vínculo no vacío, incluyendo el índice 0.
- [x] Después de construir todos los detalles y antes del create, resolver pendientes contra el mapa completo. Rechazar posiciones sin paquete creado. El mensaje debe incluir categoría y posición original del servicio, p. ej. «Tour #1: el paquete vinculado no existe».
- [x] Después de `tx.ventas.create`, agrupar hijos por padre y ejecutar un `tx.detalleVenta.updateMany` por paquete dentro de la misma transacción. No modificar financieros, pagos ni los agregadores existentes.
- [x] Con permiso, verificar estos casos por API y SQL de solo lectura:
  - Nueva repetición de la 168: check-in y tour apuntan al paquete; total 187000. GET devuelve padre e importes agregados esperados según las filas del payload, sin sumarlos otra vez al total de venta.
  - Dos paquetes: tiquete vinculado al segundo, aunque se procese antes; cada padre pertenece a la misma venta y tiene categoría `planes`.
  - `planData` con una posición vacía intermedia: vínculo al paquete posterior funciona; vínculo a la posición vacía falla sin desplazamientos.
  - Sin vínculo: mismos detalles y totales que antes. Número 0 y texto '0': vínculo guardado.
  - Índice 5 con un paquete, sin paquetes, índice mal tipado y paquete vinculado a paquete: 400 `VALIDATION_ERROR`, con servicio identificable.
  - Solicitud inválida que incluye una persona sintética nueva procesada antes del error: comparar conteos antes/después; no quedan venta, detalles, pagos ni persona nuevos. No exigir continuidad del ID secuencial tras rollback.
- [ ] Ejecutar `node --check backend/src/controllers/sales.controller.js` y `node --check backend/src/utils/planLinks.js`; resultado esperado: exit 0.

## Tarea 3: Reutilizar el detalle completo en el voucher

**Consumes:** `Sale` actual con `detalleVentaId`, `parentDetalleId` y arrays por categoría; props actuales `airportMap`, `baggageList`, `showPrice`.
**Produces:** mismo componente público `VoucherPDF`, con una sola representación completa de cada servicio. No cambiar el contrato de sus consumidores.

- [x] Añadir loader `.css: 'empty'` al helper `bundleTs`, conservando lo existente. Crear `voucherPlanLinks.test.mjs`, cargar `VoucherPDF` con ese helper y usar `renderToStaticMarkup` de `react-dom/server`.
- [x] Escribir una prueba que falle antes de refactorizar: un paquete con equipaje y un tiquete vinculados; usar textos únicos para pasajero, booking, tiquete, tramo y equipaje. Afirmar que cada texto aparece una vez y que pertenece al grupo del paquete, antes de un segundo paquete/servicio independiente usado como límite. Verificar también que el resumen antiguo no sustituye los campos completos.
- [x] Ejecutar desde `frontend/` `node --test tests/voucherPlanLinks.test.mjs`; confirmar fallo por contenido/agrupación, no por fallo al importar CSS o React.
- [x] Extraer o reutilizar dentro del componente los renderizadores actuales por categoría. No crear un sistema genérico nuevo ni reescribir campos. Un mismo renderizador recibe los ítems seleccionados para la sección independiente o el paquete. Conservar bloques de vuelos, pasajeros, fechas, observaciones, índices/keys y props de precios.
- [x] Incluir las 16 categorías no paquete. Retirar el resumen especial de hijos y excluir los vinculados de secciones independientes, también equipaje. Agrupar mediante el ID persistido, sin usar `linkedToPlanIndex` para ventas leídas.
- [x] Mantener cortes del PDF entre bloques del contenido. No encerrar todos los hijos en un único contenedor indivisible. Si es necesario ajustar `repartirTarjeta`, recorrer los bloques anidados manteniendo el contexto del paquete y la etiqueta de continuación; no sustituir el paginador. Conservar el límite previo de tablas individuales mayores que una página y documentarlo.
- [x] Ampliar la prueba con casos por las 16 categorías: marcadores de los campos que hoy muestra cada bloque independiente y sus pasajeros deben conservarse al vincular, una vez cada uno. Comparar datos visibles de ambas variantes, sin snapshots de todo el HTML ni clases exactas.
- [x] Añadir pruebas de dos paquetes y servicios independientes mezclados; verificar pertenencia correcta y ausencia de duplicados. Con `showPrice=false`, los importes de precio al cliente deben seguir ocultos; con `true`, conservar el comportamiento actual. Probar venta antigua sin vínculos y `sale=null`.
- [x] Añadir una comprobación de estructura para un paquete con múltiples servicios: existen bloques internos separables y su contexto; no afirmar que el render estático verifica alturas o paginación real.
- [x] Repetir el test focalizado; debe pasar. Ejecutar `npm test` y `npm run build` desde `frontend/`; ambos deben terminar con exit 0. El build incluye TypeScript y Vite.

## Tarea 4: Evidencia, revisión humana y entrega

**Produces:** evidencia de lo ejecutado, lista visual concreta y cambios listos para revisar. No implica despliegue ni merge.

- [x] Preparar en `docs/pruebas-pantalla-hallazgo-16.md` una lista con los IDs de ventas nuevas realmente creadas (si hubo permiso), las categorías a comparar y resultado esperado.
- [ ] El usuario revisa en su navegador y PDF descargado: datos completos de las 16 categorías, pertenencia a cada paquete, equipaje incluido, ninguna duplicación, servicios independientes, precios visibles/ocultos, vuelos/pasajeros y observaciones largas en varias páginas. Comprobar que no hay recortes nuevos ni encabezados sin contenido o pérdida del contexto del paquete al continuar.
- [ ] Registrar sus resultados sin dar la revisión por realizada hasta recibirlos. Si detecta un problema, corregirlo y repetir solo las comprobaciones afectadas.
- [x] Actualizar hallazgos e índice con verificaciones efectivas, IDs nuevos y pendientes. No cerrar los otros cinco hallazgos ni afirmar que se reparó la venta 168 original.
- [x] Revisar diff y cambios ajenos; ejecutar `git diff --check`. Si no hubo cambios tras los checks de las tareas anteriores, no repetirlos sin motivo.
- [ ] Antes de un commit comprobar rama y seguir el flujo del repositorio; añadir solo archivos de este arreglo. Si la rama sigue siendo `feat-bayrol`, conservar el contexto autorizado por el diseño y no mezclar trabajo ajeno. Mensaje sugerido: `fix(ventas): conserva los servicios vinculados al paquete`, con problema y verificaciones en el cuerpo. No mergear ni abrir PR.
- [ ] Entregar resumen con verificaciones, límites y paquete frontend revisable. Para el despliegue, comprobar compatibilidad del frontend nuevo con backend anterior, proponer frontend primero y backend después y solicitar confirmación para ejecutar. No ejecutar Docker, solicitudes ni producción como consecuencia automática de aprobar este plan.

## Autorrevisión del plan

- Cobertura: contrato e invariantes (tarea 1), transacción y errores (2), voucher completo (3), revisión visual y publicación (4).
- Interfaces: helper CommonJS consumido por create; se conserva `Sale` y la API pública de `VoucherPDF`.
- Sin subagentes, nuevas dependencias, migraciones o reconstrucción de datos históricos.
- La agrupación y presencia de datos se comprueban automáticamente; las alturas y el PDF final dependen de la revisión del usuario.
- Estado de ejecución: tareas de código y verificaciones automáticas/API/SQL realizadas; revisión visual y despliegue pendientes. La reproducción previa al código se hizo con pruebas offline del controlador y del render, en vez de la API anterior al arreglo; ver resultado-venta-completa-api-2026-11-16.md.
