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
});
