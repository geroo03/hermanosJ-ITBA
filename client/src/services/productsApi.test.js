import { getProducts } from './productsApi';

describe('getProducts', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('devuelve los productos cuando la API responde correctamente', async () => {
    const products = [{ id: 1, name: 'Sillón Nórdico' }];

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(products),
    });

    await expect(getProducts()).resolves.toEqual(products);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/productos');
  });

  it('informa un error claro cuando la API responde con error', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(getProducts()).rejects.toThrow(
      'No pudimos cargar el catálogo. Intentá nuevamente más tarde.',
    );
  });

  it('informa un error de conexión cuando el servidor no responde', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(getProducts()).rejects.toThrow(
      'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.',
    );
  });

  it('rechaza respuestas que no son una lista de productos', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ message: 'inesperado' }),
    });

    await expect(getProducts()).rejects.toThrow(
      'No pudimos cargar el catálogo. Intentá nuevamente más tarde.',
    );
  });
});
