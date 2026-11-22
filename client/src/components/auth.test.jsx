import { act, memo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import App from '../App';
import {
  AuthProvider,
  TOKEN_STORAGE_KEY,
  decodeJwtPayload,
  isTokenExpired,
  useAuthContext,
} from '../context/AuthContext';
import AuthForm, { validateAuthForm } from './AuthForm';
import ProtectedRoute from './ProtectedRoute';
import Login, { getRedirectTarget } from '../pages/Login';
import Registro from '../pages/Registro';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

const sampleUser = {
  _id: '65f000000000000000000010',
  nombre: 'Ana Pérez',
  email: 'ana@correo.com',
  rol: 'cliente',
};

let container;
let root;
let originalFetch;

function toBase64Url(value) {
  const json = JSON.stringify(value);
  const bytes =
    typeof TextEncoder !== 'undefined'
      ? new TextEncoder().encode(json)
      : Uint8Array.from(json, (char) => char.charCodeAt(0));
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function createFakeJwt(payload) {
  return `${toBase64Url({ alg: 'HS256', typ: 'JWT' })}.${toBase64Url(payload)}.firma-de-prueba`;
}

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 60;

function jsonResponse(data, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
  };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}
      {location.search}
    </output>
  );
}

async function renderTree(ui, initialEntries = ['/']) {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={initialEntries} future={ROUTER_FUTURE}>
        <LocationProbe />
        {ui}
      </MemoryRouter>,
    );
  });
}

