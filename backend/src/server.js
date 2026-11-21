
// Cargar las variables de entorno
require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

// Iniciar el servidor después de conectar con MongoDB
const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('Falta la variable de entorno JWT_SECRET');
    }

    await connectDB();

    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(`Servidor de Hermanos Jota escuchando en http://localhost:${PORT}`);
      console.log(`API de productos disponible en http://localhost:${PORT}/api/productos`);
    });

    server.on('error', (error) => {
      console.error(`Error al iniciar el servidor: ${error.message}`);
      process.exitCode = 1;
    });

  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
  }
};

startServer();

