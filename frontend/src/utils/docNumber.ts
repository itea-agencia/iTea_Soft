// Regla unica para toda persona (clientes, usuarios, responsables, comisionistas y pasajeros).
// El backend aplica la misma en backend/src/utils/persons.js: si cambia una, cambia la otra.
//
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

const LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

// Nombre o apellido por separado, como en clientes, usuarios y responsables.
export function validateNamePart(value: string): string {
  const v = (value || '').trim();
  if (!v) return 'El nombre es obligatorio';
  if (!LETTERS.test(v)) return 'El nombre solo debe contener letras';
  if (v.length > 40) return 'El nombre no puede exceder 40 caracteres';
  return '';
}

// Nombre completo en un solo campo (pasajeros, comisionistas). Con una sola palabra el
// servidor guardaba el apellido como "Temporal".
export function validateFullName(value: string): string {
  const v = (value || '').trim();
  if (!v) return 'El nombre es obligatorio';
  if (!LETTERS.test(v)) return 'El nombre solo debe contener letras';
  if (v.length > 80) return 'El nombre no puede exceder 80 caracteres';
  if (v.split(/\s+/).length < 2) return 'Escriba nombre y apellido';
  return '';
}

// Una persona cargada en una venta: nombre completo, tipo del catalogo y documento.
export function validatePerson(
  p: { name?: string; docType?: string; docNumber?: string },
  docTypes: string[],
): string {
  const name = (p.name || '').trim();
  const docNumber = (p.docNumber || '').trim();
  if (!name && !docNumber) return 'Faltan el nombre y el documento';
  const nameError = validateFullName(name);
  if (nameError) return nameError;
  if (!p.docType) return 'Seleccione un tipo de documento';
  if (!docTypes.includes(p.docType)) return `El tipo de documento ${p.docType} no existe`;
  if (!docNumber) return 'El número de documento es obligatorio';
  return validateDocNumber(p.docType, docNumber);
}
