/**
 * Middleware centralizado para manejo global de errores.
 * Captura excepciones lanzadas en rutas o controladores y responde con JSON consistente.
 */
function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.stack || err.message || err}`);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return res.status(status).json({
    error: message,
    status,
  });
}

module.exports = errorHandler;
