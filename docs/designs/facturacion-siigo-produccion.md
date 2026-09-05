# Facturación electrónica Siigo — camino a producción

## Problema

El módulo de facturación existe y funciona contra la sandbox de Siigo, pero no puede emitir
una factura válida en producción. Tres razones independientes:

1. **Estaba apuntando a la sandbox.** `backend/.env` tiene
   `SIIGO_USERNAME=sandbox@siigoapi.com`, la sandbox pública y compartida de Siigo. Los
   clientes que iTea "sincroniza" hoy se están creando allí, no en la cuenta real de
   Samtur. Las credenciales reales sí existen, en `backend/.env.production`
   (`info@samturtravel.com`), y están validadas.

2. **Todos los identificadores están hardcodeados con valores de sandbox** y ninguno existe
   en la cuenta real.

3. **La factura se emite como una sola línea genérica sin impuestos**, lo cual es
   fiscalmente incorrecto para esta empresa: el catálogo real de Siigo ya tiene tratamiento
   de IVA distinto por tipo de servicio.

A esto se suma que no se persiste nada del resultado, así que no hay trazabilidad ni
idempotencia, y emitir factura electrónica no se revierte: anular exige nota crédito.

## Estado verificado de la cuenta real

Autenticación contra `info@samturtravel.com`: OK, `expires_in` 86400.

### Identificadores

| Constante | Sandbox (código actual) | Producción (real) |
|---|---|---|
| `document.id` | `2372` | `30685` — "Factura electrónica de venta", `automatic_number=true`, `ElectronicInvoice` |
| `seller` | `916` (`sandbox@siigoapi.com`) | `831` (`info@samturtravel.com`) |
| `payments[].id` | `8147` | `3799` (Efectivo) |
| `items[].code` | `SRV-002` | no existe; ver catálogo |

El otro tipo de documento de la cuenta, `16490` ("Factura"), es `NoElectronic`: no sirve
para factura electrónica.

### Formas de pago de la cuenta real

`3799` Efectivo · `3800` Crédito · `3801` Tarjeta Débito · `3802` Tarjeta Crédito ·
`12464` Cheque · `12465` Transferencia · `12466` Consignación · `12467` Otros ·
`9316` Clientes Nacionales · `9317` Clientes Extranjero

### Catálogo de servicios

Verificado contra la API el **2026-09-04**. Contabilidad amplió el catálogo: hay 55 productos,
34 de ellos creados después del análisis inicial.

El prefijo no es decorativo: **IP = Ingresos Propios** (lo que gana la agencia) e
**IT = Ingresos de Terceros** (lo que se le paga al proveedor). Esa distinción define qué
línea lleva Tercero y qué línea no. Los IT van sin impuestos; los IP con IVA 19%.

**Catálogo nuevo (`016`–`049`): un par IT/IP por cada categoría de iTea.** Cubre las 17
categorías, una a una.

```
016 IT / 017 IP   Hotelería
018 IT / 019 IP   Restaurantes
020 IT / 021 IP   Tours
022 IT / 023 IP   Paquetes
024 IT / 025 IP   Viajes Terrestres
026 IT / 027 IP   Centros de Convención
028 IT / 029 IP   Equipajes
030 IT / 031 IP   Tiquetería
032 IT / 033 IP   Seguros de Viaje
034 IT / 035 IP   Servicios de Mascotas
036 IT / 037 IP   Pasaporte
038 IT / 039 IP   Visa
040 IT / 041 IP   Documentación Migratoria
042 IT / 043 IP   CHECK-IN
044 IT / 045 IP   SIM Card
046 IT / 047 IP   Renta de Vehículos
048 IT / 049 IP   Renta de Fincas
```

**Catálogo anterior (`001`–`015`): sigue activo y es el que se usa hoy.** Distingue nacional
de internacional, distinción que el catálogo nuevo abandona.

```
001 IP TAN-Tarifa Administrativa      002 IP TAI Tarifa Administrativa
003 IP Transporte Terrestre           010 IT Transporte Terrestre
004 Servicios Administrativos Especializados   (la TA SAE; sin par IT)
005 IT Tiquetes Aéreos Nacionales     006 IT Tiquetes Internacionales
007/008/009 IP Paquete Regional/Nacional/Internacional
011/012/013 IT Paquete Regional/Nacional/Internacional
014 Prestación Comercial Comisión por Ventas   015 Comisiones Agencias y Operadores
```

