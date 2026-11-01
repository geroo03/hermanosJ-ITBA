const express = require('express');
const cors = require('cors');

const logger = require('./middlewares/logger');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const productsRouter = require('./routes/productsRouter');

const app = express();

const LOCAL_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

// Permite el frontend desplegado (CLIENT_URL), localhost y clientes sin Origin (Postman, curl)
const isAllowedOrigin = (origin) => {
  const clientUrl = (process.env.CLIENT_URL || '').replace(/\/+$/, '');
  return !origin || origin === clientUrl || LOCAL_ORIGIN.test(origin);
};

// Middlewares globales
app.use(cors({ origin: (origin, callback) => callback(null, isAllowedOrigin(origin)) }));
app.use(express.json());
app.use(logger);

// Rutas principales de la API
app.use('/api/productos', productsRouter);

// Manejo de rutas inexistentes (404)
app.use(notFound);

// Manejador centralizado de errores
app.use(errorHandler);

module.exports = app;
