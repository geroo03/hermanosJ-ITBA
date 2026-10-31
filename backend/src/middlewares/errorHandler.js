/**
 * Middleware centralizado para manejo global de errores.
 * Captura excepciones lanzadas en rutas o controladores y responde con JSON consistente.
 * Los errores de validación y de formato de _id de Mongoose se traducen a 400.
 */
function errorHandler(err, req, res, next) {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  if (err.name === 'ValidationError' && err.errors) {
    status = 400;
    message = Object.values(err.errors).map((item) => item.message).join('. ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Valor inválido para "${err.path}": ${err.stringValue || err.value}`;
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'El cuerpo de la solicitud no es un JSON válido';
  }

  if (status >= 500) console.error(`[Error] ${err.stack || err.message || err}`);

  return res.status(status).json({
    error: message,
    status,
  });
}

module.exports = errorHandler;
