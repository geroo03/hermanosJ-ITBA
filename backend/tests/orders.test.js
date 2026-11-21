const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const jwt = require('jsonwebtoken');
const { installFakeProduct } = require('./helpers/fakeProduct');
const { installFakeOrder } = require('./helpers/fakeOrder');

process.env.JWT_SECRET = process.env.JWT_SECRET || 'secreto-de-pruebas';

const { signToken } = require('../src/utils/token');
const app = require('../src/app');

const initialProducts = [
  {
    nombre: 'Sofá Patagonia',
    descripcion: 'Sofá de tres cuerpos',
    precio: 150000,
    stock: 3,
    imagenUrl: '/assets/images/sofa-patagonia.png',
  },
  {
    nombre: 'Mesa Comedor Pampa',
    descripcion: 'Mesa de roble macizo',
    precio: 220000,
    stock: 2,
    imagenUrl: '/assets/images/mesa-comedor-pampa.png',
  },
  {
    nombre: 'Aparador Uspallata',
    descripcion: 'Hecho a pedido en taller',
    precio: 180000,
    stock: 0,
    imagenUrl: '/assets/images/aparador-uspallata.png',
  },
];

let fakeProducts;
let fakeOrders;
let server;
let baseUrl;
let userAId;
let userBId;
let tokenA;
let tokenB;

before(async () => {
  fakeProducts = installFakeProduct(initialProducts);
  fakeOrders = installFakeOrder();
  userAId = fakeOrders.newId();
  userBId = fakeOrders.newId();
  tokenA = signToken({ _id: userAId, rol: 'cliente' });
  tokenB = signToken({ _id: userBId, rol: 'cliente' });

  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  fakeOrders.restore();
  fakeProducts.restore();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
});

beforeEach(() => {
  fakeProducts.reset();
  fakeOrders.reset();
});

function send(path, method, body, token) {
  return fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

async function getProductStock(id) {
  const response = await fetch(`${baseUrl}/productos/${id}`);
  assert.equal(response.status, 200);
  const product = await response.json();
  return product.stock;
}

test('POST /api/pedidos crea el pedido (201), asocia usuario del token, calcula total en servidor y descuenta stock', async () => {
  const [sofaId, mesaId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [
        { producto: sofaId, cantidad: 2 },
        { producto: mesaId, cantidad: 1 },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 201);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);

  const order = await response.json();
  assert.ok(order._id);
  assert.equal(order.usuario, userAId);
  assert.ok(order.createdAt);
  assert.ok(order.updatedAt);
  assert.deepEqual(order.items, [
    { producto: sofaId, nombre: 'Sofá Patagonia', precio: 150000, cantidad: 2 },
    { producto: mesaId, nombre: 'Mesa Comedor Pampa', precio: 220000, cantidad: 1 },
  ]);
  assert.equal(order.total, 520000);
  assert.equal(fakeOrders.count(), 1);

  assert.equal(await getProductStock(sofaId), 1);
  assert.equal(await getProductStock(mesaId), 1);
});

test('POST /api/pedidos ignora precio, nombre, total y usuario manipulados por el cliente', async () => {
  const [sofaId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      usuario: userBId,
      total: 1,
      items: [
        {
          producto: sofaId,
          nombre: 'Nombre Manipulado',
          precio: 1,
          cantidad: 2,
        },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 201);
  const order = await response.json();
  assert.equal(order.usuario, userAId);
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].nombre, 'Sofá Patagonia');
  assert.equal(order.items[0].precio, 150000);
  assert.equal(order.items[0].cantidad, 2);
  assert.equal(order.total, 300000);
});

