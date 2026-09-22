// El correo se guarda y se compara normalizado (sin espacios y en minusculas). login y la
// recuperacion de contrasena ya lo pasaban a minusculas, pero create lo guardaba tal como se
// escribia: un usuario creado con mayusculas no podia iniciar sesion, y `Maria@x.com` y
// `maria@x.com` eran dos filas distintas para el indice unico, con lo que "este correo esta
// libre" dependia de una mayuscula.
function normalizarEmail(valor) {
  if (typeof valor !== 'string') return null;
  const email = valor.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

// Lo que ocupa el lugar del correo de un usuario eliminado. `.invalid` es un dominio
// reservado (RFC 2606): nunca resuelve, asi que nadie puede iniciar sesion ni recibir correo
// con el. El correo real sigue en `personas.email`.
const correoDeEliminado = (userId) => `eliminado+${userId}@itea.invalid`;

module.exports = { normalizarEmail, correoDeEliminado };
