/**
 * Middleware de logging global.
 * Registra en consola el método HTTP y la URL de cada solicitud entrante.
 */
function logger(req, res, next) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl || req.url}`);
  next();
}

module.exports = logger;
