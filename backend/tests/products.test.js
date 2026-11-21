const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const jwt = require('jsonwebtoken');
const { installFakeProduct } = require('./helpers/fakeProduct');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-pruebas';

const { signToken } = require('../src/utils/token');
const app = require('./serve-products');

const initial = [
  { nombre: 'Sofá Patagonia', descripcion: 'Sofá de tres cuerpos', precio: 100, stock: 3, imagenUrl: '/a.png' },
  { nombre: 'Mesa Pampa', descripcion: 'Mesa de comedor', precio: 200, stock: 1, imagenUrl: '/b.png' },
];

let fake;
let server;
let baseUrl;
let authToken;

before(async () => {
  fake = installFakeProduct(initial);
  authToken = signToken({ _id: fake.newId(), rol: 'cliente' });
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/productos`;
});

after(async () => {
  fake.restore();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
});

beforeEach(() => fake.reset());

function send(url, method, body, token) {
  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('GET /api/productos devuelve 200 y un array JSON de forma pública (sin token)', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  const data = await response.json();
  assert.equal(data.length, 2);
  assert.ok(data[0]._id);
  assert.equal(data[0].nombre, 'Sofá Patagonia');
});

test('GET /api/productos/:id devuelve el producto por _id de forma pública (sin token)', async () => {
  const [id] = fake.ids();
  const response = await fetch(`${baseUrl}/${id}`);
  assert.equal(response.status, 200);
  const product = await response.json();
  assert.equal(product._id, id);
  assert.equal(product.precio, 100);
});

test('GET con _id inexistente devuelve 404 en JSON', async () => {
  const id = fake.newId();
  const response = await fetch(`${baseUrl}/${id}`);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { error: `Producto no encontrado: ${id}`, status: 404 });
});

test('un _id mal formado devuelve 400 en GET, PUT y DELETE', async () => {
  for (const [method, body, token] of [
    ['GET'],
    ['PUT', { nombre: 'x' }, authToken],
    ['DELETE', undefined, authToken],
  ]) {
    const response = await send(`${baseUrl}/abc`, method, body, token);
    assert.equal(response.status, 400, method);
    const data = await response.json();
    assert.equal(data.status, 400);
    assert.match(data.error, /no es válido/);
  }
});

test('POST crea el producto y responde 201', async () => {
  const response = await send(baseUrl, 'POST', {
    nombre: 'Butaca Mendoza', precio: 300, stock: 5, campoAjeno: 'ignorado',
  }, authToken);
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.ok(created._id);
  assert.equal(created.nombre, 'Butaca Mendoza');
  assert.equal(created.campoAjeno, undefined);
  assert.equal(fake.ids().length, 3);
});

test('POST sin nombre o precio devuelve 400 con el mensaje de validación', async () => {
  const response = await send(baseUrl, 'POST', { descripcion: 'sin datos' }, authToken);
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.status, 400);
  assert.match(data.error, /nombre del producto es obligatorio/);
  assert.match(data.error, /precio del producto es obligatorio/);
});

test('POST con precio negativo devuelve 400', async () => {
  const response = await send(baseUrl, 'POST', { nombre: 'Silla', precio: -1 }, authToken);
  assert.equal(response.status, 400);
});

test('PUT actualiza y devuelve el documento actualizado', async () => {
  const [id] = fake.ids();
  const response = await send(`${baseUrl}/${id}`, 'PUT', { precio: 150, stock: 9 }, authToken);
  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated.precio, 150);
  assert.equal(updated.stock, 9);
  assert.equal(updated.nombre, 'Sofá Patagonia');
});

test('PUT con datos inválidos devuelve 400 y con _id inexistente 404', async () => {
  const [id] = fake.ids();
  const invalid = await send(`${baseUrl}/${id}`, 'PUT', { precio: -5 }, authToken);
  assert.equal(invalid.status, 400);

  const missing = await send(`${baseUrl}/${fake.newId()}`, 'PUT', { precio: 5 }, authToken);
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).status, 404);
});

test('DELETE elimina el producto y luego responde 404', async () => {
  const [id] = fake.ids();
  const response = await send(`${baseUrl}/${id}`, 'DELETE', undefined, authToken);
  assert.equal(response.status, 200);
  assert.equal((await response.json())._id, id);
  assert.equal(fake.ids().length, 1);

  const again = await send(`${baseUrl}/${id}`, 'DELETE', undefined, authToken);
  assert.equal(again.status, 404);
});

test('POST, PUT y DELETE sin token responden 401 con { error, status } y no modifican los productos', async () => {
  const [id] = fake.ids();
  const requests = [
    ['POST', baseUrl, { nombre: 'Silla', precio: 50 }],
    ['PUT', `${baseUrl}/${id}`, { precio: 999 }],
    ['DELETE', `${baseUrl}/${id}`, undefined],
  ];

  for (const [method, url, body] of requests) {
    const response = await send(url, method, body);
    assert.equal(response.status, 401, method);
    const data = await response.json();
    assert.equal(data.status, 401);
    assert.equal(typeof data.error, 'string');
    assert.ok(data.error.length > 0);
  }

  assert.equal(fake.ids().length, 2);
  const unchanged = await (await fetch(`${baseUrl}/${id}`)).json();
  assert.equal(unchanged.precio, 100);
});

test('POST, PUT y DELETE con token inválido o vencido responden 401 con { error, status }', async () => {
  const [id] = fake.ids();
  const expiredToken = jwt.sign(
    { id: fake.newId(), rol: 'cliente' },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );
  const requests = [
    ['POST', baseUrl, { nombre: 'Silla', precio: 50 }],
    ['PUT', `${baseUrl}/${id}`, { precio: 999 }],
    ['DELETE', `${baseUrl}/${id}`, undefined],
  ];

  for (const [method, url, body] of requests) {
    const invalid = await send(url, method, body, 'token.invalido.123');
    assert.equal(invalid.status, 401, `${method} con token inválido`);
    const invalidData = await invalid.json();
    assert.equal(invalidData.status, 401);
    assert.equal(typeof invalidData.error, 'string');
    assert.ok(invalidData.error.length > 0);

    const expired = await send(url, method, body, expiredToken);
    assert.equal(expired.status, 401, `${method} con token vencido`);
    const expiredData = await expired.json();
    assert.equal(expiredData.status, 401);
    assert.match(expiredData.error, /expiró/);
  }

  assert.equal(fake.ids().length, 2);
});

test('un JSON mal formado en el cuerpo devuelve 400', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: '{nombre:',
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /JSON/);
});
