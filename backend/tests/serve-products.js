// Servidor aislado para verificar la tarea 2 con Postman.
// La configuración y el arranque de la aplicación final corresponden a la tarea 3.
const express = require('express');
const productsRouter = require('../src/routes/productsRouter');

const app = express();
app.use('/api/productos', productsRouter);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`API de prueba: http://localhost:${server.address().port}/api/productos`);
  });
  server.on('error', (error) => {
    console.error(`No se pudo iniciar la API de prueba: ${error.message}`);
    process.exitCode = 1;
  });
}

module.exports = app;
