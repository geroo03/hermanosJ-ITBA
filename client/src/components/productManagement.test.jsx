import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import App from '../App';
import ProductDetail from './ProductDetail';
import ProductForm, { validateProduct } from './ProductForm';
import EditarProducto from '../pages/EditarProducto';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };
const sofa = {
  _id: '65f000000000000000000001',
  nombre: 'Sofá Patagonia',
  descripcion: 'Sofá de tres cuerpos en madera maciza.',
  precio: 2490000,
  stock: 3,
  imagenUrl: 'assets/images/sofa-patagonia.png',
};
const newId = '65f000000000000000000002';
let container;
let root;
let originalFetch;

function response(data, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => data };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

// La UI usa el servicio real; solo se simula el transporte HTTP.
function installApi() {
  const products = [{ ...sofa }];
  global.fetch = jest.fn(async (url, options = {}) => {
    const id = url.split('/productos/')[1];
    const index = products.findIndex((product) => product._id === id);
    if (options.method === 'POST') {
      const created = { _id: newId, ...JSON.parse(options.body) };
      products.push(created);
      return response(created, 201);
    }
    if (!id) return response([...products]);
    if (index < 0) return response({ error: 'Producto no encontrado.', status: 404 }, 404);
    if (options.method === 'PUT') {
      products[index] = { ...products[index], ...JSON.parse(options.body) };
    }
    if (options.method === 'DELETE') return response(products.splice(index, 1)[0]);
    return response({ ...products[index] });
  });
  return products;
}

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="path">{location.pathname}</output>;
}

async function render(element = <App />, path = '/productos') {
  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[path]} future={ROUTER_FUTURE}>
        <LocationProbe />
        {element}
      </MemoryRouter>,
    );
  });
}

function button(label) {
  const result = [...container.querySelectorAll('button'), ...container.querySelectorAll('a')]
    .find((element) => element.textContent.trim() === label);
  if (!result) throw new Error(`No se encontró la acción: ${label}`);
  return result;
}

