# Hallazgo 11: rutas protegidas por permiso de ver

Diseño del hallazgo 11 de `docs/auditoria-frontend-2026-11-08.md`, acordado con el usuario.

## Problema

El menú oculta lo que un rol no puede ver, pero solo Usuarios protegía su ruta. Escribiendo la URL, un freelancer, que no tiene `config.view`, abre `/config` y ve los catálogos. Es un fallo de presentación: el backend sigue rechazando las escrituras.

## Diseño

Decisiones del usuario:

- Sin permiso de una pantalla, se va sin aviso a la primera que sí puede ver.
- Sin permiso de ninguna, un mensaje de que no tiene pantallas asignadas, con Cerrar sesión.

Decisiones del implementador, mostradas al usuario y aceptadas:

- La primera pantalla sigue el orden del menú (`utils/landingRoute.ts`).
- Estadísticas exige `dashboard.view`, el permiso que ya pide su API.
- Itinerarios deja su pantalla propia de "Acceso Restringido" y funciona como las demás.
- Solo cambia el frontend. Los catálogos que usa el asistente de ventas se siguen cargando: se protege la pantalla `/config`, no sus datos.

## Verificación

Pruebas de `utils/landingRoute.ts`, `tsc` y `npm test`. La redirección la tiene que mirar una persona con un usuario freelancer.