function typeField(name, value) {
  const field = container.querySelector(`[name="${name}"]`);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value').set;
  act(() => {
    setter.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

function submitForm() {
  const form = container.querySelector('form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

function getInteractive(label) {
  const found = [...container.querySelectorAll('button, a')].find(
    (element) => element.textContent.trim() === label,
  );
  if (!found) throw new Error(`No se encontró la acción: ${label}`);
  return found;
}

const currentLocation = () => container.querySelector('[data-testid="location"]').textContent;

beforeEach(() => {
  originalFetch = global.fetch;
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  global.fetch = jest.fn(async (url) => {
    if (url.endsWith('/productos')) return jsonResponse([]);
    return jsonResponse({ error: 'No encontrado', status: 404 }, 404);
  });
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

describe('Utilidades JWT de AuthContext', () => {
  it('decodifica payloads Base64URL válidos y detecta expiración', () => {
    const activeToken = createFakeJwt({
      id: sampleUser._id,
      rol: 'cliente',
      exp: futureExp(),
    });
    const expiredToken = createFakeJwt({
      id: sampleUser._id,
      rol: 'cliente',
      exp: pastExp(),
    });

    const activePayload = decodeJwtPayload(activeToken);
    expect(activePayload).toMatchObject({ id: sampleUser._id, rol: 'cliente' });
    expect(isTokenExpired(activePayload)).toBe(false);

    const expiredPayload = decodeJwtPayload(expiredToken);
    expect(isTokenExpired(expiredPayload)).toBe(true);
  });

  it('devuelve null ante tokens mal formados', () => {
    expect(decodeJwtPayload('')).toBeNull();
    expect(decodeJwtPayload('solo.dos')).toBeNull();
    expect(decodeJwtPayload('a.!!!.c')).toBeNull();
    expect(decodeJwtPayload(null)).toBeNull();
    expect(isTokenExpired(null)).toBe(true);
  });
});

describe('AuthContext y useAuthContext', () => {
  it('lanza un error claro si useAuthContext se invoca fuera de AuthProvider', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    function OrphanConsumer() {
      useAuthContext();
      return null;
    }

    expect(() => {
      act(() => {
        root.render(<OrphanConsumer />);
      });
    }).toThrow('useAuthContext debe usarse dentro de un AuthProvider.');

    consoleErrorSpy.mockRestore();
  });

  it('restaura la sesión al recargar validando el token contra GET /api/auth/perfil', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);

    const pendingProfile = deferred();
    global.fetch = jest.fn().mockReturnValue(pendingProfile.promise);

    let snapshot;
    function Consumer() {
      snapshot = useAuthContext();
      return <p>{snapshot.loading ? 'cargando' : snapshot.user?.nombre || 'anonimo'}</p>;
    }

    await renderTree(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(snapshot.loading).toBe(true);
    expect(snapshot.isAuthenticated).toBe(false);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/perfil', {
      method: 'GET',
      headers: { Authorization: `Bearer ${validToken}` },
    });

    await act(async () => {
      pendingProfile.resolve(jsonResponse(sampleUser));
    });

    expect(snapshot.loading).toBe(false);
    expect(snapshot.isAuthenticated).toBe(true);
    expect(snapshot.token).toBe(validToken);
    expect(snapshot.user).toEqual(sampleUser);
    expect(container.textContent).toContain('Ana Pérez');
  });

  it('descarta un token vencido o mal formado en localStorage sin consultar la API', async () => {
    const expiredToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: pastExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, expiredToken);
    global.fetch = jest.fn();

    let snapshot;
    function Consumer() {
      snapshot = useAuthContext();
      return null;
    }

    await renderTree(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
    expect(snapshot.loading).toBe(false);
    expect(snapshot.isAuthenticated).toBe(false);
  });

  it('descarta el token guardado si GET /api/auth/perfil responde 401', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);

    global.fetch = jest.fn().mockResolvedValue(
      jsonResponse({ error: 'La sesión expiró. Iniciá sesión nuevamente', status: 401 }, 401),
    );

    let snapshot;
    function Consumer() {
      snapshot = useAuthContext();
      return null;
    }

    await renderTree(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(snapshot.loading).toBe(false);
    expect(snapshot.isAuthenticated).toBe(false);
    expect(snapshot.user).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('conserva el token en localStorage ante un corte de red al restaurar sesión', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);

    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    let snapshot;
    function Consumer() {
      snapshot = useAuthContext();
      return null;
    }

    await renderTree(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(snapshot.loading).toBe(false);
    expect(snapshot.isAuthenticated).toBe(false);
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(validToken);
  });

  it('ejecuta login, register y logout actualizando localStorage y evitando carreras con restauración', async () => {
    const restoredToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    const freshToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, restoredToken);

    const pendingRestore = deferred();
    global.fetch = jest.fn((url) => {
      if (url.endsWith('/auth/perfil')) return pendingRestore.promise;
      return Promise.resolve(jsonResponse({ token: freshToken, user: sampleUser }, 200));
    });

    let auth;
    function Consumer() {
      auth = useAuthContext();
      return null;
    }

    await renderTree(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    // Logout antes de que termine la restauración inicial: la respuesta tardía se descarta.
    act(() => {
      auth.logout();
    });
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();

    await act(async () => {
      pendingRestore.resolve(jsonResponse(sampleUser));
    });
    expect(auth.isAuthenticated).toBe(false);

    await act(async () => {
      await auth.login('ana@correo.com', 'secreto123');
    });
    expect(auth.isAuthenticated).toBe(true);
    expect(auth.token).toBe(freshToken);
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(freshToken);

    act(() => {
      auth.logout();
    });
    expect(auth.isAuthenticated).toBe(false);
    expect(auth.user).toBeNull();
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBeNull();
  });

  it('memoiza el value con useMemo para evitar re-renders innecesarios en consumidores', async () => {
    const observedValues = [];
    let renderCount = 0;

    const MemoConsumer = memo(function MemoConsumer() {
      const value = useAuthContext();
      renderCount += 1;
      observedValues.push(value);
      return <span>{value.isAuthenticated ? 'sí' : 'no'}</span>;
    });

    function Host() {
      const [ticks, setTicks] = useState(0);
      return (
        <div>
          <button type="button" onClick={() => setTicks((count) => count + 1)}>
            Tick {ticks}
          </button>
          <AuthProvider>
            <MemoConsumer />
          </AuthProvider>
        </div>
      );
    }

    await renderTree(<Host />);
    expect(renderCount).toBe(1);

    await click(container.querySelector('button'));
    expect(renderCount).toBe(1);
    expect(observedValues).toHaveLength(1);
  });
});

describe('ProtectedRoute', () => {
  it('muestra estado de espera mientras loading es true sin redirigir', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);

    const pending = deferred();
    global.fetch = jest.fn().mockReturnValue(pending.promise);

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <h1>Mi perfil</h1>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<h1>Pantalla de login</h1>} />
        </Routes>
      </AuthProvider>,
      ['/perfil'],
    );

    expect(currentLocation()).toBe('/perfil');
    expect(container.querySelector('[role="status"]').textContent).toContain('Verificando sesión');

    await act(async () => {
      pending.resolve(jsonResponse(sampleUser));
    });

    expect(container.querySelector('h1').textContent).toBe('Mi perfil');
  });

  it('redirige a /login guardando state.from cuando no hay sesión y vuelve tras iniciar sesión', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/login')) {
        return jsonResponse({ token: validToken, user: sampleUser }, 200);
      }
      return jsonResponse({ error: 'No encontrado', status: 404 }, 404);
    });

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route
            path="/mis-pedidos"
            element={
              <ProtectedRoute>
                <h1>Mis pedidos privados</h1>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>,
      ['/mis-pedidos?estado=recientes'],
    );

    expect(currentLocation()).toBe('/login');
    expect(container.textContent).toContain('Iniciá sesión para continuar');

    typeField('email', 'ana@correo.com');
    typeField('password', 'secreto123');
    await click(getInteractive('Ingresar'));

    expect(currentLocation()).toBe('/mis-pedidos?estado=recientes');
    expect(container.querySelector('h1').textContent).toBe('Mis pedidos privados');
  });

  it('también funciona como ruta contenedora con Outlet', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);
    global.fetch = jest.fn().mockResolvedValue(jsonResponse(sampleUser));

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<h1>Perfil mediante Outlet</h1>} />
          </Route>
          <Route path="/login" element={<Login />} />
        </Routes>
      </AuthProvider>,
      ['/perfil'],
    );

    expect(currentLocation()).toBe('/perfil');
    expect(container.querySelector('h1').textContent).toBe('Perfil mediante Outlet');
  });
});

