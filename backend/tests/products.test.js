const assert = require('node:assert/strict');
const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { test, before, after } = require('node:test');
const products = require('../src/data/products');
const app = require('./serve-products');

const projectRoot = path.resolve(__dirname, '../..');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api/productos`;
});

after(async () => {
  if (server) {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
      server.closeAllConnections();
    });
  }
});

test('el catálogo tiene 11 productos, IDs únicos y los seis campos válidos', () => {
  assert.equal(products.length, 11);
  assert.equal(new Set(products.map((product) => product.id)).size, products.length);
  const fields = ['category', 'description', 'id', 'image', 'name', 'price'];

  for (const product of products) {
    assert.deepEqual(Object.keys(product).sort(), fields);
    assert.match(product.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    for (const field of ['name', 'image', 'description', 'category']) {
      assert.equal(typeof product[field], 'string');
      assert.ok(product[field].trim().length > 0);
    }
    assert.ok(Number.isFinite(product.price) && product.price > 0);
    assert.ok(['comedor', 'estudio', 'living', 'dormitorio'].includes(product.category));
    assert.ok(existsSync(path.join(projectRoot, product.image)), product.image);
  }
});

test('los datos conservan el catálogo del Sprint 1-2 sin cambios', () => {
  const context = { window: {} };
  vm.runInNewContext(readFileSync(path.join(projectRoot, 'js/data.js'), 'utf8'), context);
  const source = JSON.parse(JSON.stringify(context.window.PRODUCTOS));
  const catalogue = source.map(({ id, name, price, image, description, category }) => ({
    id, name, price, image, description, category,
  }));
  assert.deepEqual(products, catalogue);
});

test('GET /api/productos devuelve 200 y un array JSON consumible por React', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  assert.deepEqual(await response.json(), products);
});

test('GET /api/productos/:id devuelve cada uno de los 11 productos', async () => {
  for (const product of products) {
    const response = await fetch(`${baseUrl}/${product.id}`);
    assert.equal(response.status, 200, product.id);
    assert.match(response.headers.get('content-type'), /^application\/json\b/);
    assert.deepEqual(await response.json(), product);
  }
});

test('un ID inexistente devuelve 404 con un error JSON consistente', async () => {
  for (const id of ['inexistente', '123', 'SOFA-PATAGONIA', 'sofa-patagonia-extra']) {
    const response = await fetch(`${baseUrl}/${id}`);
    assert.equal(response.status, 404, id);
    assert.match(response.headers.get('content-type'), /^application\/json\b/);
    assert.deepEqual(await response.json(), {
      error: `Producto no encontrado: ${id}`,
      status: 404,
    });
  }
});

test('las consultas repetidas no alteran el catálogo', async () => {
  const initial = JSON.stringify(products);
  await fetch(`${baseUrl}/inexistente`);
  await fetch(`${baseUrl}/${products[0].id}`);
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.equal(JSON.stringify(products), initial);
  assert.deepEqual(await response.json(), JSON.parse(initial));
});