test('POST /api/pedidos consolida productos repetidos en items al calcular total y descontar stock', async () => {
  const [sofaId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [
        { producto: sofaId, cantidad: 1 },
        { producto: sofaId, cantidad: 2 },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 201);
  const order = await response.json();
  assert.deepEqual(order.items, [
    { producto: sofaId, nombre: 'Sofá Patagonia', precio: 150000, cantidad: 3 },
  ]);
  assert.equal(order.total, 450000);
  assert.equal(await getProductStock(sofaId), 0);
});

test('POST /api/pedidos rechaza con 400 si el stock no alcanza y no descuenta stock de otros ítems del pedido', async () => {
  const [sofaId, mesaId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [
        { producto: sofaId, cantidad: 2 },
        { producto: mesaId, cantidad: 5 },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.status, 400);
  assert.equal(data.error, 'Stock insuficiente para "Mesa Comedor Pampa": disponible 2, solicitado 5');
  assert.equal(fakeOrders.count(), 0);

  // Ningún producto del pedido fallido debe haber sufrido descuento parcial.
  assert.equal(await getProductStock(sofaId), 3);
  assert.equal(await getProductStock(mesaId), 2);
});

test('POST /api/pedidos rechaza con 400 cuando entradas duplicadas en items superan el stock disponible', async () => {
  const [, mesaId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [
        { producto: mesaId, cantidad: 2 },
        { producto: mesaId, cantidad: 1 },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.status, 400);
  assert.equal(data.error, 'Stock insuficiente para "Mesa Comedor Pampa": disponible 2, solicitado 3');
  assert.equal(fakeOrders.count(), 0);
  assert.equal(await getProductStock(mesaId), 2);
});

test('POST /api/pedidos permite productos con stock 0 ("Disponible a pedido") y mantiene el stock en 0', async () => {
  const [, , aparadorId] = fakeProducts.ids();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [{ producto: aparadorId, cantidad: 4 }],
    },
    tokenA
  );

  assert.equal(response.status, 201);
  const order = await response.json();
  assert.deepEqual(order.items, [
    { producto: aparadorId, nombre: 'Aparador Uspallata', precio: 180000, cantidad: 4 },
  ]);
  assert.equal(order.total, 720000);
  assert.equal(await getProductStock(aparadorId), 0);
});

test('POST /api/pedidos responde 400 ante items faltante, vacío, no-array, ObjectId inválido o cantidad inválida', async () => {
  const [sofaId] = fakeProducts.ids();
  const invalidPayloads = [
    {},
    { items: [] },
    { items: 'no-es-array' },
    { items: { producto: sofaId, cantidad: 1 } },
    { items: [null] },
    { items: [{ cantidad: 1 }] },
    { items: [{ producto: 'id-invalido', cantidad: 1 }] },
    { items: [{ producto: sofaId, cantidad: 0 }] },
    { items: [{ producto: sofaId, cantidad: -2 }] },
    { items: [{ producto: sofaId, cantidad: 1.5 }] },
    { items: [{ producto: sofaId, cantidad: '2' }] },
  ];

  for (const body of invalidPayloads) {
    const response = await send('/pedidos', 'POST', body, tokenA);
    assert.equal(response.status, 400, JSON.stringify(body));
    const data = await response.json();
    assert.equal(data.status, 400);
    assert.equal(typeof data.error, 'string');
    assert.ok(data.error.length > 0);
  }

  assert.equal(fakeOrders.count(), 0);
  assert.equal(await getProductStock(sofaId), 3);
});

test('POST /api/pedidos responde 404 si algún producto no existe y no descuenta stock de otros ítems', async () => {
  const [sofaId] = fakeProducts.ids();
  const missingId = fakeProducts.newId();

  const response = await send(
    '/pedidos',
    'POST',
    {
      items: [
        { producto: sofaId, cantidad: 1 },
        { producto: missingId, cantidad: 1 },
      ],
    },
    tokenA
  );

  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), {
    error: `Producto no encontrado: ${missingId}`,
    status: 404,
  });
  assert.equal(fakeOrders.count(), 0);
  assert.equal(await getProductStock(sofaId), 3);
});

