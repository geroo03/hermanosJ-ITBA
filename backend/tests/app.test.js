const assert = require('node:assert/strict');
const { test, before, after } = require('node:test');
const { installFakeProduct } = require('./helpers/fakeProduct');
const app = require('../src/app');

const fake = installFakeProduct([
  { nombre: 'Sofá Patagonia', descripcion: 'Sofá', precio: 100, stock: 1, imagenUrl: '/a.png' },
  { nombre: 'Mesa Pampa', descripcion: 'Mesa', precio: 200, stock: 1, imagenUrl: '/b.png' },
]);

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
  fake.restore();
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});

test('CORS permite localhost para desarrollo', async () => {
  const response = await fetch(`${baseUrl}/api/productos`, {
    headers: { Origin: 'http://localhost:5173' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('CORS permite el preflight de DELETE desde CLIENT_URL, aunque tenga barra final', async () => {
  process.env.CLIENT_URL = 'https://hermanos-jota.vercel.app/';
  try {
    const response = await fetch(`${baseUrl}/api/productos/1`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://hermanos-jota.vercel.app',
        'Access-Control-Request-Method': 'DELETE',
      },
    });
    assert.equal(response.status, 204);
    assert.equal(
      response.headers.get('access-control-allow-origin'),
      'https://hermanos-jota.vercel.app'
    );
    assert.match(response.headers.get('access-control-allow-methods'), /DELETE/);
  } finally {
    delete process.env.CLIENT_URL;
  }
});

test('CORS no autoriza otros orígenes', async () => {
  const response = await fetch(`${baseUrl}/api/productos`, {
    headers: { Origin: 'https://otro-sitio.example' },
  });
  assert.equal(response.headers.get('access-control-allow-origin'), null);
});

test('GET /api/productos devuelve el catálogo con status 200 y JSON', async () => {
  const response = await fetch(`${baseUrl}/api/productos`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  const data = await response.json();
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 2);
});

test('GET /api/productos/:id devuelve el producto seleccionado', async () => {
  const [id] = fake.ids();
  const response = await fetch(`${baseUrl}/api/productos/${id}`);
  assert.equal(response.status, 200);
  const product = await response.json();
  assert.equal(product._id, id);
  assert.equal(product.nombre, 'Sofá Patagonia');
});

test('GET /api/productos/:id devuelve 404 para producto inexistente', async () => {
  const id = fake.newId();
  const response = await fetch(`${baseUrl}/api/productos/${id}`);
  assert.equal(response.status, 404);
  const errorBody = await response.json();
  assert.deepEqual(errorBody, {
    error: `Producto no encontrado: ${id}`,
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