**Dados de baja el 2026-09-04:** `S100`, `TA`, `TKTS` y `CRE` están **INACTIVOS**. `CRE` era
el `SIIGO_ITEM_CODE_DEFAULT` que la Fase 1 dejó configurado; se retiró y el servicio ahora
falla con `SIIGO_ITEM_CODE_MISSING` en vez de enviar un código muerto.

### Centros de costo

27 en total, 18 creados junto al catálogo nuevo.

```
10668  S109-1  IP Hotelería              10688  S119-1  IP Pasaporte
10670  S110-1  IP Restaurantes           10690  S120-1  IP Visa
10672  S111-1  IP Tour                   10692  S121-1  IP Documentación Migratoria
10674  S112-1  IP Paquetes               10694  S122-1  IP CHECK-IN
10676  S113-1  IP Viajes Terrestres      10696  S123-1  IP SIM Card
10678  S114-1  IP Centros de Convención  10698  S124-1  IP Renta de Vehículos
10680  S115-1  IP Equipaje               10700  S125-1  IP Renta de Fincas
10682  S116-1  IP Tiquetería             10702  S126-1  Varios Servicios
10684  S117-1  IP Seguros de Viaje
10686  S118-1  IP Servicios de Mascota
```

Anteriores, todos activos: `445` S100-1 Tiquetes Aéreos Nacionales · `453` S101-1 Tiquetes
Internacionales · `455` S102-1 Transporte Terrestre · `457` S103-1 Servicios Administrativos
Especializados · `459` S104-1 Paquete Regional · `463` S106-1 Paquete Internacional ·
`465` S107-1 Comisión Operadores · `475` S108-1 Comisiones Agencias y Operadores ·
`477` S300-1 Administrativo.

`10702 Varios Servicios` resuelve el caso de una venta con servicios de distinta naturaleza:
el `cost_center` es único por factura, y ese es el comodín.

### Decisión: se adopta el catálogo nuevo

Tomada el 2026-09-04. El catálogo nuevo calza 1:1 con las 17 categorías de iTea y trae su
centro de costo por categoría, así que el mapeo queda determinado sin excepciones ni casos
sueltos. Los códigos viejos (`001`–`015`) siguen activos en Siigo pero iTea no los usa.

Consecuencia: la distinción nacional / internacional deja de hacer falta. El catálogo nuevo
no la modela, así que no hay que derivarla de `Aerolineas.tipo` ni de los aeropuertos.

### El catálogo nuevo existe pero todavía no se usa desde Siigo

Las facturas emitidas hasta el 2026-09-04 (FV-2-94 a FV-2-103) siguen usando `005` + `001`
con `cost_center` 445. Ninguna usa los códigos `016`–`049` ni los centros nuevos.

Es decir: el catálogo nuevo está construido y calza 1:1 con iTea, pero contabilidad no ha
migrado. **Cuál de los dos usar es la decisión que define todo el mapeo de la Fase 2.**

### Mapeo implementado

Vive en `backend/src/config/siigo-catalog.js`, en un solo módulo para que contabilidad pueda
revisarlo sin leer el resto del código.

| categoría iTea | costo proveedor (IT) | TA (IP) | centro de costo |
|---|---|---|---|
| `tiqueteria` | `030` | `031` | 10682 |
| `hoteleria` | `016` | `017` | 10668 |
| `seguros_viaje` | `032` | `033` | 10684 |
| `planes` | `022` | `023` | 10674 |
| `checkin` | `042` | `043` | 10694 |
| `documentacion_migratoria` | `040` | `041` | 10692 |
| `simcard` | `044` | `045` | 10696 |
| `equipaje` | `028` | `029` | 10680 |
| `renta_vehiculos` | `046` | `047` | 10698 |
| `renta_fincas` | `048` | `049` | 10700 |
| `tours` | `020` | `021` | 10672 |
| `centros_convencion` | `026` | `027` | 10678 |
| `restaurantes` | `018` | `019` | 10670 |
| `visa` | `038` | `039` | 10690 |
| `pasaporte` | `036` | `037` | 10688 |
| `servicio_mascotas` | `034` | `035` | 10686 |
| `viajes_terrestres` | `024` | `025` | 10676 |
| *venta con varias categorías* | — | — | 10702 |

