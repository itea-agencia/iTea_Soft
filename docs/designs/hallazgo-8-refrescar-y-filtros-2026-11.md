# Hallazgo 8: Refrescar y filtros del Dashboard

Diseño del hallazgo 8 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario el 2026-11-10.

## Problema

- Refrescar pone los datos del Dashboard en `null` y no los vuelve a pedir: la pantalla queda toda en $0 hasta cambiar de pantalla. Es el mismo problema del hallazgo 9 (invariante 4), y pasa cada vez que se usa el botón.
- Refrescar tampoco vuelve a consultar los gráficos de Estadísticas.
- Si hay una consulta en curso, un cambio de filtro se ignora, y la pantalla puede mostrar el rango anterior bajo las fechas nuevas.
- El esqueleto de carga está programado pero nunca se ve: un círculo de carga corta la pantalla antes de llegar a él.

## Diseño

Decisiones del usuario:

- Refrescar vuelve a consultar el Dashboard y los gráficos de Estadísticas, con las fechas elegidas.
- Mientras carga se ve el esqueleto, en el Dashboard y en Estadísticas: en la primera carga, al Refrescar y al cambiar el filtro. No quedan cifras viejas bajo fechas nuevas.
- Si falla, se ven el título y el selector de fechas, y debajo el error con Reintentar, sin ninguna cifra.

Decisiones del implementador, mostradas al usuario y aceptadas:

- Con dos cambios de filtro seguidos gana el último; una respuesta anterior que llegue tarde se descarta (`utils/latestRequests.ts`).
- Al entrar al Dashboard con datos guardados, se ven mientras se actualizan en segundo plano, sin esqueleto. Si esa actualización falla, se conservan con el aviso general.
- En Estadísticas, si falla un gráfico, los demás siguen normales.

Se quita el estado `dashboardLoading`: "cargando" es no tener datos ni error. Por eso un 403 del Dashboard cuenta como error, para que no quede en esqueleto para siempre. Con el hallazgo 11 nadie sin permiso llega a esa pantalla.

## Verificación

Pruebas de `utils/latestRequests.ts` en `frontend/tests/`, `tsc` y `npm test`. Lo visual lo tiene que mirar una persona.
