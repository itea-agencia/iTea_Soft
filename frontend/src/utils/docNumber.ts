// Validacion del numero de documento, compartida por clientes y responsables: antes cada
// pantalla tenia la suya y el mismo NIT entraba como responsable y se rechazaba como cliente,
// aunque los dos guardan en la misma persona. El backend aplica el mismo rango de longitud
// (backend/src/utils/persons.js).
//
// NIT/RUT acepta el digito de verificacion opcional (123456789 o 123456789-0): habia
// clientes guardados sin guion y responsables con guion, y los dos tienen que poder editarse.
// A Siigo no le afecta: normalizarIdentificacion corta desde el guion.
export function validateDocNumber(docType: string, value: string): string {
  const type = (docType || '').toUpperCase();
  if (value.length < 6 || value.length > 15) return 'El documento debe tener entre 6 y 15 caracteres';
  if (type === 'CC' && !/^\d+$/.test(value)) return 'La cédula de ciudadanía solo debe contener números';
  if (['NIT', 'RUT'].includes(type) && !/^\d+(-\d)?$/.test(value)) return 'El NIT/RUT solo admite números y, opcionalmente, guion y dígito de verificación (ej: 123456789-0)';
  if (['PASAPORTE', 'PP', 'PAS'].includes(type) && !/^[a-zA-Z0-9]+$/.test(value)) return 'El pasaporte solo debe contener caracteres alfanuméricos';
  return '';
}
