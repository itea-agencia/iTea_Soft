// Datos para reutilizar una persona que ya existe (la cedula es unica en `personas`) cuando
// se la registra con un rol que no tenia: un pasajero que pasa a ser cliente, un cliente que
// pasa a ser responsable o comisionista.
//
// Solo completa lo que la persona no tiene. Clientes, responsables y comisionistas, cada uno
// por su lado, le sobrescribian nombre, correo y telefono con lo que se escribiera en el
// formulario: registrar a alguien en un modulo cambiaba sus datos en todos los demas.
//
// No sirve para el reingreso de alguien al mismo rol (un cliente eliminado que vuelve): ahi
// el formulario trae los datos actualizados de esa misma persona y si se aplican.
function fillMissingPersonFields(existing, incoming) {
  const fields = {};
  for (const [field, value] of Object.entries(incoming)) {
    const current = existing[field];
    const isEmpty = current === null || current === undefined || current === '';
    if (isEmpty && value !== null && value !== undefined && value !== '') fields[field] = value;
  }
  return fields;
}

// Rango de longitud del documento de una persona, igual para clientes y responsables. El
// mismo rango se valida en los formularios (Clients.tsx, Responsables.tsx).
function isDocNumberOutOfRange(docNumber) {
  const length = String(docNumber).length;
  return length < 6 || length > 15;
}

// El NIT se guarda sin digito de verificacion: el formulario acepta 900123456 y 900123456-7,
// y sin normalizar quedaban como dos personas distintas (la busqueda de duplicados compara el
// texto completo) aunque en Siigo son el mismo tercero. Se corta igual que
// normalizarIdentificacion de siigo-catalog.js, para que iTea y Siigo usen el mismo numero.
function normalizeDocNumber(docNumber, docType) {
  if (!docNumber || !['NIT', 'RUT'].includes(String(docType || '').toUpperCase())) return docNumber;
  return String(docNumber).trim().split('-')[0].trim();
}

module.exports = { fillMissingPersonFields, isDocNumberOutOfRange, normalizeDocNumber };
