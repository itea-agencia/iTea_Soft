// Misma politica que muestra la pantalla de recuperacion de contrasena (Login.tsx). Vivia
// solo en el navegador: el servidor aceptaba cualquier `newPassword`, asi que quien llamara
// a la API directamente se saltaba los requisitos.
function validarPassword(password) {
  if (typeof password !== 'string') return 'La contraseña es requerida';
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!/[a-z]/.test(password)) return 'La contraseña debe incluir una letra minúscula';
  if (!/[A-Z]/.test(password)) return 'La contraseña debe incluir una letra mayúscula';
  if (!/\d/.test(password)) return 'La contraseña debe incluir un número';
  if (!/[^A-Za-z0-9]/.test(password)) return 'La contraseña debe incluir un carácter especial';
  return null;
}

module.exports = { validarPassword };