La TA SAE (`detalle_venta.ta_cre`) sigue en `004`, que no tiene equivalente en el catálogo
nuevo.

## Especificación derivada de una factura real

`GET /v1/invoices/f4540750-757d-49d0-8f91-ef85488d48b4` (FV-2-91, emitida el 2026-08-24 por
$576.700) es la plantilla exacta a replicar:

```json
{
  "document": { "id": 30685 },
  "date": "2026-08-24",
  "customer": { "identification": "1003914103", "branch_office": 0 },
  "cost_center": 445,
  "seller": 831,
  "observations": "RUTA MEDELLIN - QUIBDO AEROLINEA CLIC AIR \nRESPONSABLE DENIO JIMENEZ",
  "items": [
    { "code": "005", "quantity": 1, "price": 364700,
      "description": "IT Tiquetes Aéreos Nacionales",
      "customer": { "identification": "900383393", "branch_office": 0 } },
    { "code": "004", "quantity": 1, "price": 133613.445378,
      "description": "Servicios Administrativos Especializados",
      "taxes": [ { "id": 8872 } ] },
    { "code": "001", "quantity": 1, "price": 44537.815126,
      "description": "IP TAN-Tarifa Administrativa",
      "taxes": [ { "id": 8872 } ] }
  ],
  "payments": [ { "id": 12465, "value": 576700 } ]
}
```

Lo que esa factura resuelve:

**1. Los montos de iTea incluyen IVA; `price` va como base.** Siigo recibe la base y calcula
el impuesto y el total:

| línea | `price` (base) | IVA calculado | `total` |
|---|---|---|---|
| `004` | 133 613,445378 | 25 386,55 | 159 000 |
| `001` | 44 537,815126 | 8 462,18 | 53 000 |
| `005` | 364 700 | — | 364 700 |

`159000 / 1.19 = 133613,4453781…`. Para líneas gravadas, `price = monto / 1.19` con 6
decimales. Para líneas sin impuesto, `price = monto`.

**2. Una venta produce hasta tres líneas por cada `DetalleVenta`:**

| línea | campo de iTea | código Siigo | Tercero | IVA |
|---|---|---|---|---|
| costo del proveedor | `detalle_venta.costo_proveedor` | código **IT** de la categoría | sí, NIT del proveedor | según el producto |
| tarifa administrativa | `detalle_venta.ta` | código **IP** de la categoría | no | 19% |
| TA SAE | `detalle_venta.ta_cre` | `004` | no | 19% |

`ta_cre` corresponde a "Servicios Administrativos Especializados" (`004`): el commit
`70624f5` renombró ese campo de "TA CRE" a "TA SAE", y SAE son las siglas del producto.

El total cuadra con la fórmula que ya usa `sales.controller.js` para el `subtotal`:
`costo_proveedor + ta + ta_cre`. En FV-2-91: `364700 + 159000 + 53000 = 576700`.

**3. El `cost_center` va a nivel documento** y depende del tipo de servicio (445 para tiquetes
nacionales en el ejemplo). Una venta con servicios de distinta naturaleza no puede expresar
dos centros de costo en una sola factura: hay que decidir cuál manda.

**4. Se crean como borrador, y así se queda.** Decisión del 2026-09-05: iTea nunca envía
`stamp.send`, así que la factura llega a Siigo en estado `Draft` y el timbrado ante la DIAN
sigue siendo manual, como lo hace hoy el equipo. Un borrador se corrige o se elimina desde
Siigo; una factura timbrada solo se anula con nota crédito.

**Observación original:** FV-2-91 y FV-2-90 tienen `stamp.status: "Draft"` y
`mail.status: "not_sent"`; la FV-2-89 está `Accepted`. Es decir, el timbrado ante la DIAN es
un paso posterior y hoy manual. **Si iTea no envía `stamp.send`, la factura queda en borrador
y es corregible o eliminable desde Siigo.** Eso reduce drásticamente el riesgo de la puesta
en producción: no hace falta acertar a la primera.

