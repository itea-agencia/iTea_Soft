# La hora de Colombia

> Escrito el 2026-11-05, durante la revisión del plan de escalas. Rama `fix/hora-colombia`.

## El problema

La agencia opera en Colombia (UTC-5, sin horario de verano). El servidor corre en UTC (Render
y Docker), y la base guarda los `TIMESTAMP` en UTC. Lo que se **escribe** está bien: el
`DateTimePicker` de los formularios manda la hora con `-05:00`, y una fecha sola
(`YYYY-MM-DD`) queda a las 00:00 UTC.

Lo que fallaba es **calcular "el día"** con la hora del servidor o del navegador: a las 19:00
de Colombia, en UTC ya es mañana. Medido en producción el 2026-11-05:

| Dónde | Qué pasaba | Medido |
|---|---|---|
| `siigo.service.js`, fecha de la factura | `new Date().toISOString()`: después de las 19:00, la fecha de mañana | **25 de 42** facturas emitidas |
| `creditUtils.ts`, `getDaysUntilDue` | El 00:00 UTC del vencimiento, leído en hora local, caía el día anterior: un crédito que vence hoy daba `-1` (vencido) | Todos los créditos, todos los días |
| `stats.controller.js`, gráficas por año y mes | `EXTRACT(MONTH FROM creado_at)` en UTC: una venta del día 31 a las 20:00 contaba en el mes siguiente | 2 de 169 ventas |
| `commissions.controller.js`, fecha de liquidación | `getDate()` con la hora del servidor | 1 de 1 liquidación sin fecha del formulario |
| `sales.controller.js`, fecha del correo del voucher | `toLocaleDateString` sin zona | Correos enviados después de las 19:00 |

## La solución

**No depender de la zona de la máquina.** Cada sitio que calcula un día lo hace explícitamente
en `America/Bogota`:

- Backend: `utils/fechas.js` con `diaColombia(instante)`, que devuelve `YYYY-MM-DD`. En SQL,
  `creado_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota'`.
- Frontend: el vencimiento se compara como fecha contra el día de Colombia, y `formatDate` y
  `formatDateTime` muestran los instantes en hora de Colombia aunque el navegador esté en
  otra zona.

Se descartó poner `TZ=America/Bogota` en Render y en Docker: es una escritura en producción,
cambia el comportamiento de todo lo que hoy funciona sin aviso, y deja el código dependiendo
de una variable que un entorno nuevo puede no tener.

## Lo que queda abierto

1. **Las 25 facturas con la fecha de mañana ya están en Siigo.** Se crean en borrador y el
   timbrado es manual, así que la fecha pudo haberse corregido al timbrar, o no. Hay que
   revisarlas en Siigo; el código no las toca. Para listarlas (solo lectura):

   ```sql
   SELECT venta_id, numero, payload_enviado->>'date' AS fecha_enviada,
          (emitida_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date AS dia_colombia
   FROM facturas_siigo
   WHERE estado = 'emitida'
     AND (payload_enviado->>'date')::date
         <> (emitida_at AT TIME ZONE 'UTC' AT TIME ZONE 'America/Bogota')::date
   ORDER BY venta_id;
   ```

2. **No se auditaron los 34 `toLocale*` sueltos del frontend.** Usan la zona del navegador:
   están bien mientras quien los mire esté en Colombia.
3. **`todayStr()` del frontend** usa el día del navegador, con el mismo límite.
4. Una liquidación cuya hora de creación cayera justo a las 00:00:00.000 UTC se leería como
   fecha y no como instante. No es realista: `new Date()` tiene milisegundos.
