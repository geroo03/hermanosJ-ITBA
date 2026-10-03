const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor de Hermanos Jota escuchando en http://localhost:${PORT}`);
  console.log(`API de productos disponible en http://localhost:${PORT}/api/productos`);
});

server.on('error', (error) => {
  console.error(`Error al iniciar el servidor: ${error.message}`);
  process.exitCode = 1;
});
