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
function completarPersona(existente, nuevos) {
  const datos = {};
  for (const [campo, valor] of Object.entries(nuevos)) {
    const actual = existente[campo];
    const vacio = actual === null || actual === undefined || actual === '';
    if (vacio && valor !== null && valor !== undefined && valor !== '') datos[campo] = valor;
  }
  return datos;
}

module.exports = { completarPersona };
