# Plan por etapas: carga de listados y tipos

Lo que sigue después de `ventas-paginacion-servidor-2026-11.md`. Cada etapa se hace cuando el usuario la pida, y lleva su propio diseño corto. Volumen en producción al 2026-11-10.

## Carga de las demás pantallas

Cada etapa reutiliza el patrón de Ventas: un hook de listado, página y filtros en el servidor, esqueleto en la tabla.

### Etapa 1: Clientes (128)

- **Qué cambia:** la tabla pagina en el servidor, con búsqueda por nombre y documento.
- **De qué depende:** el asistente de ventas elige entre todos los clientes (`data.clients`), y Ventas e Itinerarios también los usan. Necesita un selector con búsqueda en el servidor antes de quitar la lista completa. Es la parte delicada.
- **Cómo se prueba:** búsqueda, alcance "propios", selector del asistente y autocompletado de integrantes.

### Etapa 2: Itinerarios (225 tramos)

- **Qué cambia:** la lista y sus contadores salen del servidor.
- **De qué depende:** los contadores de check-in se calculan hoy sobre la lista completa; el detalle de cliente y de responsable filtra `data.flights`.
- **Cómo se prueba:** pestañas y contadores contra SQL, y enviar y omitir check-in.

### Etapa 3: Responsables (11), Comisionistas (2) y Usuarios (5)

- **Qué cambia:** el mismo patrón, si llega a hacer falta.
- **De qué depende:** el paso de pago del asistente usa `data.responsables`; liquidar usa `pendingSaleIds` de la lista de comisionistas.
- **Cómo se prueba:** alta, edición, desactivación y liquidación.

## Los `any` (361 en total)

Se reemplazan por tipos reales, sin cambiar qué hace el código.

- **Etapa 1, dinero:** `api/sales` y `DataContext`, con la paginación de Ventas.
- **Etapa 2:** el asistente y sus pasos (`NewSaleWizard`, `ActiveProductForm`, `wizardData`, `steps/`).
- **Etapa 3:** los formularios de `sales/forms/`.
- **Etapa 4:** voucher, configuración, comisionistas y el resto.
