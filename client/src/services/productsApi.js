const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api';

const LOAD_ERROR = 'No pudimos cargar el catálogo. Intentá nuevamente más tarde.';

export async function getProducts() {
  let response;

  try {
    response = await fetch(`${API_URL}/productos`);
  } catch {
    throw new Error('No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.');
  }

  if (!response.ok) {
    throw new Error(LOAD_ERROR);
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error(LOAD_ERROR);
  }

  return products;
}
