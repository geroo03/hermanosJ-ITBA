const jwt = require('jsonwebtoken');

const DEFAULT_EXPIRATION = '7d';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Falta la variable de entorno JWT_SECRET');
  }
  return secret;
}

// El payload mínimo del token es { id, rol }: el cliente lo decodifica para saber quién es el usuario.
function signToken(user) {
  return jwt.sign(
    { id: String(user._id), rol: user.rol },
    getSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRATION }
  );
}

function verifyJwt(token) {
  return jwt.verify(token, getSecret());
}

module.exports = { signToken, verifyJwt };