**5. El pago real es Transferencia (`12465`), no Efectivo.** Confirma que hay que leer
`metodoPagoPrincipalId` de la venta.

**6. `observations` lleva texto libre** con ruta, aerolínea y responsable. iTea tiene
`ventas.observaciones` y la relación `Responsables`, así que se puede reproducir.

## Objetivo

Emitir en la cuenta real de Samtur una factura electrónica de venta en estado borrador por el
**total de la venta**, desglosada en líneas de costo de proveedor, tarifa administrativa y TA
SAE para que el IVA se calcule según el catálogo, con el resultado persistido y sin
posibilidad de emitir dos veces la misma venta. El timbrado ante la DIAN sigue siendo manual,
como lo es hoy.

Verificable: facturar una venta con tiquetería y tarifa administrativa produce una factura
en Siigo cuyo total coincide con `ventas.monto_total`, con las líneas y el IVA que
contabilidad valide, y un segundo clic en "Generar factura" devuelve la misma factura en
lugar de crear otra.

## Fuera de alcance

- **No** se implementan notas crédito. Cuando haya que anular, se hace desde Siigo. Si más
  adelante se automatiza, va en tabla aparte.
- **No** se factura automáticamente al crear la venta. La emisión sigue siendo una acción
  explícita del usuario.
- **No** se toca el cálculo de `monto_total`, `ta_total` ni comisiones.
- **No** se modela IVA dentro de iTea. El IVA lo calcula Siigo desde el catálogo. iTea no
  tiene ni tendrá campos de impuesto en este alcance.
- **No** se unifica la duplicación entre `sales.controller.js` y `products.controller.js`.

## Diseño

### Persistencia

Tabla nueva, relación 1:1 opcional con `Ventas`. Una fila por venta; los reintentos
actualizan la misma fila.

```prisma
model FacturasSiigo {
  id             String             @id @default(uuid())
  ventaId        Int                @unique @map("venta_id")
  siigoId        String?            @map("siigo_id")
  numero         String?
  cufe           String?
  publicUrl      String?            @map("public_url")
  montoFacturado Float?             @map("monto_facturado")
  estado         EstadoFacturaSiigo @default(pendiente)
  intentos       Int                @default(0)
  ultimoError    String?            @map("ultimo_error")
  payloadEnviado Json?              @map("payload_enviado")
  respuesta      Json?              @map("respuesta")
  emitidaAt      DateTime?          @map("emitida_at")
  creadoAt       DateTime           @default(now()) @map("creado_at")
  updatedAt      DateTime?          @updatedAt @map("updated_at")
  venta          Ventas             @relation(fields: [ventaId], references: [id])

  @@index([estado])
  @@map("facturas_siigo")
}

enum EstadoFacturaSiigo {
  pendiente
  emitida
  fallida
  anulada
}
```

`payloadEnviado` y `respuesta` como `Json` son deliberados: cuando la DIAN rechace algo, es
la única forma de saber qué se envió sin reproducir el escenario.

Aparte, columna en `Personas`: `siigoCustomerId String? @map("siigo_customer_id")`. Es 1:1
y siempre exactamente uno, así que no merece tabla. Evita el
`GET /v1/customers?identification=` en cada emisión.

Los dos cambios son aditivos, así que `db push --accept-data-loss` no borra nada.

### Idempotencia

Antes de llamar a Siigo: si existe fila con `estado = 'emitida'`, devolver esa factura y no
emitir. Sin esto, un doble clic emite dos facturas electrónicas y ambas quedan reportadas.

### Modo dry-run

Variable `SIIGO_DRY_RUN`. Cuando está activa, el servicio construye el payload completo, lo
guarda en `payloadEnviado`, lo devuelve al cliente y **no hace el POST**. Permite validar
todo el mapeo contra ventas reales sin emitir una sola factura. Es la red de seguridad
principal de este plan, porque la emisión no es reversible.

### Líneas de la factura

Una línea por `DetalleVenta`, con `code` resuelto desde `categoria` y `price` desde el
subtotal del detalle. La suma de las líneas debe cuadrar con `ventas.monto_total`, y
`payments[].value` debe cuadrar con el total de la factura o Siigo la rechaza.

