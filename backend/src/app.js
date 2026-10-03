const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const productsRouter = require('./routes/productsRouter');

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(logger);

// Rutas principales de la API
app.use('/api/productos', productsRouter);

// Manejo de rutas inexistentes (404)
app.use(notFound);

// Manejador centralizado de errores
app.use(errorHandler);

module.exports = app;
