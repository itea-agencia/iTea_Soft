# Hallazgo 9: errores de carga mostrados como ceros o listas vacías

Diseño del hallazgo 9 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario el 2026-11-10.

## Problema

Un fallo de red o del servidor se ve igual que "no hay datos", y eso va contra el invariante 4:

- El Dashboard pone sus datos en `null` y muestra todo en $0.
- Los tres gráficos de Estadísticas dicen "No hay ... registradas".
- Configuración reemplaza los catálogos por listas vacías, aunque ya estuvieran cargados, y deja vacíos los selectores que dependen de ellos.
- El aviso general guarda un solo mensaje y no se limpia al recuperarse ni al cambiar de sesión.

## Diseño

- **Dashboard.** Si falla la carga inicial o un cambio de filtro, no se muestra ninguna cifra: un panel de error con Reintentar. Dejar las cifras del rango anterior bajo las fechas nuevas sería afirmar algo falso (decisión del usuario, 2026-11-10). Si falla solo la actualización en segundo plano sobre datos ya guardados, se conservan esos datos con el aviso general.
- **Estadísticas.** Cada gráfico tiene su estado de error y su Reintentar, con un hook compartido por los tres.
- **Configuración.** Si falla, conserva lo que tenía y muestra el aviso general, igual que las demás listas.
- **Aviso general.** Se guarda la lista de lo que falló (`utils/loadFailures.ts`). Cada carga se quita de la lista al funcionar, y la lista se vacía al cambiar de sesión. El fallo de una petición de la sesión anterior no se registra.
- Un 401 o 403 no es un fallo de carga: es un recurso que ese rol no tiene permitido.

## Fuera de alcance

- Un panel de error propio en cada listado (Ventas, Clientes): el aviso general lo cubre.
- Mostrar la antigüedad de los datos.
- El hallazgo 8: el botón Refrescar sigue sin volver a consultar el Dashboard ni Estadísticas.

## Verificación

Pruebas de `utils/loadFailures.ts` en `frontend/tests/`, `tsc` y `npm test`. Las pantallas de error no se pueden verificar en este entorno: las tiene que mirar una persona con la API apagada.