El mapa `categoria → code` arranca por las 4 categorías en uso, con respaldo configurable
para las demás. Los códigos concretos los define contabilidad; el borrador a validar es:

| categoría iTea | código Siigo propuesto | a confirmar |
|---|---|---|
| `tiqueteria` | `TKTS` (IVA 0%) o `005`/`006` según nacional o internacional | sí |
| `viajes_terrestres` | `010` o `003` (sin impuestos) | sí |
| `planes` | `011`/`012`/`013` según alcance | sí |
| `seguros_viaje` | `CRE` | sí |
| resto | `CRE` OTROS SERVICIOS | sí |

Nada de esto se implementa hasta que contabilidad confirme el mapa.

### Formas de pago

Mapa `MetodosPago.id → payment type de Siigo`. Los 12 métodos de iTea contra los de la
cuenta real:

| iTea | Siigo |
|---|---|
| Efectivo | `3799` |
| Transferencia | `12465` |
| Tarjeta de Crédito | `3802` |
| Tarjeta Débito, Tarjeta de Débito | `3801` |
| Consignación | `12466` |
| Credito | `3800` |
| Cheque | `12464` |
| PSE, Llaves, Tarjeta Davivienda, CTA CTE 2060, Tarjeta de Bancolombia | `12467` Otros |

Sin mapeo explícito, cae en `12467`. Hoy el código manda Efectivo siempre e ignora
`metodoPagoPrincipalId`.

### Identificación del cliente

`id_type` y `person_type` salen de `TiposDocumento`, no fijos. Hoy todo va como cédula
(`13`) y `Person`, así que cualquier cliente con NIT se crea mal. Las
`fiscal_responsibilities` dependen de lo mismo.

La dirección y la ciudad hoy son literales genéricos (`'Direccion generica'`, Bogotá
`11001`). `Personas` no tiene campos de dirección ni ciudad; hay que agregarlos.

## Decisiones y alternativas

| Decisión | Elegimos | Descartamos | Por qué |
|---|---|---|---|
| Persistencia | Tabla `FacturasSiigo` 1:1 | Columnas en `Ventas` | Son ~10 campos que solo aplican a ventas facturadas, más estado e intentos |
| Cardinalidad | `ventaId @unique` | 1:N con historial de intentos | Los reintentos actualizan la fila; la idempotencia sale gratis. Notas crédito irán en tabla propia |
| Líneas de factura | Una por `DetalleVenta` | Una línea genérica por el total | El IVA depende del tipo de servicio; una línea genérica factura mal |
| IVA | Lo calcula Siigo desde el catálogo | Modelarlo en iTea | iTea no tiene campos de impuesto y no necesita tenerlos |
| Numeración | `automatic_number` de Siigo | `number` aleatorio | La numeración de factura electrónica es consecutiva y la controla la DIAN |
| Identificadores | Variables de entorno | Hardcode | Los valores difieren entre sandbox y producción |
| Validación previa | `SIIGO_DRY_RUN` | Probar emitiendo | La emisión no es reversible |
| `siigoCustomerId` | Columna en `Personas` | Tabla aparte | 1:1, siempre uno |

## Riesgos y desconocidos

**Emitir no se revierte.** Anular una factura electrónica exige nota crédito. De ahí el
dry-run y la idempotencia; ninguno es opcional.

**Los clientes de sandbox no existen en producción.** Todo lo que iTea "sincronizó" hasta
hoy vive en la sandbox compartida. Al cambiar credenciales hay que re-sincronizar clientes
contra la cuenta real. Conviene confirmar en el Siigo real cuántos clientes creados desde
iTea aparecen: la respuesta esperada es cero.

**Interceptor global de axios.** `siigo.service.js:5` registra el retry de 429 sobre la
instancia global de axios, así que afecta toda llamada HTTP del backend, no solo las de
Siigo. Se arregla con `axios.create()`.

**`findOrCreatePersona` duplica personas** cuando hay nombre sin documento. Personas
duplicadas producen clientes duplicados en Siigo. Está fuera de alcance pero se agrava al
activar la facturación.

