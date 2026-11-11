# Hallazgo 16: carga inicial y mantenimiento

Diseño del hallazgo 16 de `docs/auditoria-frontend-2026-11-08.md`. Se trabaja en la rama `feat/hallazgo-16-carga-y-mantenimiento`, creada desde `feat-bayrol`, y se integra después de que `feat-bayrol` entre a `main`.

## Por qué

La app descarga un archivo de 2,9 MB al entrar, aunque la persona solo use una pantalla. El asistente de ventas tiene más de 2.300 líneas, las cuatro cachés repiten la misma lógica y la configuración arrastra restos que ya no se usan. Ningún cambio de este diseño debe cambiar qué hace la app, salvo cómo carga.

## Objetivos

1. Descargar cada pantalla, los gráficos y la generación de PDF cuando se usan.
2. Quitar restos sin uso comprobado.
3. Una sola implementación de caché.
4. Separar del asistente sus validaciones, con pruebas, y sus formularios.

## Fuera de alcance

- Tipar los `any` del asistente y de la API.
- Dividir los pasos del asistente o cambiar su comportamiento.
- Cambios de backend.
- Comprimir las imágenes.

## Lo que un cambio no debe hacer

- Cambiar qué valida el asistente, qué mensajes muestra o qué envía al servidor.
- Cambiar las claves de `localStorage` ni los tiempos de vida de las cachés. `clearSessionCaches` depende de esas claves.

## Decisiones del usuario

- Alcance: carga por pantallas, limpiar restos, unificar cachés y dividir el asistente, a pesar de la objeción de que el asistente es el núcleo de la facturación y casi no tiene pruebas.
- Mientras se descarga una pantalla: el menú y el encabezado quedan fijos, y el contenido muestra un esqueleto genérico.
- Si después de publicar falta un archivo: la app recarga sola una vez para traer la versión nueva. Si vuelve a fallar, un mensaje con Recargar, sin bucles.
- Asistente: validaciones y formularios. Sin tipado.
- Rama aparte, desde `feat-bayrol`.

## Decisiones del implementador

Orden, de menor a mayor riesgo, con un commit por parte:

1. **Limpiar restos.** Los alias con versión de `vite.config.ts` y `totals` de `Sales.tsx`. Cada eliminación se comprueba con `grep`. El alias `@` se quita solo si nadie lo usa.
2. **Carga por pantallas.** `React.lazy` para las páginas, salvo Login, con `Suspense` alrededor del `Outlet` de `Layout`. `html2canvas` y `jsPDF` se importan al generar el PDF. Un envoltorio común recarga una vez, con una marca en `sessionStorage` que se limpia al cargar bien. Un límite de error muestra el mensaje con Recargar.
3. **Cachés.** Una función `createCache(baseKey, ttl)` que usan las cuatro, conservando sus funciones exportadas, claves y tiempos: ventas y clientes 5 minutos, usuarios 3, configuración 15, dashboard 5.
4. **Validaciones.** `validateStep` pasa a funciones puras que reciben el formulario y lo que necesitan, y devuelven los errores y el mensaje. Las pruebas se escriben antes de moverlas, contra el comportamiento actual.
5. **Formularios.** `renderActiveForm` pasa a un componente propio, moviendo el código sin reescribirlo.

## Verificación

- `tsc`, `npm test` y un `vite build` con salida temporal, para comparar el tamaño contra los 2,9 MB.
- Parte 4: las pruebas nuevas.
- Parte 5: no se puede verificar automáticamente. **Hay que probar a mano la venta de las 17 categorías** antes de integrar la rama.
- Carga por pantallas: abrir cada pantalla. Para el caso de archivo faltante, publicar o borrar un archivo de `assets` con una pestaña abierta.

## Lo que queda abierto

- Los `any` del asistente siguen ahí.
