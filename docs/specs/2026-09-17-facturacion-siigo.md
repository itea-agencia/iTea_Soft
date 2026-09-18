# Facturación en Siigo: la interfaz no afirma lo que no puede saber

**Fecha:** 2026-09-17 · **Módulo:** integración con Siigo

## El invariante

Una factura **existe en Siigo solo si `facturas_siigo.estado = 'emitida'`**. Ningún otro
estado autoriza a decirle al usuario que ya se facturó.

## Tres cosas que se confunden y son distintas

| | Qué es | ¿Existe la factura en Siigo? |
|---|---|---|
| `SIIGO_DRY_RUN=true` | El backend arma el payload, lo guarda y **corta antes de llamar** | **No.** Ni borrador |
| Sin `stamp.send` | La factura **se crea** en Siigo y queda en `Draft` | Sí, como borrador |
| Timbrada | Se envió a la DIAN y tiene CUFE | Sí, y ya no se corrige: se anula con nota crédito |

Confundir las dos primeras es fácil y caro. El payload **nunca** manda `stamp.send`: es
deliberado, porque un borrador se corrige o se elimina desde Siigo, mientras que una
timbrada solo se anula con nota crédito. El timbrado es manual.

En producción, al 17 de septiembre de 2026: **17 facturas, todas `emitida`, todas `Draft`
y sin CUFE.**

## Qué pasó sin el invariante

El botón decía "Generar factura en Siigo" siempre. Al reabrir una venta no había forma de
saber si ya tenía factura: el único modo era volver a apretarlo y leer el mensaje, porque
el endpoint es idempotente. La causa era que el estado nunca salía del backend —
`facturas_siigo` solo se consultaba dentro del propio endpoint de facturación.

Al exponerlo, el riesgo inmediato fue guiarse por "existe la fila". No sirve: `pendiente`
cubre dos casos que **no** crean la factura —el dry-run y el intento que se registra antes
de llamar y muere a mitad— así que un botón así diría "factura generada" sobre facturas
inexistentes.

## Los estados que ve el usuario

| Estado | Control en el detalle | Columna del listado |
|---|---|---|
| sin fila | botón **Generar factura en Siigo** | `—` |
| `pendiente` | botón **Generar** + aviso de intentos que no crearon nada | `Sin emitir` |
| `fallida` | botón **Reintentar** + el error de Siigo | `Falló` |
| `emitida` + `Draft` | **Factura generada** · número · `Borrador` · *Verla en Siigo* | `FV-2-120` |
| `emitida` timbrada | **Factura generada** · número · *Verla en Siigo* | `FV-2-118` |

Con `emitida` el control **deja de ser un botón**. Un botón deshabilitado se lee como
"todavía no podés", no como "ya está hecho": lo que cambia no es la etiqueta sino la
naturaleza del control.

**La columna del listado no distingue borrador de timbrada.** Al principio mostraba
`FV-2-120 · Borrador` con fondo ámbar, replicando en el listado la misma distinción del
detalle. Se simplificó a mostrar solo el número, siempre en el mismo estilo: el listado
contesta "¿ya se facturó?", y si falta timbrar es una pregunta del detalle, no del listado.
El dato de `estampilla` sigue viajando en `siigoInvoice` y el detalle lo sigue mostrando.

## El guardarraíl: no emitir facturas reales desde un entorno de prueba

La sandbox y la cuenta real **comparten host**. Siigo no tiene una URL de pruebas aparte,
así que `SIIGO_BASE_URL` es idéntico y lo único que separa un entorno del otro son las
**credenciales**. Con las de producción cargadas y el dry run apagado, un local emite
facturas reales en la cuenta de Samtur, y eso no se revierte.

**La señal es la base de datos, no `NODE_ENV`.** `.env.production` trae
`NODE_ENV=development`, así que copiarlo se lo lleva puesto. Mirar la base además codifica
el invariante que importa: no emitir facturas reales a partir de datos de prueba.

Si el host de la base es `localhost`, `127.0.0.1`, `::1` o `postgres` y `SIIGO_DRY_RUN`
está en `false`, el backend responde **409 `SIIGO_EMISION_BLOQUEADA`**. Se levanta a
propósito con `SIIGO_ALLOW_LOCAL_EMISION=true`.

El bloqueo está en el **controlador**, antes de tocar Siigo, no solo en el servicio:
`getOrCreateCustomer` corre primero y, con el dry run apagado, **crea el tercero** en Siigo
si no existe. Un bloqueo que actuara al emitir ya habría escrito en la cuenta real.

## Reglas del catálogo

- **IT** = Ingresos de Terceros, lo que se le paga al proveedor. Sin impuestos, y **lleva
  Tercero obligatorio**: sin él la factura queda mal imputada y se corta antes de emitir.
- **IP** = Ingresos Propios, la tarifa administrativa. IVA 19%, y `price` es la base
  gravable (`monto / 1.19`).
- El NIT va **sin dígito de verificación**: `890100577`, no `890100577-6`. Con el DV,
  Siigo responde `The customer doesn't exist` aunque el tercero exista.
- Los nombres de producto se envían **tal como están en Siigo**. El nombre lo define
  contabilidad; la app no le agrega nada.
- Tiquetería es la única categoría con variante nacional/internacional.
- Un paquete pagado a varios proveedores emite **una línea IT por pago**, con el código de
  su concepto. Al mezclar categorías el `cost_center` pasa al comodín *Varios Servicios*,
  porque en Siigo es uno por factura.

## Cómo verificarlo

```sql
SELECT estado, count(*), count(numero) AS con_numero,
       count(*) FILTER (WHERE respuesta->'stamp'->>'status' = 'Draft') AS en_borrador
FROM facturas_siigo GROUP BY estado;
```

## Lo que queda abierto

- **`render.yaml` declara `SIIGO_DRY_RUN: "true"` y el valor real es `false`**, porque
  manda el dashboard de Render. Queda anotado en el archivo, pero sigue siendo una trampa.
- **El dry run no evita del todo llamar a Siigo:** `getOrCreateCustomer` consulta la API en
  modo `soloBuscar` para resolver el tercero. Lo que garantiza es que no se *crea* la
  factura.
- **Las credenciales de sandbox en local no autentican** — la facturación local falla con
  "No se pudo obtener el token". Hoy no se puede probar el flujo real ni contra la sandbox.
- **El transporte de un paquete no tiene tramos**, así que no se puede saber si el vuelo es
  nacional o internacional y se asume nacional, con advertencia. Un paquete internacional
  se factura con el código de nacional.
