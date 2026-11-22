
const API_URL = (
  process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api'
).replace(/\/+$/, '');

const CONNECTION_ERROR =
  'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.';

const CREATE_ORDER_ERROR =
  'No pudimos finalizar la compra. Intentá nuevamente.';

const LOAD_ORDERS_ERROR =
  'No pudimos cargar tus pedidos. Intentá nuevamente más tarde.';

async function requestApi(url, options) {
  try {
    return await fetch(url, options);
  } catch {
    throw new Error(CONNECTION_ERROR);
  }
}

async function readJson(response, fallbackMessage) {
  try {
    return await response.json();
  } catch {
    throw new Error(fallbackMessage);
  }
}

async function buildResponseError(response, fallbackMessage) {
  let message = fallbackMessage;
  let status = response.status;

  try {
    const payload = await response.json();

    if (typeof payload?.error === 'string' && payload.error.trim()) {
      message = payload.error;
    }

    if (typeof payload?.status === 'number') {
      status = payload.status;
    }
  } catch {
    // Se conserva el mensaje de respaldo.
  }

  const error = new Error(message);
  error.status = status;

  return error;
}

// Crea un pedido enviando los productos y sus cantidades.
export async function createOrder(items, token) {
  const response = await requestApi(`${API_URL}/pedidos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items }),
  });

  if (!response.ok) {
    throw await buildResponseError(response, CREATE_ORDER_ERROR);
  }

  return readJson(response, CREATE_ORDER_ERROR);
}

// Obtiene los pedidos del usuario autenticado.
export async function getMyOrders(token) {
  const response = await requestApi(`${API_URL}/pedidos/mis-pedidos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw await buildResponseError(response, LOAD_ORDERS_ERROR);
  }

  const orders = await readJson(response, LOAD_ORDERS_ERROR);

  if (!Array.isArray(orders)) {
    throw new Error(LOAD_ORDERS_ERROR);
  }

  return orders;
}
