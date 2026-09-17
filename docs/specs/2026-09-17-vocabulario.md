# Cada cosa se llama igual en todo el flujo

**Fecha:** 2026-09-17 · **Módulo:** interfaz de ventas

## Los invariantes

1. **Una acción conserva su nombre de punta a punta.** El botón que dice *Generar factura*
   produce el resultado *Factura generada*.
2. **Dos cosas distintas no se llaman igual**, aunque se parezcan.
3. **Una etiqueta hace un solo trabajo.** Nada de barras ni paréntesis explicativos.

## Qué pasó sin ellos

El bloque de paquetes del voucher acumulaba las tres fallas a la vez:

| Antes | Problema | Ahora |
|---|---|---|
| `Nombre del Plan / Paquete` | una etiqueta, dos trabajos | `Plan` |
| `Proveedor / Operador` | ídem | `Proveedor` |
| `Fecha Regreso Vuelo (Regreso)` | dice regreso dos veces | fila **Regreso** de la tabla de tramos |
| `Pasajeros (Resumen)` | jerga de sistema | `Viajeros` → *2 adultos, 1 niño* |
| `Lista de Pasajeros / Huéspedes` | el resto del sistema dice **Integrantes** | `Integrantes` |
| `Tipo de Paquete: Por Proveedor` | dato interno en un documento del cliente | *(eliminado)* |

Y "Ref. Hotel" estaba puesta como tercera celda de la fila de transporte, así que se leía
como un dato del vuelo.

## Dos casos donde unificar habría estado mal

**"Facturado".** En la tabla de ventas ya existe `isReviewed`, una marca **manual** que
pone el asesor. El estado de la factura de Siigo es otra cosa. Por eso el estado de Siigo
tiene **columna propia llamada Siigo**, y no se toca la palabra que ya estaba.

**"Booking" vs "Cód. Reserva".** En hotelería y paquetes el código lo entrega el hotel y se
llama **Booking**. En tiquetería lo entrega la aerolínea y siempre se llamó **Cód.
Reserva**. Unificarlos fue un error que hubo que revertir: el punto del vocabulario
compartido es que cada cosa se llame por su nombre, no que todo se llame igual.

## El vocabulario que quedó

| Concepto | Nombre | Dónde |
|---|---|---|
| Código del hotel por persona | **Booking** | hotelería, paquetes |
| Código de la aerolínea por persona | **Cód. Reserva** | tiquetería |
| Referencia de la reserva de hotel | **Ref. Hotel** | hotelería, paquetes |
| PNR del vuelo del paquete | **N° de Reserva** / **Localizador** si es terrestre | paquetes |
| Personas de un paquete | **Integrantes** | formulario, detalle, voucher |
| Personas de un hotel | **Huéspedes** | formulario, detalle, voucher |
| El tramo de vuelta | **Regreso**, nunca "Vuelta" | todo el sistema |
| Fechas de hotel | **Ingreso** / **Salida** | hotelería, paquetes |
| Bloque de importes | **Finanzas** | todos los formularios |

## Reglas de presentación que salieron de esto

- **El voucher no expone costos de proveedor.** Lo ve el cliente. Su proveedor no es el
  mayorista de la agencia sino el hotel y la aerolínea, que salen en sus bloques.
- **Una columna vacía en todas las filas no se dibuja.** En papel, una columna entera de
  guiones solo estorba.
- **Un bloque se muestra si hay dato, no según el tipo de registro.** Condicionar el bloque
  de hotel a `packageType !== 'supplier'` escondía un hotel que sí estaba cargado.
- **Un encabezado no se separa de lo que anuncia.** En el voucher hay dos reglas de viudas
  y huérfanos, una por nivel: el título de sección y los sub-encabezados viajan con su
  contenido al salto de página.
- **Una fila sin importe no es un pago** y no entra en la lista de pagos a proveedores.

## Lo que queda abierto

- El título **"Otros Servicios Reservados"** del voucher lleva un icono de avión (✈)
  encima de hoteles, seguros y tours. Es señalización equivocada; quedó sin cambiar por no
  mezclarlo con un arreglo de paginación.
- Quedan **once implementaciones duplicadas de toast** en siete páginas. Se dejaron a
  pedido explícito.
