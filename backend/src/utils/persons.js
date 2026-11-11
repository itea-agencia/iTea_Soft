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

// Regla unica para toda persona (clientes, usuarios, responsables, comisionistas y
// pasajeros). La pantalla aplica la misma en frontend/src/utils/docNumber.ts: si cambia una,
// cambia la otra. Antes el servidor solo revisaba el largo del documento y confiaba en la
// pantalla para el resto. Diseño pasajeros-con-documento-2026-11.
const LETTERS = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

function docNumberError(docType, docNumber) {
  const type = String(docType || '').toUpperCase();
  const value = String(docNumber || '').trim();
  if (!value) return 'El número de documento es obligatorio';
  if (value.length < 6 || value.length > 15) return 'El documento debe tener entre 6 y 15 caracteres';
  if (type === 'CC' && !/^\d+$/.test(value)) return 'La cédula de ciudadanía solo debe contener números';
  if (['NIT', 'RUT'].includes(type) && !/^\d+(-\d)?$/.test(value)) return 'El NIT/RUT solo admite números y, opcionalmente, guion y dígito de verificación (ej: 123456789-0)';
  if (['PASAPORTE', 'PP', 'PAS'].includes(type) && !/^[a-zA-Z0-9]+$/.test(value)) return 'El pasaporte solo debe contener caracteres alfanuméricos';
  return null;
}

// Nombre o apellido por separado.
function namePartError(value) {
  const v = String(value || '').trim();
  if (!v) return 'El nombre es obligatorio';
  if (!LETTERS.test(v)) return 'El nombre solo debe contener letras';
  if (v.length > 40) return 'El nombre no puede exceder 40 caracteres';
  return null;
}

// Nombre completo en un solo campo. Con una sola palabra findOrCreatePersona guardaba el
// apellido como "Temporal".
function fullNameError(value) {
  const v = String(value || '').trim();
  if (!v) return 'El nombre es obligatorio';
  if (!LETTERS.test(v)) return 'El nombre solo debe contener letras';
  if (v.length > 80) return 'El nombre no puede exceder 80 caracteres';
  if (v.split(/\s+/).length < 2) return 'Escriba nombre y apellido';
  return null;
}

/**
 * Valida los datos de persona que llegan a un alta o edicion de clientes, usuarios,
 * responsables o comisionistas. En un alta (`create`) todo es obligatorio; en una edicion
 * se valida solo lo que llega, para que cambiar el telefono no exija reenviar el nombre.
 * `fullName` usa `name` (comisionistas) en vez de `firstName` y `lastName`.
 * Devuelve { message, code } o null.
 */
async function personInputError(prisma, data, { create, fullName = false }) {
  const has = (field) => create || data[field] !== undefined;
  const fail = (message, code) => ({ message, code });

  if (fullName) {
    if (has('name')) { const e = fullNameError(data.name); if (e) return fail(e, 'INVALID_NAME'); }
  } else {
    for (const field of ['firstName', 'lastName']) {
      if (has(field)) {
        const e = namePartError(data[field]);
        if (e) return fail(field === 'lastName' ? e.replace('El nombre', 'El apellido') : e, 'INVALID_NAME');
      }
    }
  }

  // El tipo puede llegar por abreviatura o por id (responsables acepta los dos).
  if (has('docType') || data.docTypeId !== undefined) {
    const byId = data.docTypeId ? parseInt(data.docTypeId) : null;
    const tipo = byId
      ? await prisma.tiposDocumento.findUnique({ where: { id: byId } })
      : (data.docType ? await prisma.tiposDocumento.findFirst({ where: { abreviatura: data.docType } }) : null);
    if (!tipo) return fail(data.docType || byId ? 'El tipo de documento no existe' : 'Seleccione un tipo de documento', 'INVALID_DOC_TYPE');
    if (has('docNumber')) { const e = docNumberError(tipo.abreviatura, data.docNumber); if (e) return fail(e, 'INVALID_DOC_NUMBER'); }
  } else if (has('docNumber')) {
    // Llega el numero sin el tipo: solo se puede revisar lo que no depende del tipo.
    const e = docNumberError('', data.docNumber);
    if (e) return fail(e, 'INVALID_DOC_NUMBER');
  }
  return null;
}

// El NIT se guarda sin digito de verificacion: el formulario acepta 900123456 y 900123456-7,
// y sin normalizar quedaban como dos personas distintas (la busqueda de duplicados compara el
// texto completo) aunque en Siigo son el mismo tercero. Se corta igual que
// normalizarIdentificacion de siigo-catalog.js, para que iTea y Siigo usen el mismo numero.
function normalizeDocNumber(docNumber, docType) {
  if (!docNumber || !['NIT', 'RUT'].includes(String(docType || '').toUpperCase())) return docNumber;
  return String(docNumber).trim().split('-')[0].trim();
}

module.exports = { fillMissingPersonFields, normalizeDocNumber, docNumberError, namePartError, fullNameError, personInputError };
