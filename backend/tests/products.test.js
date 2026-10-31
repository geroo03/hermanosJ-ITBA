const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const { installFakeProduct } = require('./helpers/fakeProduct');
const app = require('./serve-products');

const initial = [
  { nombre: 'Sofá Patagonia', descripcion: 'Sofá de tres cuerpos', precio: 100, stock: 3, imagenUrl: '/a.png' },
  { nombre: 'Mesa Pampa', descripcion: 'Mesa de comedor', precio: 200, stock: 1, imagenUrl: '/b.png' },
];

let fake;
let server;
let baseUrl;

before(async () => {
  fake = installFakeProduct(initial);
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

function send(url, method, body) {
  return fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

test('GET /api/productos devuelve 200 y un array JSON', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  const data = await response.json();
  assert.equal(data.length, 2);
  assert.ok(data[0]._id);
  assert.equal(data[0].nombre, 'Sofá Patagonia');
});

test('GET /api/productos/:id devuelve el producto por _id', async () => {
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
  for (const [method, body] of [['GET'], ['PUT', { nombre: 'x' }], ['DELETE']]) {
    const response = await send(`${baseUrl}/abc`, method, body);
    assert.equal(response.status, 400, method);
    const data = await response.json();
    assert.equal(data.status, 400);
    assert.match(data.error, /no es válido/);
  }
});

test('POST crea el producto y responde 201', async () => {
  const response = await send(baseUrl, 'POST', {
    nombre: 'Butaca Mendoza', precio: 300, stock: 5, campoAjeno: 'ignorado',
  });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.ok(created._id);
  assert.equal(created.nombre, 'Butaca Mendoza');
  assert.equal(created.campoAjeno, undefined);
  assert.equal(fake.ids().length, 3);
});

test('POST sin nombre o precio devuelve 400 con el mensaje de validación', async () => {
  const response = await send(baseUrl, 'POST', { descripcion: 'sin datos' });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.status, 400);
  assert.match(data.error, /nombre del producto es obligatorio/);
  assert.match(data.error, /precio del producto es obligatorio/);
});

test('POST con precio negativo devuelve 400', async () => {
  const response = await send(baseUrl, 'POST', { nombre: 'Silla', precio: -1 });
  assert.equal(response.status, 400);
});

test('PUT actualiza y devuelve el documento actualizado', async () => {
  const [id] = fake.ids();
  const response = await send(`${baseUrl}/${id}`, 'PUT', { precio: 150, stock: 9 });
  assert.equal(response.status, 200);
  const updated = await response.json();
  assert.equal(updated.precio, 150);
  assert.equal(updated.stock, 9);
  assert.equal(updated.nombre, 'Sofá Patagonia');
});

test('PUT con datos inválidos devuelve 400 y con _id inexistente 404', async () => {
  const [id] = fake.ids();
  const invalid = await send(`${baseUrl}/${id}`, 'PUT', { precio: -5 });
  assert.equal(invalid.status, 400);

  const missing = await send(`${baseUrl}/${fake.newId()}`, 'PUT', { precio: 5 });
  assert.equal(missing.status, 404);
  assert.equal((await missing.json()).status, 404);
});

test('DELETE elimina el producto y luego responde 404', async () => {
  const [id] = fake.ids();
  const response = await send(`${baseUrl}/${id}`, 'DELETE');
  assert.equal(response.status, 200);
  assert.equal((await response.json())._id, id);
  assert.equal(fake.ids().length, 1);

  const again = await send(`${baseUrl}/${id}`, 'DELETE');
  assert.equal(again.status, 404);
});

test('un JSON mal formado en el cuerpo devuelve 400', async () => {
  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{nombre:',
  });
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /JSON/);
});
