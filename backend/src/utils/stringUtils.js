const formatName = (str) => {
  if (!str || typeof str !== 'string') return str || '';
  return str
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Lo que se escribe dentro de un correo HTML va escapado. Una contrasena como `Ab<c>1!x` se
// interpretaba como una etiqueta y el usuario recibia `Ab1!x`: una contrasena distinta, con la
// que no podia entrar.
const escaparHtml = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

module.exports = {
  formatName,
  escaparHtml
};
