import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { bundleTs } from './bundleTs.mjs';

const { VoucherPDF } = await bundleTs('components/sales/VoucherPDF.tsx');
const baseSale = { id: 999, clientName: 'Cliente de prueba', total: 187000, status: 'credito' };
const render = (sale, showPrice = true) => renderToStaticMarkup(React.createElement(VoucherPDF, { sale, showPrice }));
const person = { name: 'PERSONA_UNICA', docType: 'CC', docNumber: 'DOC_UNICO', nroReserva: 'BOOKING_UNICO', nroTiquete: 'TIQUETE_UNICO', asiento: 'ASIENTO_UNICO' };
// Campos literales visibles del bloque independiente: el resumen anterior perdía varios.
const cases = [
  ['ticketData', { reservationNumber: 'PNR_UNICO', passengers: [person], legs: [{ origin: 'BOG', destination: 'MDE', flightNumber: 'VUELO_UNICO', time: '10:30' }] }, ['PNR_UNICO', 'VUELO_UNICO', 'PERSONA_UNICA', 'DOC_UNICO', 'TIQUETE_UNICO', 'ASIENTO_UNICO']],
  ['hotelData', { hotelName: 'HOTEL_UNICO', reservationNumber: 'REF_UNICA', guests: [person] }, ['HOTEL_UNICO', 'REF_UNICA', 'PERSONA_UNICA', 'BOOKING_UNICO']],
  ['insuranceData', { insuranceType: 'SEGURO_UNICO', phone: 'TEL_UNICO', members: [person] }, ['SEGURO_UNICO', 'TEL_UNICO', 'PERSONA_UNICA']],
  ['checkInData', { passengerName: 'CHECKIN_UNICO', docType: 'CC', docNumber: 'DOC_UNICO', flightOrReservation: 'RESERVA_UNICA', seat: 'SILLA_UNICA' }, ['CHECKIN_UNICO', 'DOC_UNICO', 'RESERVA_UNICA', 'SILLA_UNICA']],
  ['migrationData', { passengerName: 'MIGRACION_UNICA', requestedDocType: 'TRAMITE_UNICO', docNumber: 'DOC_UNICO' }, ['MIGRACION_UNICA', 'TRAMITE_UNICO', 'DOC_UNICO']],
  ['simCardData', { passengerName: 'SIM_UNICA', dataPlan: 'DATOS_UNICOS', deliveryEmail: 'entrega@example.test' }, ['SIM_UNICA', 'DATOS_UNICOS', 'entrega@example.test']],
  ['baggageData', { passengerName: 'EQUIPAJE_UNICO', carryOn: 'MANO_UNICA', checkedBag: 'BODEGA_UNICA' }, ['EQUIPAJE_UNICO', 'MANO_UNICA', 'BODEGA_UNICA']],
  ['landTravelData', { transportCompany: 'OPERADOR_UNICO', ticketLocator: 'LOCALIZADOR_UNICO', passengers: [person] }, ['OPERADOR_UNICO', 'LOCALIZADOR_UNICO', 'PERSONA_UNICA', 'ASIENTO_UNICO']],
  ['carRentalData', { mainDriver: 'CONDUCTOR_UNICO', licenseNumber: 'LICENCIA_UNICA', pickupLocation: 'RECOGIDA_UNICA' }, ['CONDUCTOR_UNICO', 'LICENCIA_UNICA', 'RECOGIDA_UNICA']],
  ['fincaData', { responsibleName: 'FINCA_UNICA', docNumber: 'DOC_UNICO', hasPets: true, petType: 'MASCOTA_UNICA' }, ['FINCA_UNICA', 'DOC_UNICO', 'MASCOTA_UNICA']],
  ['tourData', { pickupPoint: 'PUNTO_UNICO', guideLanguage: 'IDIOMA_UNICO', guests: [person], observations: 'TOUR_UNICO' }, ['PUNTO_UNICO', 'IDIOMA_UNICO', 'PERSONA_UNICA', 'DOC_UNICO', 'TOUR_UNICO']],
  ['conventionData', { organization: 'EMPRESA_UNICA', contactName: 'CONTACTO_UNICO', requiredSpace: 'ESPACIO_UNICO' }, ['EMPRESA_UNICA', 'CONTACTO_UNICO', 'ESPACIO_UNICO']],
  ['restaurantData', { reservationName: 'RESTAURANTE_UNICO', menuType: 'MENU_UNICO', dietaryRestrictions: ['RESTRICCION_UNICA'] }, ['RESTAURANTE_UNICO', 'MENU_UNICO', 'RESTRICCION_UNICA']],
  ['visaData', { fullName: 'VISA_UNICA', docNumber: 'DOC_UNICO', countryApplying: 'PAIS_UNICO' }, ['VISA_UNICA', 'DOC_UNICO', 'PAIS_UNICO']],
  ['passportData', { fullName: 'PASAPORTE_UNICO', idNumber: 'DOC_UNICO', residenceCity: 'CIUDAD_UNICA' }, ['PASAPORTE_UNICO', 'DOC_UNICO', 'CIUDAD_UNICA']],
  ['petServiceData', { ownerName: 'DUENO_UNICO', petName: 'MASCOTA_UNICA', breed: 'RAZA_UNICA' }, ['DUENO_UNICO', 'MASCOTA_UNICA', 'RAZA_UNICA']],
];

