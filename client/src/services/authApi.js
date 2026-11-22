const API_URL = (process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

const CONNECTION_ERROR =
  'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.';
const REGISTER_ERROR = 'No pudimos crear tu cuenta. Revisá los datos e intentá nuevamente.';
const LOGIN_ERROR = 'No pudimos iniciar sesión. Intentá nuevamente más tarde.';
const PROFILE_ERROR = 'No pudimos verificar tu sesión. Iniciá sesión nuevamente.';

async function requestApi(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    const error = new Error(CONNECTION_ERROR);
    error.isNetworkError = true;
    throw error;
  }
}

// Mientras la API arranca, el servicio de hosting puede responder HTML o un 5xx de pasarela.
function buildWakingError(message, status) {
  const error = new Error(message);
  if (typeof status === 'number') {
    error.status = status;
  }
  error.retryable = true;
  return error;
}

async function readJson(response, fallbackMessage) {
  try {
    return await response.json();
  } catch {
    throw buildWakingError(fallbackMessage, response.status);
  }
}

async function buildResponseError(response, fallbackMessage) {
  let message = fallbackMessage;
  let status = response.status;

  try {
    if (typeof response.json === 'function') {
      const payload = await response.json();
      if (payload && typeof payload.error === 'string' && payload.error.trim().length > 0) {
        message = payload.error;
      }
      if (payload && typeof payload.status === 'number') {
        status = payload.status;
      }
    }
  } catch {
    // Si el cuerpo no es JSON válido, se conserva el mensaje de respaldo.
  }

  const error = new Error(message);
  error.status = status;
  if ([502, 503, 504].includes(status)) {
    error.retryable = true;
  }
  return error;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isValidAuthPayload(data) {
  return (
    isPlainObject(data) &&
    typeof data.token === 'string' &&
    data.token.trim().length > 0 &&
    isPlainObject(data.user)
  );
}

export async function registerUser({ nombre, email, password }) {
  const response = await requestApi(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password }),
  });

  if (!response.ok) {
    throw await buildResponseError(response, REGISTER_ERROR);
  }

  const data = await readJson(response, REGISTER_ERROR);

  if (!isValidAuthPayload(data)) {
    throw new Error(REGISTER_ERROR);
  }

  return data;
}

export async function loginUser(credentialsOrEmail, maybePassword) {
  const credentials =
    typeof credentialsOrEmail === 'string'
      ? { email: credentialsOrEmail, password: maybePassword }
      : credentialsOrEmail;

  const response = await requestApi(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials?.email,
      password: credentials?.password,
    }),
  });

  if (!response.ok) {
    throw await buildResponseError(response, LOGIN_ERROR);
  }

  const data = await readJson(response, LOGIN_ERROR);

  if (!isValidAuthPayload(data)) {
    throw new Error(LOGIN_ERROR);
  }

  return data;
}

export async function getProfile(token) {
  if (typeof token !== 'string' || !token.trim()) {
    const error = new Error('Necesitás iniciar sesión para consultar tu perfil.');
    error.status = 401;
    throw error;
  }

  const response = await requestApi(`${API_URL}/auth/perfil`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw await buildResponseError(response, PROFILE_ERROR);
  }

  const profile = await readJson(response, PROFILE_ERROR);

  if (!isPlainObject(profile)) {
    throw new Error(PROFILE_ERROR);
  }

  return profile;
}
