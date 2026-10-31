import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct,
} from './productsApi';

describe('productsApi', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getProducts', () => {
    it('devuelve los productos cuando la API responde correctamente', async () => {
      const products = [{ _id: '65f000000000000000000001', nombre: 'Sofá Patagonia', precio: 2490000 }];

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(products),
      });

      await expect(getProducts()).resolves.toEqual(products);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/productos', undefined);
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

  describe('getProductById', () => {
    it('devuelve un producto por su _id', async () => {
      const product = { _id: '65f000000000000000000001', nombre: 'Aparador Uspallata', precio: 1480000 };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(product),
      });

      await expect(getProductById(product._id)).resolves.toEqual(product);
      expect(global.fetch).toHaveBeenCalledWith(
        `http://localhost:3000/api/productos/${product._id}`,
        undefined,
      );
    });

    it('propaga el mensaje y estado de error devueltos por la API (ej. 404)', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 404,
        json: jest.fn().mockResolvedValue({ error: 'Producto no encontrado: 123', status: 404 }),
      });

      await expect(getProductById('123')).rejects.toMatchObject({
        message: 'Producto no encontrado: 123',
        status: 404,
      });
    });
  });

  describe('createProduct', () => {
    it('envía POST con JSON y devuelve el producto creado', async () => {
      const payload = { nombre: 'Mesa Aconcagua', precio: 525000 };
      const created = { _id: '65f000000000000000000002', ...payload };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(created),
      });

      await expect(createProduct(payload)).resolves.toEqual(created);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('propaga errores de validación 400 de la API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({ error: 'El nombre del producto es obligatorio', status: 400 }),
      });

      await expect(createProduct({})).rejects.toMatchObject({
        message: 'El nombre del producto es obligatorio',
        status: 400,
      });
    });
  });

  describe('updateProduct', () => {
    it('envía PUT con JSON y devuelve el producto actualizado', async () => {
      const id = '65f000000000000000000002';
      const payload = { nombre: 'Mesa Aconcagua Roble', precio: 560000 };
      const updated = { _id: id, ...payload };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(updated),
      });

      await expect(updateProduct(id, payload)).resolves.toEqual(updated);
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/api/productos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  });

  describe('deleteProduct', () => {
    it('envía DELETE y devuelve la respuesta de la API', async () => {
      const id = '65f000000000000000000002';
      const deleted = { _id: id, nombre: 'Mesa Aconcagua' };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(deleted),
      });

      await expect(deleteProduct(id)).resolves.toEqual(deleted);
      expect(global.fetch).toHaveBeenCalledWith(`http://localhost:3000/api/productos/${id}`, {
        method: 'DELETE',
      });
    });

    it('informa error de conexión cuando falla la red', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(deleteProduct('65f000000000000000000002')).rejects.toThrow(
        'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.',
      );
    });
  });
});
