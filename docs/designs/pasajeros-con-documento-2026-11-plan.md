# Toda persona con nombre y documento válidos: plan

> Ejecución en línea, sin subagentes (regla 5 de `CLAUDE.md`) y sin la skill `ponytail` (no instalada): se aplica a mano su principio, lo mínimo que resuelva cada punto. Diseño aprobado: `pasajeros-con-documento-2026-11.md`.

## Restricciones

- Rama `feat/hallazgo-16-carga-y-mantenimiento`. Un commit por tarea; verificar la rama antes de cada uno.
- Nombres nuevos en inglés; mensajes al usuario y commits en español.
- La regla es una sola y vive en dos lugares que se nombran entre sí: `frontend/src/utils/docNumber.ts` y `backend/src/utils/persons.js`.
- Valores fijos del diseño: documento de 6 a 15 tras `trim`; CC `^\d+$`; NIT/RUT `^\d+(-\d)?$`; pasaporte (`PASAPORTE`, `PP`, `PAS`) `^[a-zA-Z0-9]+$`; letras `^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$`; nombre o apellido separado ≤ 40; nombre completo ≤ 80 y al menos dos palabras; tipo obligatorio y existente en `tipos_documento.abreviatura`.
- Nada que reconstruya contenedores ni pegue a la API local sin permiso del usuario en el momento (tarea 7).

## Review Focus

1. Un nombre con espacios de sobra ("  Ana   Pérez ") cuenta como dos palabras y pasa; uno de una sola palabra con espacios alrededor ("  Ana ") no. Prueba en la tarea 1.
2. Un NIT con dígito de verificación (`900123456-7`) sigue pasando en clientes; la normalización (`normalizeDocNumber`) corre antes de validar, como hoy. Prueba en la tarea 1 y conteo en la tarea 7.
3. Un `update` de cliente que solo cambia el teléfono no se rechaza por campos que no llegaron. Verificación en la tarea 7.
4. Una venta de check-in, migración o SIM sin nombre ni documento en el ítem (titular implícito) sigue creándose con el cliente. Verificación en la tarea 7.
5. Un borrador de venta guardado antes del cambio, con un pasajero de tipo `TI` o con una fila vacía, no se guarda: el paso 2 muestra el error. Prueba en la tarea 3.

## Puntos de revisión

1. Pasajero sin documento, fila vacía, CC con letras, tipo inexistente, nombre de una palabra y nombre con números: 400 y `personas` no cambia.
2. Venta completa de tiquete, hotel, seguro, plan, tour, viaje terrestre, check-in, migración, SIM y visa: 201.
3. Venta de mascotas: no crea persona; el pasajero es el cliente.
4. Clientes, responsables, usuarios y comisionistas: alta y edición con un dato inválido dan 400; con uno válido, 200/201.
5. Producción, solo lectura, después del despliegue: los conteos del diseño siguen en cero.

### Tarea 1: la regla en el frontend

`frontend/src/utils/docNumber.ts`. `validateDocNumber(docType, value)` queda como está y se le agregan:

- `validateNamePart(value: string): string`: obligatorio, letras, ≤ 40. Devuelve el mensaje o `''`.
- `validateFullName(value: string): string`: obligatorio, letras, ≤ 80, al menos dos palabras tras `trim` y partir por espacios.
- `validatePerson(p: { name?: string; docType?: string; docNumber?: string }, docTypes: string[]): string`: primer error de nombre completo, tipo (vacío o fuera de `docTypes`) o documento. Una fila sin nombre ni documento da "Faltan el nombre y el documento".

Comentario de cabecera: el backend aplica la misma regla en `backend/src/utils/persons.js`.

- [ ] `tests/personRules.test.mjs` con `cargarTs('utils/docNumber.ts')`:
  - `validateFullName('Ana')` y `'  Ana '` fallan; `'  Ana   Pérez '` pasa; uno de 81 caracteres falla; `'Ana P3rez'` falla.
  - `validatePerson` falla sin documento, con fila vacía, con `docType: 'TI'` si el catálogo es `['CC','T.I']`, con CC `'12ab56'`; pasa con `{ name: 'Ana Pérez', docType: 'CC', docNumber: '1234567' }`.
  - `validateDocNumber('NIT', '900123456-7')` pasa.
  Verlas fallar.
- [ ] Implementar, verlas pasar, `tsc`. Commit.

### Tarea 2: la regla en el backend y los módulos de personas

`backend/src/utils/persons.js`: `docNumberError(docType, docNumber)`, `namePartError(value)`, `fullNameError(value)`, misma lógica y mensajes que la tarea 1, exportadas. `isDocNumberOutOfRange` se borra y sus usos pasan a `docNumberError`. El tipo existente lo valida quien llama, con la consulta a `tiposDocumento` que cada controlador ya hace.

- **`clients.controller.js` y `responsables.controller.js`**:
  - en `create`, `firstName` y `lastName` con `namePartError`, y tipo y documento obligatorios;
  - en `update`, solo los campos que llegan.
- **`users.controller.js`**: igual que clientes.
- **`commissions.controller.js`** (`createAgent`, `updateAgent`): `name` con `fullNameError`, más tipo y documento.