**Sincronización de clientes fire-and-forget.** `clients.controller.js:221` y `:291` solo
hacen `console.error` si Siigo falla. Con `siigoCustomerId` se pueden detectar los
pendientes y reintentar.

**`/api/v1/siigo/*` sin autorización.** Cuatro endpoints que proxean Siigo, protegidos solo
por `auth`. Contra la sandbox exponían datos de otras empresas; contra producción exponen
el catálogo y los usuarios de Samtur a cualquier usuario autenticado.

**¿`monto_total` incluye IVA?** iTea no modela impuestos. Si el total ya viene con IVA
incluido y las líneas se envían con productos que llevan IVA 19%, Siigo lo sumaría otra vez
y la factura quedaría inflada. Es la pregunta abierta más importante y la debe responder
contabilidad antes de la Fase 2.

**¿Qué vendedor?** Hoy `seller` sería `831` fijo. La cuenta tiene 3 usuarios activos. Si
contabilidad quiere el vendedor real por venta, hay que mapear `Usuarios` de iTea a usuarios
de Siigo, y hoy no existe ese vínculo.

## Plan de implementación

### Fase 0 — Descubrimiento. Hecha.

Credenciales de producción validadas, identificadores reales obtenidos, catálogo y formas de
pago inventariados, categorías en uso contadas. Todo con llamadas de solo lectura.

### Fase 1 — Infraestructura, sin riesgo fiscal

No emite ninguna factura. Todo verificable con `SIIGO_DRY_RUN` activo.

1. Instancia dedicada `axios.create()` en `siigo.service.js`; mover el interceptor de 429
   ahí. *Verificación:* una llamada axios ajena a Siigo que devuelva 429 no reintenta.
2. Sacar identificadores a entorno: `SIIGO_BASE_URL`, `SIIGO_DOCUMENT_ID=30685`,
   `SIIGO_SELLER_ID=831`, `SIIGO_ITEM_CODE_DEFAULT=CRE`, `SIIGO_PAYMENT_TYPE_DEFAULT=12467`,
   `SIIGO_DRY_RUN`. Registrar en `env.js`, `.env.development`, `.env.production`,
   `.env.example` y `render.yaml` con `sync: false`.
3. Tabla `FacturasSiigo`, enum `EstadoFacturaSiigo`, columna `Personas.siigoCustomerId`.
   `db push`. *Verificación:* `\d facturas_siigo` en psql.
4. Guard de idempotencia por `estado = 'emitida'`.
5. Quitar el `number` aleatorio; el documento `30685` ya es `automatic_number`.
6. `montoFacturar = ventaData.montoTotal`. Eliminar `taTotalNeta`, que no existe en el
   modelo `Ventas` — hoy siempre cae al `montoTotal` por accidente.
7. Registrar cada intento en la tabla: `intentos`, `ultimoError`, `payloadEnviado`,
   `respuesta`.

*Verificación de fase:* con `SIIGO_DRY_RUN=true`, `POST /sales/:id/invoice` devuelve el
payload completo, lo persiste y no llama a Siigo.

### Fase 2 — Mapeo de catálogo. Hecha el 2026-09-04.

8. Columna `nit` en `Proveedores` (hoy solo tiene `nombre`), y cargar los NITs. Bloquea la
   línea de costo de proveedor.
9. Mapa `categoria → { codigoIT, codigoIP, costCenter }`, con variante nacional e
   internacional donde aplique.
10. Construcción de las líneas: hasta tres por `DetalleVenta` (costo de proveedor con Tercero,
    `ta` con código IP, `ta_cre` con `004`), omitiendo las de monto cero.
11. `price = monto / 1.19` con 6 decimales para líneas gravadas, `price = monto` para las
    exentas. `taxes: [{ id: 8872 }]` explícito en las gravadas.
12. `cost_center` a nivel documento, resuelto desde la categoría dominante de la venta.
13. Mapa `MetodosPago → payment type`, leyendo `metodoPagoPrincipalId`.
14. Mapa `TiposDocumento → id_type` / `person_type` / `fiscal_responsibilities`.
15. `observations` desde `ventas.observaciones` más el nombre del responsable.
16. Validación de cuadre antes de llamar a Siigo: suma de líneas contra `monto_total`, y
    `payments` contra el total.

