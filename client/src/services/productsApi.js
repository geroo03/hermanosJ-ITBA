const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3000/api';

export async function getProducts() {
  const response = await fetch(`${API_URL}/productos`);

  if (!response.ok) {
    throw new Error('No pudimos cargar el catálogo. Intentá nuevamente más tarde.');
  }

  return response.json();
}