async function click(element) {
  await act(async () => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

function type(name, value) {
  const field = container.querySelector(`[name="${name}"]`);
  const setter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(field), 'value').set;
  act(() => {
    setter.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function submit() {
  const form = container.querySelector('form');
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

const currentPath = () => container.querySelector('[data-testid="path"]').textContent;
const writes = (method) => global.fetch.mock.calls.filter(([, options]) => options?.method === method);

beforeEach(() => {
  originalFetch = global.fetch;
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  installApi();
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  global.fetch = originalFetch;
  jest.restoreAllMocks();
});

it('carga los datos del detalle por URL y agrega al carrito desde App', async () => {
  await render(<App />, `/productos/${sofa._id}`);
  expect(container.querySelector('h1').textContent).toBe(sofa.nombre);
  expect(container.querySelector('.product-detail__image').src).toContain(sofa.imagenUrl);
  expect(container.textContent).toContain(sofa.descripcion);
  expect(container.textContent).toContain('Stock disponible: 3');
  expect(container.querySelector('.product-detail__price').textContent).toContain('2.490.000');
  await click(button('Agregar al carrito'));
  expect(container.querySelector('.product-detail__notice').textContent).toContain('Se agregó');
  expect(JSON.parse(localStorage.getItem('hermanos-jota-cart'))[0]).toEqual({ product: sofa, quantity: 1 });
  await click(button('Editar'));
  expect(currentPath()).toBe(`/admin/editar-producto/${sofa._id}`);
});

it('muestra la carga y permite reintentar un error de conexión', async () => {
  const pending = deferred();
  global.fetch.mockImplementationOnce(() => pending.promise);
  const page = <Routes><Route path="/productos/:id" element={<ProductDetail />} /></Routes>;
  await render(page, `/productos/${sofa._id}`);
  expect(container.querySelector('[role="status"]').textContent).toContain('Cargando');
  await act(async () => pending.reject(new Error('offline')));
  expect(container.querySelector('[role="alert"]').textContent).toContain('No pudimos conectarnos');
  await click(button('Reintentar'));
  expect(container.querySelector('h1').textContent).toBe(sofa.nombre);
});

it.each([
  ['/productos/inexistente', 'Producto no encontrado.'],
  ['/admin/editar-producto/inexistente', 'Producto no encontrado.'],
])('muestra un producto inexistente en %s y permite volver', async (path, message) => {
  await render(<App />, path);
  expect(container.querySelector('[role="alert"]').textContent).toContain(message);
  expect(container.querySelector('form')).toBeNull();
  await click(button('Volver al catálogo'));
  expect(currentPath()).toBe('/productos');
});

it.each(['/productos/mal-id', '/admin/editar-producto/mal-id'])('informa el 400 de un id mal formado en %s', async (path) => {
  const api = global.fetch.getMockImplementation();
  global.fetch.mockImplementation((url, options) => url.endsWith('/mal-id')
    ? Promise.resolve(response({ error: 'El identificador no es válido.', status: 400 }, 400))
    : api(url, options));
  await render(<App />, path);
  expect(container.querySelector('[role="alert"]').textContent).toContain('El identificador no es válido.');
  expect(container.querySelector('form')).toBeNull();
});

it('usa respaldos cuando faltan imagen, descripción y stock', async () => {
  global.fetch.mockResolvedValue(response({ _id: sofa._id, nombre: 'Mesa', precio: 0 }));
  await render(<Routes><Route path="/productos/:id" element={<ProductDetail />} /></Routes>, `/productos/${sofa._id}`);
  expect(container.textContent).toContain('Imagen no disponible');
  expect(container.textContent).toContain('Sin descripción disponible.');
  expect(container.textContent).toContain('Stock no informado');
});

it('muestra un respaldo cuando la imagen no se puede cargar', async () => {
  await render(<App />, `/productos/${sofa._id}`);
  act(() => container.querySelector('.product-detail__image').dispatchEvent(new Event('error')));
  expect(container.querySelector('.product-detail__image')).toBeNull();
  expect(container.querySelector('.product-detail__placeholder').textContent).toBe('Imagen no disponible');
});

it('bloquea datos vacíos o negativos y enfoca el primer campo inválido', async () => {
  await render(<App />, '/admin/crear-producto');
  await click(button('Crear producto'));
  expect(document.activeElement.id).toBe('product-nombre');
  expect(container.querySelector('#product-nombre').getAttribute('aria-invalid')).toBe('true');
  expect(container.querySelector('#product-precio-error').textContent).toContain('Ingresá el precio');
  type('nombre', 'Mesa');
  type('precio', '-1');
  type('stock', '-2');
  await click(button('Crear producto'));
  expect(document.activeElement.id).toBe('product-precio');
  expect(container.querySelector('#product-stock-error').textContent).toContain('igual o mayor que cero');
  expect(writes('POST')).toHaveLength(0);
});

it('rechaza números no finitos o no numéricos y acepta cero y stock opcional', () => {
  const valid = { nombre: 'Mesa', precio: '0', stock: '' };
  expect(validateProduct(valid)).toEqual({});
  for (const value of ['abc', 'Infinity', '1e309']) {
    const errors = validateProduct({ ...valid, precio: value, stock: value });
    expect(errors.precio).toBeTruthy();
    expect(errors.stock).toBeTruthy();
  }
});

it('crea mediante POST 201, normaliza los campos y recarga el catálogo con confirmación', async () => {
  await render(<App />, '/admin/crear-producto');
  type('nombre', '  Mesa nueva  ');
  type('descripcion', '  Roble macizo.  ');
  type('precio', '1250.5');
  type('stock', '2');
  type('imagenUrl', '  assets/images/mesa.png  ');
  await click(button('Crear producto'));
  expect(JSON.parse(writes('POST')[0][1].body)).toEqual({
    nombre: 'Mesa nueva', descripcion: 'Roble macizo.', precio: 1250.5, stock: 2, imagenUrl: 'assets/images/mesa.png',
  });
  expect(currentPath()).toBe('/productos');
  expect(container.querySelector('[role="status"]').textContent).toContain('Se creó “Mesa nueva” correctamente.');
  expect(container.querySelector('.product-list').textContent).toContain('Mesa nueva');
});

it('no duplica envíos pendientes y mantiene los datos tras un error para reintentar', async () => {
  const pending = deferred();
  const onSubmit = jest.fn().mockReturnValueOnce(pending.promise).mockResolvedValueOnce({});
  await render(<ProductForm initialValues={{ nombre: 'Mesa', precio: 0 }} onSubmit={onSubmit} />, '/admin/crear-producto');
  act(() => { submit(); submit(); });
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onSubmit).toHaveBeenCalledWith({ nombre: 'Mesa', descripcion: '', precio: 0, stock: 0, imagenUrl: '' });
  expect(container.querySelector('fieldset').disabled).toBe(true);
  expect(button('Guardando…').disabled).toBe(true);
  await click(button('Cancelar'));
  expect(currentPath()).toBe('/admin/crear-producto');
  await act(async () => pending.reject(new Error('El nombre ya está registrado.')));
  expect(container.querySelector('[role="alert"]').textContent).toContain('El nombre ya está registrado.');
  expect(container.querySelector('#product-nombre').value).toBe('Mesa');
  expect(button('Guardar producto').disabled).toBe(false);
  await click(button('Guardar producto'));
  expect(onSubmit).toHaveBeenCalledTimes(2);
});

it.each(['POST', 'PUT'])('muestra el error de API al guardar con %s sin salir ni perder los valores', async (method) => {
  const api = global.fetch.getMockImplementation();
  global.fetch.mockImplementation((url, options) => options?.method === method
    ? Promise.resolve(response({ error: 'No se pudo guardar la pieza.', status: 500 }, 500))
    : api(url, options));
  const path = method === 'POST' ? '/admin/crear-producto' : `/admin/editar-producto/${sofa._id}`;
  await render(<App />, path);
  type('nombre', 'Mesa');
  type('precio', '50');
  await click(button(method === 'POST' ? 'Crear producto' : 'Guardar cambios'));
  expect(currentPath()).toBe(path);
  expect(container.querySelector('.product-form__api-error').textContent).toBe('No se pudo guardar la pieza.');
  expect(container.querySelector('#product-nombre').value).toBe('Mesa');
});

it('precarga la edición, guarda mediante PUT, navega al detalle y actualiza el carrito', async () => {
  localStorage.setItem('hermanos-jota-cart', JSON.stringify([{ product: sofa, quantity: 2 }]));
  await render(<App />, `/admin/editar-producto/${sofa._id}`);
  for (const field of ['nombre', 'descripcion', 'precio', 'stock', 'imagenUrl']) {
    expect(container.querySelector(`[name="${field}"]`).value).toBe(String(sofa[field]));
  }
  type('nombre', 'Sofá actualizado');
  type('precio', '100');
  await click(button('Guardar cambios'));
  expect(writes('PUT')[0][0]).toContain(sofa._id);
  expect(currentPath()).toBe(`/productos/${sofa._id}`);
  expect(container.querySelector('h1').textContent).toBe('Sofá actualizado');
  expect(container.querySelector('[role="status"]').textContent).toContain('Se actualizó');
  const stored = JSON.parse(localStorage.getItem('hermanos-jota-cart'));
  expect(stored[0].quantity).toBe(2);
  expect(stored[0].product.precio).toBe(100);
});

it('cancela una eliminación sin hacer DELETE', async () => {
  jest.spyOn(window, 'confirm').mockReturnValue(false);
  await render(<App />, `/productos/${sofa._id}`);
  await click(button('Eliminar'));
  expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining(sofa.nombre));
  expect(writes('DELETE')).toHaveLength(0);
  expect(currentPath()).toBe(`/productos/${sofa._id}`);
});

it('confirma la eliminación, vuelve al catálogo actualizado y limpia el carrito', async () => {
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  localStorage.setItem('hermanos-jota-cart', JSON.stringify([{ product: sofa, quantity: 1 }]));
  await render(<App />, `/productos/${sofa._id}`);
  await click(button('Eliminar'));
  expect(writes('DELETE')).toHaveLength(1);
  expect(currentPath()).toBe('/productos');
  expect(container.querySelector('[role="status"]').textContent).toContain('Se eliminó');
  expect(container.querySelectorAll('.product-card')).toHaveLength(0);
  expect(JSON.parse(localStorage.getItem('hermanos-jota-cart'))).toEqual([]);
});

it('bloquea eliminaciones duplicadas y permite reintentar tras un error de API', async () => {
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  const pending = deferred();
  const api = global.fetch.getMockImplementation();
  global.fetch.mockImplementation((url, options) => options?.method === 'DELETE' ? pending.promise : api(url, options));
  await render(<App />, `/productos/${sofa._id}`);
  await click(button('Eliminar'));
  expect(button('Eliminando…').disabled).toBe(true);
  await click(button('Eliminando…'));
  expect(writes('DELETE')).toHaveLength(1);
  expect(window.confirm).toHaveBeenCalledTimes(1);
  await act(async () => pending.resolve(response({ error: 'No se pudo eliminar.', status: 500 }, 500)));
  expect(container.querySelector('[role="alert"]').textContent).toBe('No se pudo eliminar.');
  expect(currentPath()).toBe(`/productos/${sofa._id}`);
  global.fetch.mockImplementation(api);
  await click(button('Eliminar'));
  expect(currentPath()).toBe('/productos');
});

it('descarta una respuesta vieja al cambiar el id y no precarga el producto anterior', async () => {
  const pending = deferred();
  global.fetch.mockImplementation((url) => url.endsWith(sofa._id)
    ? pending.promise : Promise.resolve(response({ ...sofa, _id: newId, nombre: 'Mesa nueva' })));
  await render(<>
    <Link to={`/admin/editar-producto/${newId}`}>Cambiar producto</Link>
    <Routes><Route path="/admin/editar-producto/:id" element={<EditarProducto />} /></Routes>
  </>, `/admin/editar-producto/${sofa._id}`);
  expect(container.textContent).toContain('Cargando producto para editar');
  await click(button('Cambiar producto'));
  await act(async () => pending.resolve(response(sofa)));
  expect(container.querySelector('#product-nombre').value).toBe('Mesa nueva');
});

it('no redirige después de guardar si el usuario ya salió del formulario', async () => {
  const pending = deferred();
  const api = global.fetch.getMockImplementation();
  global.fetch.mockImplementation((url, options) => options?.method === 'POST' ? pending.promise : api(url, options));
  await render(<App />, '/admin/crear-producto');
  type('nombre', 'Mesa');
  type('precio', '10');
  await click(button('Crear producto'));
  await click(button('Contacto'));
  await act(async () => pending.resolve(response({ _id: newId, nombre: 'Mesa' }, 201)));
  expect(currentPath()).toBe('/contacto');
});

it.each(['PUT', 'DELETE'])('sincroniza el carrito tras %s sin redirigir si el usuario salió', async (method) => {
  jest.spyOn(window, 'confirm').mockReturnValue(true);
  const pending = deferred();
  const api = global.fetch.getMockImplementation();
  global.fetch.mockImplementation((url, options) => options?.method === method ? pending.promise : api(url, options));
  localStorage.setItem('hermanos-jota-cart', JSON.stringify([{ product: sofa, quantity: 1 }]));
  const path = method === 'PUT' ? `/admin/editar-producto/${sofa._id}` : `/productos/${sofa._id}`;
  await render(<App />, path);
  await click(button(method === 'PUT' ? 'Guardar cambios' : 'Eliminar'));
  await click(button('Contacto'));
  await act(async () => pending.resolve(response({ ...sofa, precio: 10 })));
  expect(currentPath()).toBe('/contacto');
  const cart = JSON.parse(localStorage.getItem('hermanos-jota-cart'));
  if (method === 'PUT') expect(cart[0].product.precio).toBe(10);
  else expect(cart).toEqual([]);
});