Responde 400 con `INVALID_DOC_NUMBER` para el documento, `INVALID_DOC_TYPE` si el tipo no existe y `INVALID_NAME` para el nombre. La normalización del NIT queda antes de validar.

- [ ] Antes, comprobar con `node -e` los casos de la tarea 1 contra las funciones nuevas: tienen que dar los mismos resultados.
- [ ] `node --check` de los cinco archivos. Commit.

### Tarea 3: el asistente valida cada pasajero

`frontend/src/components/sales/wizardValidation.ts`. `validateWizardStep` recibe `data: Pick<AppData, "clients" | "commissionAgentsForSale" | "config">` y saca los tipos de `data.config.documentTypes.map(d => d.abreviatura)`. Con `validatePerson`, el primer error de cada pasajero sale como "<Categoría> #i, pasajero j: <mensaje>" en:
- las listas de tiquetería, hotelería, seguros, planes, tours y viajes terrestres;
- el ítem de check-in, migración, SIM y visa.

En planes, los integrantes dejan de ser opcionales. Se quitan los rangos 5–20 de planes, migración y visa.

- [ ] En `tests/wizardValidation.test.mjs`, con `config.documentTypes` `[{abreviatura:'CC'},{abreviatura:'T.I'}]`:
  - hotel con un huésped sin documento falla;
  - tiquete con una fila vacía falla;
  - SIM con `docType: 'TI'` falla;
  - plan con un integrante de una palabra falla;
  - un tiquete completo pasa.
  Actualizar las llamadas existentes a `validateWizardStep` con `config`. Verlas fallar.
- [ ] Implementar y pasar `config` desde `NewSaleWizard.tsx`. `tsc` y `npm test`. Commit.

### Tarea 4: tipos del catálogo y dueño de la mascota

- **Catálogo de tipos:** `CheckInForm.tsx`, `MigrationForm.tsx` y `VisaForm.tsx` cambian su lista fija por `data.config.documentTypes` (`value` y `label` = `abreviatura`), como en `HotelForm.tsx`. `wizardData.ts` siembra el tipo del cliente (`client?.docType`) y no `"CC"` o `"Pasaporte"` fijos.
- **Tiquetería:** ~~selector de tipo por pasajero~~. No hace falta: cada pasajero se elige de la lista de clientes y su documento queda bloqueado, así que el tipo llega de la ficha del cliente, y en producción todos lo tienen. Un selector solo dejaría contradecir la ficha. Una fila sin elegir queda vacía y la frena la regla de fila vacía. (Corrección del agente al ejecutar, 2026-11-11.)
- **SIM card:** no tenía selector de tipo y el servidor la guardaba sin tipo: se agrega, sembrado con el del cliente.
- **Mascotas:** `PetServiceForm.tsx` muestra "Dueño" en solo lectura con el nombre y el documento del cliente del paso 1, derivados de `form.clientId` y no guardados en el ítem. `ownerName` sale de `wizardData.ts` y de los tipos.

- [ ] `tsc`, `npm test`, `vite build`. Commit. Lo visual queda para la prueba en pantalla.

### Tarea 5: el servidor valida cada pasajero

Primero `docs/specs/2026-09-17-datos-por-pasajero.md`: una sección nueva, "Todo pasajero tiene nombre y documento", con la regla y las excepciones (pasajero implícito vacío = cliente; vehículos, equipaje y mascotas = cliente).

`sales.controller.js`:
- `servicio_mascotas` se agrega a `CATEGORIAS_PASAJERO_ES_CLIENTE`.
- `passengerError(data, docTypes: Set<string>): string | null` recorre `PRODUCT_HANDLERS` con la misma lógica que el armado: lista explícita, o ítem con nombre o documento. Saltea `CATEGORIAS_PASAJERO_ES_CLIENTE` y usa `docNumberError` y `fullNameError` de `persons.js`.
- `create` la llama antes de la transacción, con los tipos leídos una vez, y responde `400 VALIDATION_ERROR`.

- [ ] `node --check`. Commit.

### Tarea 6: comisionistas en pantalla

`frontend/src/pages/CommissionAgents.tsx`: el nombre pasa por `validateFullName` (hoy solo se exige que no esté vacío).

- [ ] `tsc`. Commit.

### Tarea 7: verificación con permiso y cierre

- [ ] Con permiso: reconstruir el backend (y el frontend, si el usuario lo pide).
- [ ] Con permiso: por la API local, con `prueba.ventas@local`, recorrer los puntos de revisión 1 a 4 y los casos 2 a 4 del Review Focus, con el conteo de `personas` antes y después.
- [ ] Producción, solo lectura: repetir los conteos del diseño (siguen en cero).
- [ ] Chequeo completo: `tsc`, `npm test`, `vite build`, `node --check` de los archivos tocados.
- [ ] Diseño en "implementado" y "Lo que queda abierto" al día. Commit y push.
- [ ] Lista para el usuario de lo que tiene que probar en pantalla, y recordatorio: el frontend se publica junto con el backend o enseguida después.
