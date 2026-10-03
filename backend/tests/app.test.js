const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const app = require('../src/app');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});

test('la aplicación configura encabezados CORS', async () => {
  const response = await fetch(`${baseUrl}/api/productos`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), '*');
});

test('GET /api/productos devuelve el catálogo con status 200 y JSON', async () => {
  const response = await fetch(`${baseUrl}/api/productos`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  const data = await response.json();
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 11);
});

test('GET /api/productos/:id devuelve el producto seleccionado', async () => {
  const response = await fetch(`${baseUrl}/api/productos/sofa-patagonia`);
  assert.equal(response.status, 200);
  const product = await response.json();
  assert.equal(product.id, 'sofa-patagonia');
  assert.equal(product.name, 'Sofá Patagonia');
});

test('GET /api/productos/:id devuelve 404 para producto inexistente', async () => {
  const response = await fetch(`${baseUrl}/api/productos/no-existe`);
  assert.equal(response.status, 404);
  const errorBody = await response.json();
  assert.deepEqual(errorBody, {
    error: 'Producto no encontrado: no-existe',
    status: 404,
  });
});

test('rutas no definidas devuelven 404 manejado por el middleware notFound', async () => {
  const response = await fetch(`${baseUrl}/api/inexistente`);
  assert.equal(response.status, 404);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  const data = await response.json();
  assert.equal(data.status, 404);
  assert.ok(data.error.includes('Ruta no encontrada: GET /api/inexistente'));
});

test('el middleware errorHandler responde con formato JSON ante errores', async () => {
  // Verificamos errorHandler directamente como función middleware
  const errorHandler = require('../src/middlewares/errorHandler');
  let statusSet;
  let jsonSent;

  const mockRes = {
    status(code) {
      statusSet = code;
      return this;
    },
    json(payload) {
      jsonSent = payload;
      return this;
    },
  };

  const customError = new Error('Fallo simulado de base de datos');
  customError.status = 503;

  errorHandler(customError, {}, mockRes, () => {});

  assert.equal(statusSet, 503);
  assert.deepEqual(jsonSent, {
    error: 'Fallo simulado de base de datos',
    status: 503,
  });
});
