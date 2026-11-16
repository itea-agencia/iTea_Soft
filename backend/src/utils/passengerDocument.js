function passengerDocument(passengers) {
  return {
    docType: passengers[0]?.tipoDocumento || null,
    docNumber: passengers[0]?.nroDocumento || null,
  };
}

module.exports = { passengerDocument };