test('POST /api/pedidos y GET /api/pedidos/mis-pedidos responden 401 sin token, con token inválido o vencido', async () => {
  const [sofaId] = fakeProducts.ids();
  const expiredToken = jwt.sign(
    { id: userAId, rol: 'cliente' },
    process.env.JWT_SECRET,
    { expiresIn: -10 }
  );
  const foreignToken = jwt.sign({ id: userAId, rol: 'cliente' }, 'otro-secreto');

  const endpoints = [
    ['POST', '/pedidos', { items: [{ producto: sofaId, cantidad: 1 }] }],
    ['GET', '/pedidos/mis-pedidos', undefined],
  ];

  for (const [method, path, body] of endpoints) {
    const noToken = await send(path, method, body);
    assert.equal(noToken.status, 401, `${method} ${path} sin token`);
    assert.equal((await noToken.json()).status, 401);

    const wrongScheme = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic abc123',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    assert.equal(wrongScheme.status, 401, `${method} ${path} con esquema inválido`);

    const garbage = await send(path, method, body, 'token.invalido.123');
    assert.equal(garbage.status, 401, `${method} ${path} con token mal formado`);
    assert.equal((await garbage.json()).status, 401);

    const foreign = await send(path, method, body, foreignToken);
    assert.equal(foreign.status, 401, `${method} ${path} con firma ajena`);
    assert.equal((await foreign.json()).status, 401);

    const expired = await send(path, method, body, expiredToken);
    assert.equal(expired.status, 401, `${method} ${path} con token vencido`);
    const expiredData = await expired.json();
    assert.equal(expiredData.status, 401);
    assert.match(expiredData.error, /expiró/);
  }

  assert.equal(fakeOrders.count(), 0);
  assert.equal(await getProductStock(sofaId), 3);
});

test('GET /api/pedidos/mis-pedidos devuelve [] cuando el usuario no tiene pedidos', async () => {
  const response = await send('/pedidos/mis-pedidos', 'GET', undefined, tokenA);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  assert.deepEqual(await response.json(), []);
});

test('GET /api/pedidos/mis-pedidos devuelve solo los pedidos del usuario del token, del más nuevo al más viejo', async () => {
  const [sofaId, mesaId, aparadorId] = fakeProducts.ids();

  const orderA1 = await (
    await send('/pedidos', 'POST', { items: [{ producto: sofaId, cantidad: 1 }] }, tokenA)
  ).json();
  const orderB1 = await (
    await send('/pedidos', 'POST', { items: [{ producto: mesaId, cantidad: 1 }] }, tokenB)
  ).json();
  const orderA2 = await (
    await send('/pedidos', 'POST', { items: [{ producto: aparadorId, cantidad: 1 }] }, tokenA)
  ).json();

  const responseA = await send('/pedidos/mis-pedidos', 'GET', undefined, tokenA);
  assert.equal(responseA.status, 200);
  const ordersA = await responseA.json();
  assert.equal(ordersA.length, 2);
  assert.equal(ordersA[0]._id, orderA2._id);
  assert.equal(ordersA[1]._id, orderA1._id);
  assert.ok(new Date(ordersA[0].createdAt) > new Date(ordersA[1].createdAt));
  assert.ok(ordersA.every((order) => order.usuario === userAId));
  assert.ok(ordersA.every((order) => order._id !== orderB1._id));

  const responseB = await send('/pedidos/mis-pedidos', 'GET', undefined, tokenB);
  assert.equal(responseB.status, 200);
  const ordersB = await responseB.json();
  assert.equal(ordersB.length, 1);
  assert.equal(ordersB[0]._id, orderB1._id);
  assert.equal(ordersB[0].usuario, userBId);
});

test('POST /api/pedidos con JSON mal formado responde 400', async () => {
  const response = await fetch(`${baseUrl}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenA}`,
    },
    body: '{items:',
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.equal(data.status, 400);
  assert.match(data.error, /JSON/);
});
