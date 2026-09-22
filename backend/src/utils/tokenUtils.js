const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(payload, remember = false) {
  const expiresIn = remember ? env.jwtRememberExpiresIn : env.jwtExpiresIn;
  return jwt.sign(payload, env.jwtSecret, { expiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

// Debe coincidir con la vigencia del JWT (jwtExpiresIn / jwtRememberExpiresIn en env.js) y
// con la de la cookie. Era 30 minutos para el login normal mientras el token duraba 1 dia:
// inocuo mientras nadie miraba esta fecha, pero en cuanto auth.js exige la sesion registrada,
// todo el mundo quedaba fuera a los 30 minutos.
function getExpiryTime(remember = false) {
  const ms = (remember ? 7 : 1) * 24 * 60 * 60 * 1000;
  return Date.now() + ms;
}

module.exports = { generateToken, verifyToken, getExpiryTime };
