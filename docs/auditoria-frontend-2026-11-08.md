# Auditoría del frontend — 8 de noviembre de 2026

## Alcance y resultado

Base revisada: `main` en `9e203937decccbe50df8a3a1865bed2c3491e781`. El informe se incorpora a `feat-bayrol` el 9 de noviembre; los cambios posteriores a esa base no se han vuelto a auditar y las referencias de línea corresponden a la versión revisada.

Revisión estática dirigida de autenticación, permisos, contextos, clientes API, cachés, rutas, ventas, comisiones, estadísticas, formularios, vouchers, componentes compartidos y configuración de compilación. El inventario contiene 89 archivos TypeScript/TSX y 27.187 líneas; esto no significa que se haya revisado exhaustivamente cada línea. Se contrastaron los contratos relevantes con el backend y las reglas de `docs/specs/`.

Se identificaron **16 hallazgos: cinco de prioridad alta y once de prioridad media**. La prioridad combina impacto operativo, confidencialidad y probabilidad; no es una puntuación CVSS. No se modificó código funcional.

Verificación realizada:

- `npm test`: seis pruebas aprobadas; cubren validación de fechas y días hasta vencimiento.
- `npm run build`: aprobado, incluido TypeScript. Vite necesitó ejecutarse fuera del sandbox por una restricción de lectura.
- Reproducciones aisladas, con datos sintéticos y sin red: carrera de logout, contaminación de caché, interpretación de dry run y clasificación de deuda vencida.
- No se inició la aplicación, no se abrió un navegador y no se consultaron ni modificaron bases de datos. No se verificaron visualmente responsive, contraste o interacción real. No se ejecutó una auditoría de dependencias/CVE ni se inspeccionaron cabeceras del hosting.

## Hallazgos de prioridad alta

### 1. Una respuesta pendiente puede introducir datos de otra sesión

**Evidencia:** `frontend/src/context/DataContext.tsx:202` y `frontend/src/utils/salesCache.ts:12`.

`fetchSales` no conserva la identidad de quien inició la petición ni descarta respuestas después de cambiar de usuario. Al resolver, escribe en el estado compartido y calcula la clave de caché usando el token que exista en ese momento.

**Reproducción:** iniciar una respuesta diferida para el usuario sintético 101, cambiar el token y vaciar el estado como usuario 202, y resolver la petición anterior. Ejecutando el cuerpo real de `fetchSales` y el módulo real de caché, `loadSalesCache()` del usuario 202 devuelve una venta de 101. Esto demuestra el fallo de aislamiento en esos módulos; no se explotó contra sesiones reales.

**Impacto:** posible exposición de ventas y clientes entre cuentas que comparten navegador y sesión de la SPA. Los filtros visuales de algunas pantallas no corrigen la contaminación del almacenamiento.

**Corrección:** asociar cada petición a una generación de sesión; descartar resultados obsoletos antes de actualizar estado o caché. Pasar explícitamente la identidad a la caché y cancelar peticiones al cerrar sesión. Extender la protección a los demás fetches del contexto.

### 2. El logout puede salir sin Authorization y no revocar la sesión

**Evidencia:** `frontend/src/context/AuthContext.tsx:63`, `frontend/src/api/client.ts:11` y `backend/src/middleware/auth.js:8`.

