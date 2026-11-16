import type { Sale, Client } from '../types';

interface SaleParticipant {
  name: string;
  esTitular: boolean;
  docType: string;
  docNumber: string;
}

export function saleParticipants(sale: Sale, client?: Pick<Client, 'docType' | 'docNumber'>): SaleParticipant[] {
  const participants: SaleParticipant[] = [];
  const add = (person: any) => {
    if (!person) return;
    const name = typeof person === 'string' ? person : person.name || person.passengerName || person.fullName
      || (person.firstName ? `${person.firstName} ${person.lastName || ''}`.trim() : '')
      || (person.nombres ? `${person.nombres} ${person.apellidos || ''}`.trim() : '')
      || (person.persona?.nombres ? `${person.persona.nombres} ${person.persona.apellidos || ''}`.trim() : '');
    if (!name?.trim() || participants.some((p) => p.name.toLowerCase() === name.trim().toLowerCase())) return;
    participants.push({
      name: name.trim(),
      esTitular: person.esTitular === true,
      docType: person.docType || person.tipoDocumento || person.documentType || '',
      // Booking, tiquete y licencia no identifican el documento de la persona.
      docNumber: person.docNumber || person.nroDocumento || person.documentNumber || '',
    });
  };

  if (sale.clientName) add({
    name: sale.clientName, esTitular: true,
    docType: sale.clientDocType || client?.docType || '',
    docNumber: sale.clientDocNumber || client?.docNumber || '',
  });

  for (const [key, items] of Object.entries(sale)) {
    if (!key.endsWith('Data') || !Array.isArray(items)) continue;
    for (const item of items) {
      if (!item) continue;
      const list = [item.passengers, item.guests, item.members].find((value) => Array.isArray(value) && value.length > 0);
      if (list) list.forEach(add);
      else if (item.passengerInfo) add(item.passengerInfo);
      else add({
        name: item.passengerName || item.ownerName || item.fullName,
        docType: item.docType || item.tipoDocumento,
        docNumber: item.docNumber || item.nroDocumento || (key === 'passportData' ? item.idNumber : ''),
      });
    }
  }

  for (const summary of sale.servicesSummary || []) {
    for (const part of (summary.detail || '').split(' · ')) {
      const name = part.trim();
      if (name && !name.includes('→') && name.split(/\s+/).length >= 2) add(name);
    }
  }
  return participants;
}
