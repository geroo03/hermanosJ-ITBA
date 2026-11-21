const { verifyJwt } = require('../utils/token');

function unauthorized(message) {
  const error = new Error(message);
  error.status = 401;
  return error;
}

/**
 * Middleware de autenticación para rutas protegidas.
 * Espera el header `Authorization: Bearer <token>`; si el token es válido deja
 * `req.user = { id, rol }` y continúa. Si falta o es inválido responde 401 con { error, status }.
 */
function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(unauthorized('Necesitás iniciar sesión para realizar esta acción'));
  }

  try {
    const { id, rol } = verifyJwt(token);
    req.user = { id, rol };
    return next();
  } catch (error) {
    const message = error.name === 'TokenExpiredError'
      ? 'La sesión expiró. Iniciá sesión nuevamente'
      : 'El token de sesión no es válido';
    return next(unauthorized(message));
  }
}

// Variante opcional para rutas que solo permiten ciertos roles (se usa después de verifyToken).
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      const error = new Error('No tenés permisos para realizar esta acción');
      error.status = 403;
      return next(error);
    }
    return next();
  };
}

module.exports = { verifyToken, requireRole };