`logout()` llama a `apiLogout()` sin esperarlo y borra inmediatamente el token. El interceptor de Axios lo lee después. Por defecto, los interceptores de petición son asíncronos, como documenta [Axios](https://axios-http.com/docs/interceptors).

**Reproducción:** instancia de Axios instalada, interceptor equivalente y adaptador sin red: `logoutAuthorization=MISSING`. El backend exige Bearer y no usa cookies como alternativa. El rechazo se silencia con `.catch(() => {})`.

**Impacto:** la interfaz cierra, pero el token puede seguir autorizado en el servidor hasta su vencimiento u otra revocación.

**Corrección:** capturar el token antes de limpiar y enviarlo explícitamente al endpoint de logout; gestionar el resultado de revocación y limpiar siempre el estado local. Cubrirlo con una prueba del cliente de autenticación.

### 3. Siigo: un dry run se presenta como factura emitida

**Evidencia:** `frontend/src/api/sales.ts:53`, `frontend/src/components/sales/SaleDetailModal.tsx:170`, `backend/src/utils/apiResponse.js:1` y `backend/src/controllers/sales.controller.js:2772`.

`createSiigoInvoice` devuelve `res.data`, es decir `{ success, data }`. El modal espera directamente `resultado.dryRun`, `numero`, `publicUrl` y `estampilla`. Después interpreta éxito sin dry run como estado `emitida`.

**Reproducción:** ejecutando la función real con respuesta sintética `{ success: true, data: { dryRun: true } }`, el resultado contiene `data.dryRun=true`, pero `Boolean(resultado.dryRun)` devuelve `false`.

**Impacto:** afirma una emisión inexistente y pierde número, enlace y condición de borrador de las emisiones reales. Contradice el invariante de facturación documentado.

**Corrección:** devolver `res.data.data`, definir un tipo de respuesta y probar dry run, borrador, emisión existente y error. Verificar también que se conserve el estado al reabrir la venta.

### 4. Clientes y comisionistas se identifican por nombre

**Evidencia:** `frontend/src/components/sales/steps/Step1Client.tsx:30` y `frontend/src/components/sales/NewSaleWizard.tsx:1881`.

El selector de cliente usa `value: c.name`; al enviar se resuelve con `.find(c => c.name === form.clientId)`. El selector de comisionista hace lo mismo. Aunque `clientId` sugiere un identificador, almacena un nombre.

**Impacto:** dos personas con el mismo nombre son indistinguibles y se selecciona la primera coincidencia. Puede asociarse una venta, documentación o envío al cliente equivocado. Un cambio de nombre también rompe borradores.

**Corrección:** usar IDs como valores y nombres/documentos como etiquetas; migrar o invalidar los borradores existentes. Probar homónimos y cambios de nombre.

### 5. Las comisiones dependen de haber visitado antes Ventas

**Evidencia:** `frontend/src/pages/CommissionAgents.tsx:103`, `:123` y `frontend/src/context/DataContext.tsx:551`.

La página carga comisionistas y liquidaciones, pero calcula acumulados desde `data.sales`, que no carga. Sobrescribe `agent.accumulated` aunque venga del backend. La liquidación también construye `salesIds` desde ese listado compartido.

**Impacto:** entrar directamente a `/commissions` sin caché puede mostrar acumulados cero y ocultar pendientes; visitar Ventas antes cambia el resultado. Un usuario con permisos de comisiones y sin acceso suficiente a ventas puede obtener resultados incompletos. Además, el directorio usa un umbral fijo de 50.000 mientras el detalle muestra `paymentThreshold`.

**Corrección:** obtener acumulados y ventas liquidables de un contrato específico autorizado por comisiones; no depender de la navegación previa. Usar un único criterio documentado para el umbral y probar acceso directo con caché vacía.

## Hallazgos de prioridad media

### 6. Los créditos con abonos no se clasifican como vencidos

**Evidencia:** `frontend/src/utils/creditUtils.ts:38` y `:94`.

Se devuelve `partial` antes de consultar el vencimiento; `overdueAmount` solo suma estados `overdue`. Una venta de 1.000, abonada en 200 y vencida desde 2000 produce `partial` e importe vencido 0 en una reproducción del módulo real.

**Corrección:** evaluar vencimiento cuando hay saldo pendiente y separar condición de pago de condición temporal. Excluir créditos saldados de contadores y próximos vencimientos, que actualmente también recorren ventas con `isCredit=true` aunque estén pagadas.

### 7. Cambios confirmados pueden reaparecer desactualizados desde caché

**Evidencia:** `frontend/src/context/DataContext.tsx:415`, `:498`, `:522` y `:551`.

Crear, editar o desactivar clientes actualiza memoria pero no invalida la caché de clientes. Registrar/borrar abonos y liquidar comisiones tampoco invalida la caché de ventas. Además, refrescar ventas renueva el timestamp de clientes y viceversa mediante `saveSalesAndClientsCache`, aunque ese otro listado no se haya consultado.

**Impacto:** una recarga puede restaurar saldos, estados o clientes anteriores mientras llega la red; si la red falla, permanecen esos datos. El TTL deja de representar la antigüedad real de cada recurso.

**Corrección:** invalidar o actualizar el recurso afectado después de cada mutación y mantener timestamps independientes.

### 8. Dashboard descarta cambios de filtro y su botón de refrescar no lo consulta

**Evidencia:** `frontend/src/context/DataContext.tsx:179`, `:379`, `frontend/src/pages/Dashboard.tsx:73` y `frontend/src/components/layout/Header.tsx:63`.

Si hay una petición en curso, `fetchDashboard` retorna sin procesar nuevos parámetros. Al terminar puede mostrar el rango anterior con el selector nuevo. Por otro lado, Refrescar pone `dashboardData=null` y consulta ventas/clientes/vuelos, pero no el dashboard. Su efecto depende del rango y de la función estable, por lo que ese cambio no dispara otra consulta. Los gráficos de Stats solo consultan al montarse.

**Corrección:** cancelar o sustituir consultas por rango y hacer que Refrescar invoque los endpoints de la pantalla activa con sus filtros actuales.

### 9. Errores de red se presentan como ceros o listados vacíos

**Evidencia:** `frontend/src/context/DataContext.tsx:193`, `:251`, `frontend/src/pages/Dashboard.tsx:107` y `frontend/src/pages/StatsView.tsx:100`.

El dashboard convierte fallos en `null` y renderiza métricas con `?? 0`. Stats silencia rechazos y muestra textos de ausencia de datos. Config convierte el fallo en `{}` y reemplaza catálogos por arrays vacíos. El aviso general `errorDeCarga` tampoco se limpia tras recuperarse.

**Corrección:** distinguir carga, vacío y error por recurso; conservar el último dato válido con aviso de antigüedad y permitir reintento. Limpiar errores al recuperarse o cambiar de sesión.

### 10. Se anuncian vouchers enviados sin confirmación de envío

**Evidencia:** `frontend/src/components/sales/NewSaleWizard.tsx:1961` y `backend/src/controllers/sales.controller.js:1983`.

El mensaje depende de `item.sendVoucher`, no de un resultado de correo. El backend omite envíos sin email/adjuntos y registra fallos de envío sin convertir la creación de la venta en error. La respuesta no comunica un resultado por envío.

**Corrección:** separar venta creada de envío solicitado/enviado/fallido y devolver resultados explícitos. No afirmar entrega al destinatario solo porque el proveedor aceptó el correo.

### 11. Ocultar el menú no protege todas las rutas de interfaz

**Evidencia:** `frontend/src/App.tsx:47`, `frontend/src/pages/Config.tsx:97` y `backend/src/routes/config.routes.js:7`.

Solo Usuarios utiliza `ConPermiso` en el router; Itinerarios hace una comprobación interna. Config carece de barrera equivalente y sus lecturas solo exigen sesión, porque también sirven al asistente de ventas. Así, alguien sin `config.view` puede abrir directamente `/config` y ver catálogos.

**Corrección:** proteger las rutas según el permiso de visualización y elegir un destino permitido cuando el dashboard no lo esté. Esto es un incumplimiento de presentación; no demuestra un bypass de autorización de escritura del backend.

### 12. Tokens, datos personales y depuración permanecen en el navegador

**Evidencia:** `frontend/src/context/AuthContext.tsx:53`, `:63`, `frontend/src/utils/salesCache.ts:73`, `frontend/src/components/sales/NewSaleWizard.tsx:1860` y `frontend/src/pages/CommissionAgents.tsx:134`.

El logout borra token y borradores, pero conserva cachés de ventas, clientes y usuarios. El TTL se aplica al leer, no elimina automáticamente esos datos. El formulario completo de venta y los comisionistas se imprimen en consola; el primero puede contener documentos, datos de salud y adjuntos base64.

**Impacto:** exposición a otros usuarios del perfil local o a código que consiga ejecutarse en el mismo origen. Guardar JWT en localStorage amplía el impacto de un XSS; no se confirmó aquí un vector XSS explotable. [OWASP](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage) desaconseja almacenar identificadores de sesión y datos sensibles allí.

**Corrección:** eliminar logs sensibles y purgar cachés al salir o revocar sesión. Reducir persistencia de datos personales; cualquier cambio de transporte del token debe diseñarse junto con backend y protección CSRF.

### 13. Los adjuntos no respetan el límite anunciado

**Evidencia:** `frontend/src/components/sales/forms/VoucherField.tsx:23` y `:99`.

Se anuncia un máximo de 10 MB, pero no se comprueba `file.size`, número de archivos ni tamaño agregado antes de convertir todo a base64. `accept` solo orienta el selector; no valida el contenido. Tampoco hay gestión de `FileReader.onerror`.

**Corrección:** validar límites antes de leer, controlar fallos y coordinar los límites del payload con el backend. No se afirma que esto permita por sí solo ejecutar archivos en el servidor.

### 14. Paginación incompleta y contador con contrato incorrecto

**Evidencia:** `frontend/src/context/DataContext.tsx:205`, `frontend/src/components/sales/tabs/PaginatedProductTab.tsx:159` y `backend/src/utils/paginationHelper.js:9`.

Los listados piden una sola página de 5.000 filas y omiten las restantes sin advertencia. Los filtros locales no pueden encontrar registros fuera de ese bloque. En detalles se lee `meta.totalItems`, pero el backend devuelve `meta.total`, por lo que el contador muestra cero con registros presentes.

**Corrección:** consumir paginación y búsqueda del servidor; usar el campo correcto y advertir cualquier límite deliberado. El problema de 5.000 depende de que el volumen supere ese umbral, no de un volumen real comprobado.

### 15. Modales y campos carecen de accesibilidad básica

**Evidencia:** `frontend/src/components/ui/Modal.tsx:52` y `frontend/src/components/ui/Form.tsx:17`.

El modal no declara `role="dialog"`, `aria-modal` ni título asociado; no controla foco, Escape o retorno del foco. El botón de cerrar solo contiene un icono. Las etiquetas de `FormField` no se vinculan al control mediante `htmlFor` ni lo contienen. Cada instancia escribe por separado en `body.style.overflow`, de modo que cerrar un modal puede liberar scroll mientras otro sigue abierto.

**Corrección:** centralizar semántica, foco y bloqueo de scroll en el componente compartido, y asociar etiquetas y errores con IDs. Verificar teclado y lector de pantalla en una revisión de interfaz autorizada.

### 16. Carga inicial y diseño de componentes dificultan mantenimiento

**Evidencia:** `frontend/src/App.tsx:1`, `frontend/src/components/sales/NewSaleWizard.tsx`, `frontend/src/utils/*Cache.ts`, `frontend/vite.config.ts` y `frontend/tsconfig.json`.

El build produjo un JS principal de **2.901,14 kB (680,21 kB gzip)** y cuatro imágenes de aproximadamente 366–536 kB. Las páginas se importan estáticamente; no hay división por rutas. El asistente concentra unas 2.100 líneas con validaciones por categoría, coordinación, persistencia y envío. Hay 411 apariciones de `any` en el inventario, no necesariamente 411 errores, y están desactivadas las comprobaciones de símbolos/parámetros sin uso.

Las cuatro cachés repiten decodificación del JWT, TTL y almacenamiento; `Sales.tsx:120` calcula `totals` sin usarlo. Vite conserva alias de numerosas dependencias que no figuran en el package actual. Estos son indicios concretos de redundancia y restos de configuración, no una razón para reescribir todo.

**Corrección:** dividir por rutas y cargar PDF bajo demanda; extraer gradualmente validadores puros y tipar contratos API de mayor riesgo. Consolidar caché después de corregir aislamiento e invalidación. Quitar código/alias sin consumidores comprobados. Medir tiempos reales antes de atribuir problemas de experiencia al tamaño por sí solo.

## Código mock y aspectos que sí están resueltos

No se encontraron datasets comerciales mock activos en los módulos revisados ni una autenticación simulada del frontend. `PaginatedProductTab.tsx:200` llama «simulado» a `{ type: tabLabel, data }`, pero es un adaptador de datos reales, no registros inventados. Los `INITIAL_*` son valores iniciales de formularios y el confeti usa `Math.random()` con un fin visual.

Sí hay comportamientos que aparentan éxito o ausencia de datos sin evidencia: hallazgos 3, 9 y 10. Son más relevantes que eliminar objetos iniciales por considerarlos mock.

El backend revisado exige Bearer y autorización en estadísticas; el contexto de permisos del frontend reconoce explícitamente que la autorización final corresponde al servidor. El voucher actual evita mostrar costos de proveedores. Los formularios revisados de pasajeros ya reemplazan objetos al actualizar y usan agrupaciones de titular estables. No se reportan como vulnerabilidades problemas antiguos que el código actual ya corrigió.

## Orden propuesto de corrección

1. Aislamiento entre sesiones y revocación de logout; retirar logs sensibles.
2. Contrato Siigo, selección por IDs y fuentes de datos de comisiones.
3. Vencimientos, invalidación de caché, errores y confirmaciones de envío.
4. Refresco/filtros, permisos de rutas, paginación, adjuntos y accesibilidad.
5. División de carga y reducción gradual de duplicación.

Las seis pruebas actuales no cubren estos flujos. Agregar regresiones específicas junto con cada corrección; no usar la compilación exitosa como prueba de comportamiento de pagos, permisos o facturación.

## Estado

Comprobado el 2026-11-09 buscando en el código de `feat-bayrol`, sin ejecutar la app ni repetir las reproducciones, y actualizado el 2026-11-10 con lo corregido. Marcar cada casilla en el commit que lo corrija. Diseños: los hallazgos 1, 2, 4 y 5 en `docs/designs/hallazgos-prioridad-alta-2026-11.md`; el 6, el 12 y el 14 en `docs/designs/hallazgos-media-creditos-sesion-2026-11.md`. Lo corregido está en `origin/feat-bayrol` y todavía no en producción: el orden de despliegue está en `docs/designs/despliegue-hallazgos-auditoria-2026-11.md`.

Prioridad alta:

- [x] 1. Datos de otra sesión. Corregido: cada carga de `DataContext` descarta su respuesta, y no escribe la caché, si el token cambió mientras estaba en curso. Las mutaciones (crear, editar, abonar) no se cubren: las inicia el usuario en su propia sesión.
- [x] 2. Logout sin revocar. Corregido en `e93fda5` y probado en pantalla por el usuario contra la app local (2026-11-10).
- [ ] 3. Siigo: dry run mostrado como emitida. **Fuera de alcance**: hoy no se usa Siigo y se va a dejar de usar (decisión del usuario, 2026-11-09 y 2026-11-10). Si se volviera a usar, se corrige antes.
- [x] 4. Clientes y comisionistas por nombre. Corregido: el cliente, el comisionista y el autocompletado de integrantes (seguros, hoteles, tours y planes) se eligen por id; la etiqueta del cliente lleva el documento.
- [x] 5. Comisiones dependen de visitar Ventas. Corregido: el servidor deriva el acumulado y las ventas a liquidar, y el umbral es uno solo (`settlementThreshold`).

Prioridad media:

- [x] 6. Créditos con abonos no se clasifican como vencidos. Corregido; diseño en `docs/designs/hallazgos-media-creditos-sesion-2026-11.md`.
- [ ] 7. Cambios confirmados reaparecen desde caché. Parcial: liquidar comisiones ya invalida la caché de ventas (con el 5). Siguen los clientes, los abonos y los timestamps cruzados de `saveSalesAndClientsCache`.
- [ ] 8. Dashboard descarta cambios de filtro; Refrescar no lo consulta.
- [x] 9. Errores de red presentados como ceros o listas vacías. Corregido; diseño en `docs/designs/hallazgo-9-errores-de-carga-2026-11.md`. Falta mirar las pantallas de error con la API apagada.
- [ ] 10. Vouchers anunciados sin confirmación de envío.
- [ ] 11. `/config` se abre sin `config.view`.
- [x] 12. Datos en el navegador. Corregido: ya no se imprimen el formulario de venta ni los comisionistas, y el logout y el 401 borran las cachés. Sigue abierto: el JWT vive en `localStorage` (cambiarlo se diseña con el backend y CSRF).
- [ ] 13. Adjuntos sin validar el límite anunciado.
- [ ] 14. Paginación cortada en 5.000 y contador con `meta.totalItems`. Parcial: el contador ya lee `meta.total`; el tope de 5.000 filas sigue, fuera de alcance por ahora.
- [ ] 15. Modales y campos sin accesibilidad básica.
- [ ] 16. Carga inicial y mantenimiento.

Orden propuesto para lo que falta (2026-11-10): primero el 9, porque la pantalla puede mostrar $0 cuando en realidad falló la carga (invariante 4); después el resto del 7 y el 10; luego el 11 y el 13, que son chicos; el 8; y al final el 15 y el 16. El tope de 5.000 del 14 espera a que el volumen se acerque.
