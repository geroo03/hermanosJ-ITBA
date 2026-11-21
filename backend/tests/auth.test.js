const assert = require('node:assert/strict');
const { test, before, after, beforeEach } = require('node:test');
const express = require('express');
const jwt = require('jsonwebtoken');
const { installFakeUser } = require('./helpers/fakeUser');

process.env.JWT_SECRET = 'secreto-de-pruebas';

const authRouter = require('../src/routes/authRouter');
const errorHandler = require('../src/middlewares/errorHandler');
const { verifyToken, requireRole } = require('../src/middlewares/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.get('/api/protegida', verifyToken, (req, res) => res.json(req.user));
app.get('/api/solo-admin', verifyToken, requireRole('admin'), (req, res) => res.json({ ok: true }));
app.use(errorHandler);

let fake;
let server;
let baseUrl;

before(async () => {
  fake = installFakeUser();
  await new Promise((resolve, reject) => {
    server = app.listen(0, '127.0.0.1', resolve);
    server.once('error', reject);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
});

after(async () => {
  fake.restore();
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeAllConnections();
  });
});

beforeEach(() => fake.reset());

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

const validUser = { nombre: 'Ana Pérez', email: 'Ana@Correo.com', password: 'secreto123' };

test('POST /auth/register crea la cuenta, responde 201 con token y no expone el hash', async () => {
  const response = await send('/auth/register', 'POST', validUser);
  assert.equal(response.status, 201);
  const data = await response.json();
  assert.ok(data.token);
  assert.equal(data.user.email, 'ana@correo.com');
  assert.equal(data.user.rol, 'cliente');
  assert.equal(data.user.password, undefined);
  assert.equal(jwt.verify(data.token, 'secreto-de-pruebas').id, data.user._id);
});

test('la contraseña se guarda hasheada con bcrypt, nunca en texto plano', async () => {
  await send('/auth/register', 'POST', validUser);
  const stored = fake.first().password;
  assert.notEqual(stored, validUser.password);
  assert.match(stored, /^\$2[aby]\$/);
});

test('POST /auth/register ignora un rol enviado en el cuerpo', async () => {
  const response = await send('/auth/register', 'POST', { ...validUser, rol: 'admin' });
  assert.equal((await response.json()).user.rol, 'cliente');
});

test('POST /auth/register responde 400 si faltan datos o la contraseña es corta', async () => {
  for (const body of [
    { email: 'a@b.com', password: 'secreto123' },
    { nombre: 'Ana', password: 'secreto123' },
    { nombre: 'Ana', email: 'no-es-email', password: 'secreto123' },
    { nombre: 'Ana', email: 'a@b.com', password: '123' },
    { nombre: 'Ana', email: 'a@b.com' },
  ]) {
    const response = await send('/auth/register', 'POST', body);
    assert.equal(response.status, 400, JSON.stringify(body));
    const data = await response.json();
    assert.equal(data.status, 400);
    assert.ok(data.error);
  }
  assert.equal(fake.count(), 0);
});

test('POST /auth/register responde 409 si el email ya existe', async () => {
  await send('/auth/register', 'POST', validUser);
  const response = await send('/auth/register', 'POST', { ...validUser, email: 'ana@correo.com' });
  assert.equal(response.status, 409);
  assert.equal(fake.count(), 1);
});

test('POST /auth/login devuelve token con credenciales correctas (sin distinguir mayúsculas en el email)', async () => {
  await send('/auth/register', 'POST', validUser);
  const response = await send('/auth/login', 'POST', { email: 'ANA@correo.com', password: 'secreto123' });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.ok(data.token);
  assert.equal(data.user.nombre, 'Ana Pérez');
  assert.equal(data.user.password, undefined);
});

test('POST /auth/login responde 401 con el mismo mensaje para contraseña errónea y email inexistente', async () => {
  await send('/auth/register', 'POST', validUser);
  const wrongPassword = await send('/auth/login', 'POST', { email: 'ana@correo.com', password: 'otra-clave' });
  const unknownEmail = await send('/auth/login', 'POST', { email: 'nadie@correo.com', password: 'secreto123' });
  assert.equal(wrongPassword.status, 401);
  assert.equal(unknownEmail.status, 401);
  assert.deepEqual(await wrongPassword.json(), await unknownEmail.json());
});

test('POST /auth/login responde 400 si faltan email o contraseña', async () => {
  const response = await send('/auth/login', 'POST', { email: 'ana@correo.com' });
  assert.equal(response.status, 400);
});

test('GET /auth/perfil devuelve el usuario del token', async () => {
  const { token, user } = await (await send('/auth/register', 'POST', validUser)).json();
  const response = await send('/auth/perfil', 'GET', undefined, token);
  assert.equal(response.status, 200);
  const profile = await response.json();
  assert.equal(profile._id, user._id);
  assert.equal(profile.password, undefined);
});

test('rutas protegidas: responden 401 sin token, con esquema incorrecto, token inválido o vencido', async () => {
  const expired = jwt.sign({ id: 'x', rol: 'cliente' }, 'secreto-de-pruebas', { expiresIn: -10 });
  const foreign = jwt.sign({ id: 'x', rol: 'cliente' }, 'otro-secreto');

  assert.equal((await send('/auth/perfil', 'GET')).status, 401);
  assert.equal((await fetch(`${baseUrl}/auth/perfil`, { headers: { Authorization: 'Basic abc' } })).status, 401);
  assert.equal((await send('/auth/perfil', 'GET', undefined, 'basura')).status, 401);
  assert.equal((await send('/auth/perfil', 'GET', undefined, foreign)).status, 401);

  const response = await send('/auth/perfil', 'GET', undefined, expired);
  assert.equal(response.status, 401);
  assert.match((await response.json()).error, /expiró/);
});

test('verifyToken deja { id, rol } en req.user y requireRole responde 403 al rol incorrecto', async () => {
  const { token, user } = await (await send('/auth/register', 'POST', validUser)).json();

  const protectedResponse = await send('/protegida', 'GET', undefined, token);
  assert.deepEqual(await protectedResponse.json(), { id: user._id, rol: 'cliente' });

  const forbidden = await send('/solo-admin', 'GET', undefined, token);
  assert.equal(forbidden.status, 403);
});
