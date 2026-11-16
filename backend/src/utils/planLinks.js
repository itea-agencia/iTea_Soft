function planLinkIndex(value, planCount) {
  if (value === undefined || value === null || value === '') return null;

  const validType = typeof value === 'number' || (typeof value === 'string' && value.trim() !== '');
  const index = validType ? Number(value) : NaN;
  if (Number.isInteger(index) && index >= 0 && index < planCount) {
    return index;
  }

  const err = new Error('El paquete vinculado no existe o su índice es inválido');
  err.statusCode = 400;
  err.code = 'VALIDATION_ERROR';
  throw err;
}

module.exports = { planLinkIndex };