*Verificación de fase:* dry-run sobre las ventas reales existentes; contabilidad revisa los
payloads generados y aprueba el IVA resultante.

### Fase 3 — Emisión controlada

17. Campos de dirección y ciudad en `Personas`, y usarlos en `getOrCreateCustomer` en vez de
    los literales genéricos.
18. Re-sincronizar clientes contra la cuenta real, guardando `siigoCustomerId`. Los ids de
    sandbox no aplican.
19. Apagar `SIIGO_DRY_RUN` y emitir **una** factura sin `stamp.send`, de modo que quede en
    `Draft` igual que las que hoy crea el equipo a mano. Compararla campo por campo contra
    FV-2-91. Un borrador se corrige o se elimina desde Siigo, así que no hace falta acertar a
    la primera. El timbrado ante la DIAN sigue siendo manual y fuera de alcance.
20. Habilitar la emisión para el resto de las ventas.

### Fase 4 — Operación

21. Cerrar `/api/v1/siigo/*` tras `authorize('config', 'view')`, o eliminarlo. Fue para
    descubrir identificadores; ese trabajo ya está hecho.
22. Reintento manual desde la UI leyendo `estado`.
23. Aviso al equipo cuando una factura queda en `fallida`.

## Dirección y ciudad del cliente

Siigo exige dirección y ciudad al crear el tercero, y la ciudad va con **códigos DANE**:

```json
"address": { "address": "Calle 10 # 43-25", "city": { "country_code": "Co", "state_code": "05", "city_code": "05001" } }
```

Siigo no expone catálogo geográfico —`/v1/cities`, `/v1/states` y `/v1/countries` devuelven
404—, así que los códigos los aporta iTea desde `backend/src/config/ciudades-dane.js`: 61
municipios, las 32 capitales de departamento más los de mayor población. El código de 5
dígitos lleva el departamento en los dos primeros, así que `state_code` se deriva y basta
con guardar uno solo.

`Personas` gana dos columnas, **ambas opcionales**: `direccion` y `ciudad_codigo_dane`. El
formulario de clientes las pide sin marcarlas obligatorias. Cuando faltan, el tercero se crea
con `"No registrada"` y Bogotá `11001`, que es lo que se venía enviando para todos los
clientes.

La API las expone como `address` y `cityCode`, más un `cityName` derivado del catálogo y de
solo lectura. Un `cityCode` que no esté en el catálogo se rechaza con 400
`INVALID_CITY_CODE`: Siigo rechaza códigos DANE inválidos con un mensaje que no dice cuál fue
el problema.

## Preguntas abiertas para contabilidad

1. **NIT de los proveedores.** El campo existe (`proveedores.documento`, obligatorio en altas
   y ediciones) pero está vacío en los proveedores cargados. En Configuración → Proveedores
   salen marcados con "Falta documento". Sin NIT, la línea de costo del proveedor se emite
   sin Tercero y el sistema deja una advertencia en la respuesta; no bloquea, pero
   contablemente queda incompleta.

2. **PPT sin verificar.** `siigo-catalog.js` mapea PPT al código DIAN `48`. No hay ningún
   tercero con ese tipo en la cuenta de Siigo, así que el valor está sin confirmar. Los demás
   (CC → 13, NIT → 31) sí están verificados contra terceros reales.

3. **Cuándo apagar `SIIGO_DRY_RUN`.** El mapeo está listo y reproduce exactamente los
   importes de FV-2-91. Falta que contabilidad revise los payloads generados sobre ventas
   reales antes de emitir la primera factura.

Resueltas:

- Catálogo a usar → el nuevo (`016`–`049`).
- `seguros_viaje` → `032`/`033`, centro 10684.
- Venta con servicios de distinta naturaleza → centro `10702` Varios Servicios.
- Paquete Turístico Nacional sin centro de costo → `10674` IP Paquetes.
- Nacional contra internacional → el catálogo nuevo no lo distingue.
- `SIIGO_ITEM_CODE_DEFAULT` → ya no se usa; el código sale de la categoría.
- `fiscal_responsibilities` → `R-99-PN` para personas y empresas por igual, confirmado
  contra los 60 terceros consultados.
