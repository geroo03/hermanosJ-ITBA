/**
 * Middleware para rutas no encontradas (404).
 * Captura solicitudes a endpoints inexistentes y responde con error JSON estructurado.
 */
function notFound(req, res, next) {
  return res.status(404).json({
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl || req.url}`,
    status: 404,
  });
}

module.exports = notFound;
