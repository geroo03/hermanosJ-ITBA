const API_URL = (process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

const CONNECTION_ERROR =
  'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.';
const LOAD_ERROR = 'No pudimos cargar el catálogo. Intentá nuevamente más tarde.';
const DETAIL_ERROR = 'No pudimos cargar el producto solicitado.';
const CREATE_ERROR = 'No pudimos crear el producto. Revisá los datos e intentá nuevamente.';
const UPDATE_ERROR = 'No pudimos actualizar el producto. Revisá los datos e intentá nuevamente.';
const DELETE_ERROR = 'No pudimos eliminar el producto. Intentá nuevamente más tarde.';

async function requestApi(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(CONNECTION_ERROR);
  }
}

// Mientras la API arranca, el servicio de hosting responde con una página HTML o un 5xx de pasarela.
function buildWakingError(message) {
  const error = new Error(message);
  error.retryable = true;
  return error;
}

async function readJson(response, fallbackMessage) {
  try {
    return await response.json();
  } catch {
    throw buildWakingError(fallbackMessage);
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
  return error;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export async function getProducts() {
  const response = await requestApi(`${API_URL}/productos`);

  if (!response.ok) {
    if ([502, 503, 504].includes(response.status)) {
      throw buildWakingError(LOAD_ERROR);
    }
    throw new Error(LOAD_ERROR);
  }

  const products = await readJson(response, LOAD_ERROR);

  if (!Array.isArray(products)) {
    throw new Error(LOAD_ERROR);
  }

  return products;
}

export async function getProductById(id) {
  const response = await requestApi(`${API_URL}/productos/${encodeURIComponent(id)}`);

  if (!response.ok) {
    throw await buildResponseError(response, DETAIL_ERROR);
  }

  const product = await readJson(response, DETAIL_ERROR);

  if (!isPlainObject(product)) {
    throw new Error(DETAIL_ERROR);
  }

  return product;
}

export async function createProduct(productData) {
  const response = await requestApi(`${API_URL}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw await buildResponseError(response, CREATE_ERROR);
  }

  const created = await readJson(response, CREATE_ERROR);

  if (!isPlainObject(created)) {
    throw new Error(CREATE_ERROR);
  }

  return created;
}

export async function updateProduct(id, productData) {
  const response = await requestApi(`${API_URL}/productos/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    throw await buildResponseError(response, UPDATE_ERROR);
  }

  const updated = await readJson(response, UPDATE_ERROR);

  if (!isPlainObject(updated)) {
    throw new Error(UPDATE_ERROR);
  }

  return updated;
}

export async function deleteProduct(id) {
  const response = await requestApi(`${API_URL}/productos/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw await buildResponseError(response, DELETE_ERROR);
  }

  if (typeof response.json === 'function') {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  return null;
}
