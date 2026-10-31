// Servidor aislado para probar las rutas de productos con Postman o con las pruebas.
// Ejecutado directamente se conecta a MongoDB con MONGODB_URI; la app completa
// (CORS, logger, 404) está en src/app.js.
const path = require('node:path');
const express = require('express');
const productsRouter = require('../src/routes/productsRouter');
const errorHandler = require('../src/middlewares/errorHandler');

const app = express();
app.use(express.json());
app.use('/api/productos', productsRouter);
app.use(errorHandler);

if (require.main === module) {
  require('dotenv').config({ path: path.join(__dirname, '../.env') });
  const connectDB = require('../src/config/db');

  connectDB()
    .then(() => {
      const port = process.env.PORT || 3000;
      const server = app.listen(port, '127.0.0.1', () => {
        console.log(`API de prueba: http://localhost:${server.address().port}/api/productos`);
      });
      server.on('error', (error) => {
        console.error(`No se pudo iniciar la API de prueba: ${error.message}`);
        process.exitCode = 1;
      });
    })
    .catch(() => {
      process.exitCode = 1;
    });
}

module.exports = app;
