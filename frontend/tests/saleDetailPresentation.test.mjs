import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { bundleTs } from './bundleTs.mjs';

const { saleParticipants } = await bundleTs('utils/saleParticipants.ts');
const { saleSections, SaleSectionLabel } = await bundleTs('components/sales/saleSections.tsx');

test('el resumen conserva el documento del titular y de la SIM, sin inventar el del equipaje', () => {
  const result = saleParticipants({
    clientName: 'Prueba Regla', clientDocType: 'CC', clientDocNumber: 'DOC_TITULAR',
    simCardData: [{ passengerName: 'Sonia Simcard', docType: 'CC', docNumber: '9930000701' }],
    baggageData: [{ passengerName: 'Beto Bodega', reservationNumber: 'RESERVA', ticketNumber: 'TIQUETE' }],
  });
  assert.deepEqual(result.map(({ name, docType, docNumber }) => ({ name, docType, docNumber })), [
    { name: 'Prueba Regla', docType: 'CC', docNumber: 'DOC_TITULAR' },
    { name: 'Sonia Simcard', docType: 'CC', docNumber: '9930000701' },
    { name: 'Beto Bodega', docType: '', docNumber: '' },
  ]);
});

test('una respuesta anterior usa el documento del cliente cargado, sin usar licencia o tiquete', () => {
  const result = saleParticipants({ clientName: 'Prueba Regla' }, { docType: 'CC', docNumber: 'DOC_CLIENTE' });
  assert.equal(result[0].docNumber, 'DOC_CLIENTE');
});

test('las pestañas muestran nombres legibles e iconos para autos y terrestre', () => {
  for (const [category, label, icon] of [
    ['renta_vehiculos', 'Renta de Vehículos', 'lucide-car'],
    ['viajes_terrestres', 'Viajes Terrestres', 'lucide-bus'],
    ['checkin', 'Check-in', 'lucide-luggage'],
    ['simcard', 'SIM Card', 'lucide-smartphone'],
  ]) {
    const section = saleSections.find((s) => s.summaryType === category);
    const html = renderToStaticMarkup(React.createElement(SaleSectionLabel, { section }));
    assert.ok(html.includes(label));
    assert.ok(html.includes(icon));
  }
  for (const section of saleSections) {
    assert.ok(renderToStaticMarkup(React.createElement(SaleSectionLabel, { section })).includes('<svg'));
  }
});