for (const [field, item, markers] of cases) {
  test(`${field}: conserva los datos completos una sola vez dentro de su paquete`, () => {
    const standalone = render({ ...baseSale, [field]: [item] });
    for (const marker of markers) assert.ok(standalone.includes(marker), `fixture visible: ${marker}`);
    const linked = render({
      ...baseSale,
      planData: [{ detalleVentaId: 'p1', planName: 'PAQUETE_PRIMERO' }, { detalleVentaId: 'p2', planName: 'PAQUETE_SEGUNDO' }],
      [field]: [{ ...item, parentDetalleId: 'p1', supplierCost: 99345678 }],
    });
    for (const marker of markers) {
      // El bloque de vuelo actual muestra el tiquete en el tramo y en su pasajero.
      const expectedCount = field === 'ticketData' && marker === 'TIQUETE_UNICO' ? 2 : 1;
      assert.equal(standalone.split(marker).length - 1, expectedCount, `fixture visible: ${marker}`);
      assert.equal(linked.split(marker).length - 1, expectedCount, `sin pérdidas ni duplicados: ${marker}`);
      assert.ok(linked.indexOf(marker) > linked.indexOf('PAQUETE_PRIMERO'), `${marker} pertenece al primero`);
      assert.ok(linked.indexOf(marker) < linked.indexOf('PAQUETE_SEGUNDO'), `${marker} no pertenece al segundo`);
    }
    assert.ok(!linked.includes('99345678'), 'no expone costos de proveedor');
  });
}

test('mezcla servicios independientes con dos paquetes sin cruzarlos ni duplicarlos', () => {
  const html = render({
    ...baseSale,
    planData: [{ detalleVentaId: 'p1', planName: 'PAQUETE_PRIMERO' }, { detalleVentaId: 'p2', planName: 'PAQUETE_SEGUNDO' }],
    hotelData: [
      { hotelName: 'HOTEL_LIBRE' },
      { hotelName: 'HOTEL_PRIMERO', parentDetalleId: 'p1' },
      { hotelName: 'HOTEL_SEGUNDO', parentDetalleId: 'p2' },
    ],
  });
  for (const marker of ['HOTEL_LIBRE', 'HOTEL_PRIMERO', 'HOTEL_SEGUNDO']) assert.equal(html.split(marker).length - 1, 1);
  assert.ok(html.indexOf('HOTEL_LIBRE') < html.indexOf('PAQUETE_PRIMERO'));
  assert.ok(html.indexOf('HOTEL_PRIMERO') > html.indexOf('PAQUETE_PRIMERO'));
  assert.ok(html.indexOf('HOTEL_PRIMERO') < html.indexOf('PAQUETE_SEGUNDO'));
  assert.ok(html.indexOf('HOTEL_SEGUNDO') > html.indexOf('PAQUETE_SEGUNDO'));
});

test('los servicios comparten la tarjeta del paquete y conservan bloques separables para el PDF', () => {
  const html = render({
    ...baseSale,
    planData: [{ detalleVentaId: 'p1', planName: 'PAQUETE_UNICO' }],
    ticketData: [{ ...cases[0][1], parentDetalleId: 'p1' }],
    hotelData: [{ hotelName: 'HOTEL_UNICO', parentDetalleId: 'p1', observations: 'PARRAFO_UNO\n\nPARRAFO_DOS' }],
    baggageData: [{ ...cases[6][1], parentDetalleId: 'p1' }],
  });
  assert.equal((html.match(/class="v-product-block"/g) || []).length, 1, 'una sola tarjeta para el paquete');
  assert.equal((html.match(/class="v-flight-block"/g) || []).length, 0, 'el vuelo no queda envuelto en una tarjeta indivisible');
  assert.equal((html.match(/class="v-obs(?: v-obs-inicio)?"/g) || []).length, 2, 'conserva el corte entre párrafos');
  assert.ok(html.includes('PERSONA_UNICA') && html.includes('BODEGA_UNICA'));
});

test('conserva la opción de ocultar el precio y admite ventas sin detalle o nulas', () => {
  assert.ok(render(baseSale).includes('Resumen de Venta'));
  assert.ok(!render(baseSale, false).includes('Resumen de Venta'));
  assert.ok(render(baseSale).includes('Esta venta no tiene servicios detallados'));
  assert.ok(!render(null).includes('Resumen de Venta'));
});