describe('AuthForm, /registro y /login', () => {
  it('valida campos según el modo (registro y login)', () => {
    expect(validateAuthForm({ nombre: ' ', email: 'invalido', password: '123' }, 'register')).toEqual({
      nombre: 'Ingresá tu nombre.',
      email: 'Ingresá un email válido.',
      password: 'La contraseña debe tener al menos 6 caracteres.',
    });

    expect(
      validateAuthForm({ nombre: 'Ana', email: 'ana@correo.com', password: 'secreto123' }, 'register'),
    ).toEqual({});

    expect(validateAuthForm({ nombre: '', email: '', password: '' }, 'login')).toEqual({
      email: 'Ingresá tu email.',
      password: 'Ingresá tu contraseña.',
    });

    expect(validateAuthForm({ nombre: '', email: 'ana@correo.com', password: '123' }, 'login')).toEqual(
      {},
    );
  });

  it('getRedirectTarget resuelve objetos location, strings y rechaza redirecciones externas', () => {
    expect(getRedirectTarget({ from: { pathname: '/perfil', search: '?tab=1', hash: '#top' } })).toBe(
      '/perfil?tab=1#top',
    );
    expect(getRedirectTarget({ from: '/carrito' })).toBe('/carrito');
    expect(getRedirectTarget({ from: 'https://externo.test' })).toBe('/');
    expect(getRedirectTarget({ from: '//externo.test' })).toBe('/');
    expect(getRedirectTarget({ from: '/login' })).toBe('/');
    expect(getRedirectTarget(null)).toBe('/');
  });

  it('/registro valida campos, enfoca el primero inválido y no llama a la API', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/productos')) return jsonResponse([]);
      return jsonResponse({}, 200);
    });

    await renderTree(
      <AuthProvider>
        <App />
      </AuthProvider>,
      ['/registro'],
    );

    await click(getInteractive('Crear cuenta'));
    expect(document.activeElement.id).toBe('auth-nombre');
    expect(container.querySelector('#auth-nombre').getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('#auth-email-error').textContent).toContain('Ingresá tu email');
    expect(container.querySelector('#auth-password-error').textContent).toContain(
      'Ingresá tu contraseña',
    );

    typeField('nombre', 'Ana Pérez');
    typeField('email', 'no-valido');
    typeField('password', '123');
    await click(getInteractive('Crear cuenta'));
    expect(document.activeElement.id).toBe('auth-email');
    expect(container.querySelector('#auth-password-error').textContent).toContain(
      'al menos 6 caracteres',
    );

    const authCalls = global.fetch.mock.calls.filter(([url]) => url.includes('/auth/'));
    expect(authCalls).toHaveLength(0);
  });

  it('/registro crea la cuenta, guarda el token y navega al inicio con confirmación', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    global.fetch = jest.fn(async (url, options = {}) => {
      if (url.endsWith('/auth/register') && options.method === 'POST') {
        return jsonResponse({ token: validToken, user: sampleUser }, 201);
      }
      if (url.endsWith('/productos')) return jsonResponse([]);
      return jsonResponse({ error: 'No encontrado', status: 404 }, 404);
    });

    await renderTree(
      <AuthProvider>
        <App />
      </AuthProvider>,
      ['/registro'],
    );

    typeField('nombre', '  Ana Pérez  ');
    typeField('email', '  ana@correo.com  ');
    typeField('password', 'secreto123');
    await click(getInteractive('Crear cuenta'));

    const registerCall = global.fetch.mock.calls.find(([url]) => url.endsWith('/auth/register'));
    expect(JSON.parse(registerCall[1].body)).toEqual({
      nombre: 'Ana Pérez',
      email: 'ana@correo.com',
      password: 'secreto123',
    });
    expect(localStorage.getItem(TOKEN_STORAGE_KEY)).toBe(validToken);
    expect(currentLocation()).toBe('/');
    expect(container.querySelector('[role="status"]').textContent).toContain(
      '¡Hola, Ana Pérez! Tu cuenta fue creada correctamente.',
    );
  });

  it('/registro muestra el error 409 de email duplicado manteniendo los valores ingresados', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/register')) {
        return jsonResponse({ error: 'Ya existe una cuenta con ese email', status: 409 }, 409);
      }
      if (url.endsWith('/productos')) return jsonResponse([]);
      return jsonResponse({}, 404);
    });

    await renderTree(
      <AuthProvider>
        <App />
      </AuthProvider>,
      ['/registro'],
    );

    typeField('nombre', 'Ana Pérez');
    typeField('email', 'ana@correo.com');
    typeField('password', 'secreto123');
    await click(getInteractive('Crear cuenta'));

    expect(currentLocation()).toBe('/registro');
    expect(container.querySelector('.auth-form__api-error').textContent).toBe(
      'Ya existe una cuenta con ese email',
    );
    expect(container.querySelector('#auth-email').value).toBe('ana@correo.com');
  });

  it('/login muestra el error 401 ante credenciales incorrectas y conserva los datos', async () => {
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/login')) {
        return jsonResponse({ error: 'Email o contraseña incorrectos', status: 401 }, 401);
      }
      if (url.endsWith('/productos')) return jsonResponse([]);
      return jsonResponse({}, 404);
    });

    await renderTree(
      <AuthProvider>
        <App />
      </AuthProvider>,
      ['/login'],
    );

    typeField('email', 'ana@correo.com');
    typeField('password', 'clave-erronea');
    await click(getInteractive('Ingresar'));

    expect(currentLocation()).toBe('/login');
    expect(container.querySelector('.auth-form__api-error').textContent).toBe(
      'Email o contraseña incorrectos',
    );
    expect(container.querySelector('#auth-email').value).toBe('ana@correo.com');
  });

  it('bloquea envíos duplicados mientras hay una solicitud pendiente y permite reintentar tras error', async () => {
    const pending = deferred();
    const onSubmit = jest
      .fn()
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(undefined);

    await renderTree(<AuthForm mode="login" onSubmit={onSubmit} />, ['/login']);

    typeField('email', 'ana@correo.com');
    typeField('password', 'secreto123');

    act(() => {
      submitForm();
      submitForm();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(container.querySelector('fieldset').disabled).toBe(true);
    expect(getInteractive('Ingresando…').disabled).toBe(true);

    await act(async () => {
      pending.reject(new Error('Email o contraseña incorrectos'));
    });

    expect(container.querySelector('.auth-form__api-error').textContent).toBe(
      'Email o contraseña incorrectos',
    );
    expect(getInteractive('Ingresar').disabled).toBe(false);

    await click(getInteractive('Ingresar'));
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });

  it('redirige automáticamente fuera de /login y /registro si ya hay sesión activa', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    localStorage.setItem(TOKEN_STORAGE_KEY, validToken);

    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/perfil')) return jsonResponse(sampleUser);
      if (url.endsWith('/productos')) return jsonResponse([]);
      return jsonResponse({}, 404);
    });

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route path="/" element={<h1>Inicio público</h1>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </AuthProvider>,
      ['/login'],
    );

    expect(currentLocation()).toBe('/');
    expect(container.querySelector('h1').textContent).toBe('Inicio público');

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route path="/" element={<h1>Inicio público</h1>} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </AuthProvider>,
      ['/registro'],
    );

    expect(currentLocation()).toBe('/');
  });

  it('preserva state.from al pasar de /login a /registro y vuelve al destino original', async () => {
    const validToken = createFakeJwt({ id: sampleUser._id, rol: 'cliente', exp: futureExp() });
    global.fetch = jest.fn(async (url) => {
      if (url.endsWith('/auth/register')) {
        return jsonResponse({ token: validToken, user: sampleUser }, 201);
      }
      return jsonResponse({}, 404);
    });

    await renderTree(
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/carrito" element={<h1>Carrito listo</h1>} />
        </Routes>
      </AuthProvider>,
      [{ pathname: '/login', state: { from: '/carrito' } }],
    );

    await click(getInteractive('Crear cuenta'));
    expect(currentLocation()).toBe('/registro');

    typeField('nombre', 'Ana Pérez');
    typeField('email', 'ana@correo.com');
    typeField('password', 'secreto123');
    await click(getInteractive('Crear cuenta'));

    expect(currentLocation()).toBe('/carrito');
    expect(container.querySelector('h1').textContent).toBe('Carrito listo');
  });
});
