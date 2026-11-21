import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { bundleTs } from './bundleTs.mjs';
import { cargarTs } from './cargarTs.mjs';

const { formatInstant } = await cargarTs('utils/formatters.ts');
const { VoucherPDF } = await bundleTs('components/sales/VoucherPDF.tsx');
const render = (sale) => renderToStaticMarkup(React.createElement(VoucherPDF, { sale, showPrice: false }));
const base = { id: 1, clientName: 'Cliente', total: 0, status: 'credito' };

// El selector de fecha y hora guarda un instante con -05:00. Las 19:00 de Colombia son las
// 00:00 UTC del dia siguiente, y formatDate/formatDateTime toman "T00:00:00" como "sin hora":
// un vuelo del 20/11 a las 7 p. m. salia como 21/11 sin hora.
test('formatInstant muestra el instante en hora de Colombia, aunque en UTC sea medianoche', () => {
  const s = formatInstant('2026-11-21T00:00:00.000Z');
  assert.match(s, /20\/11\/2026/);
  assert.match(s, /07:00/);
});

test('el vuelo de un paquete conserva fecha y hora de Colombia', () => {
  const html = render({ ...base, planData: [{ planName: 'P', flightDepartureDate: '2026-11-21T00:00:00.000Z' }] });
  // Solo la tabla de tramos: el encabezado y el pie imprimen la fecha de hoy, y el
  // 21/11/2026 la prueba fallaba por la fecha de impresion, no por el vuelo.
  const tramos = html.slice(html.indexOf('v-flight-table'), html.indexOf('</table>'));
  assert.ok(tramos.includes('20/11/2026'), 'fecha de Colombia');
  assert.ok(!tramos.includes('21/11/2026'), 'no el dia UTC');
});

test('la reserva de restaurante muestra la hora', () => {
  const html = render({ ...base, restaurantData: [{ reservationName: 'R', dateTime: '2026-11-21T01:30:00.000Z' }] });
  assert.match(html, /20\/11\/2026[^<]*08:30/);
});

// El tiquete devuelve como plan general el del primer tramo cuando el producto no tiene uno.
// Un tramo de otra aerolinea sin plan propio terminaba mostrando ese equipaje ajeno.
test('un tramo sin plan no toma el equipaje de otra aerolinea', () => {
  const html = render({
    ...base,
    ticketData: [{
      airline: 'AVIANCA',
      baggagePlan: 'AVIANCA - Flex',
      legs: [
        { origin: 'BOG', destination: 'MDE', airline: 'AVIANCA', baggagePlan: 'AVIANCA - Flex' },
        { origin: 'MDE', destination: 'CTG', airline: 'LATAM' },
      ],
    }],
  });
  assert.equal(html.split('AVIANCA - Flex').length - 1, 1, 'solo en el tramo de AVIANCA');
  assert.ok(html.includes('No especificado'));
});

test('un tramo de la misma aerolinea sin plan propio conserva el plan del tiquete', () => {
  const html = render({
    ...base,
    ticketData: [{ airline: 'AVIANCA', baggagePlan: 'AVIANCA - Flex', legs: [{ origin: 'BOG', destination: 'MDE' }] }],
  });
  assert.ok(html.includes('AVIANCA - Flex'));
});
