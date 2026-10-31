import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App, { readStoredCart } from '../App';
import Cart, { getCartTotal } from './Cart';
import ContactForm, { validateContact } from './ContactForm';
import Navbar from './Navbar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const sofa = {
  _id: '65f000000000000000000001',
  nombre: 'Sofá Patagonia',
  descripcion: 'Sofá de tres cuerpos en madera maciza y tapizado natural.',
  precio: 2490000,
  stock: 3,
  imagenUrl: 'assets/images/sofa-patagonia.png',
};

const mesa = {
  _id: '65f000000000000000000002',
  nombre: 'Mesa de Noche Aconcagua',
  descripcion: 'Mesa de luz en petiribí con cajón oculto.',
  precio: 525000,
  stock: 6,
  imagenUrl: 'assets/images/mesa-de-noche-aconcagua.png',
};

let container;
let root;

function LocationProbe() {
  const location = useLocation();
  return <output data-testid="current-path">{location.pathname}</output>;
}

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

function render(element, initialEntries = ['/']) {
  act(() => {
    root.render(
      <MemoryRouter initialEntries={initialEntries} future={ROUTER_FUTURE}>
        <LocationProbe />
        {element}
      </MemoryRouter>,
    );
  });
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }));
  });
}

function type(field, value) {
  const prototype = Object.getPrototypeOf(field);
  const setValue = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  act(() => {
    setValue.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function getInteractive(label) {
  return [...container.querySelectorAll('button, a')].find(
    (element) => element.textContent.trim() === label || element.getAttribute('aria-label') === label,
  );
}

beforeEach(() => {
  localStorage.clear();
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  jest.restoreAllMocks();
  act(() => root.unmount());
  container.remove();
});

describe('Navbar con React Router', () => {
  it('marca el enlace activo con aria-current y navega al carrito cambiando la ruta', () => {
    render(<Navbar cartItemCount={3} />, ['/productos']);

    const cartLink = getInteractive('Carrito, 3 productos');
    expect(cartLink.textContent).toContain('3');
    expect(getInteractive('Catálogo').getAttribute('aria-current')).toBe('page');

    click(cartLink);
    expect(container.querySelector('[data-testid="current-path"]').textContent).toBe('/carrito');
  });
});

describe('Cart con identificadores _id y campos en español', () => {
  const cart = [
    { product: sofa, quantity: 2 },
    { product: mesa, quantity: 1 },
  ];

  it('calcula el total según precio y cantidad', () => {
    expect(getCartTotal(cart)).toBe(2490000 * 2 + 525000);
    expect(getCartTotal([])).toBe(0);
  });

  it('muestra el total y delega incrementar, decrementar y eliminar con _id', () => {
    const handlers = {
      onIncreaseQuantity: jest.fn(),
      onDecreaseQuantity: jest.fn(),
      onRemoveFromCart: jest.fn(),
    };

    render(<Cart cart={cart} {...handlers} />, ['/carrito']);

    expect(container.querySelectorAll('.cart-item')).toHaveLength(2);
    expect(container.querySelector('.cart__total').textContent).toMatch(/5\.505\.000/);

    click(getInteractive('Agregar una unidad de Sofá Patagonia'));
    click(getInteractive('Quitar una unidad de Mesa de Noche Aconcagua'));
    click(container.querySelectorAll('.cart-item__remove')[0]);

    expect(handlers.onIncreaseQuantity).toHaveBeenCalledWith(sofa._id);
    expect(handlers.onDecreaseQuantity).toHaveBeenCalledWith(mesa._id);
    expect(handlers.onRemoveFromCart).toHaveBeenCalledWith(sofa._id);
  });

  it('ofrece enlace al catálogo cuando el carrito está vacío', () => {
    render(<Cart cart={[]} />, ['/carrito']);

    expect(container.textContent).toContain('Todavía no agregaste piezas');
    click(getInteractive('Ver el catálogo'));
    expect(container.querySelector('[data-testid="current-path"]').textContent).toBe('/productos');
  });

  it('readStoredCart conserva ítems con _id y descarta formato antiguo o inválido', () => {
    localStorage.setItem(
      'hermanos-jota-cart',
      JSON.stringify([
        { product: sofa, quantity: 2 },
        { product: { id: 'viejo-id', price: 1000 }, quantity: 1 },
      ]),
    );

    expect(readStoredCart()).toEqual([{ product: sofa, quantity: 2 }]);
  });
});

describe('Ruteo en App', () => {
  it('navega entre Inicio (/), Catálogo (/productos) y Detalle (/productos/:id)', async () => {
    global.fetch = jest.fn((url) => {
      if (url.endsWith(`/productos/${sofa._id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(sofa),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([sofa, mesa]),
      });
    });

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={['/']} future={ROUTER_FUTURE}>
          <LocationProbe />
          <App />
        </MemoryRouter>,
      );
    });

    expect(container.textContent).toContain('Muebles de madera maciza hechos para perdurar');

    await act(async () => {
      click(getInteractive('Explorar catálogo'));
    });

    expect(container.querySelector('[data-testid="current-path"]').textContent).toBe('/productos');
    expect(container.textContent).toContain('Sofá Patagonia');

    await act(async () => {
      click(getInteractive('Sofá Patagonia'));
    });

    expect(container.querySelector('[data-testid="current-path"]').textContent).toBe(
      `/productos/${sofa._id}`,
    );
    expect(container.textContent).toContain('Sofá de tres cuerpos en madera maciza');
  });
});

describe('ContactForm', () => {
  it('valida nombre, email y mensaje', () => {
    expect(validateContact({ name: ' ', email: 'sin-arroba', message: 'Hola' })).toEqual({
      name: expect.any(String),
      email: expect.stringContaining('válido'),
      message: expect.any(String),
    });
    expect(
      validateContact({ name: 'Ana', email: 'ana@correo.com', message: 'Quiero un sofá a medida.' }),
    ).toEqual({});
  });

  it('no envía un formulario inválido y muestra los errores', () => {
    render(<ContactForm />, ['/contacto']);

    click(getInteractive('Enviar consulta'));

    expect(container.querySelectorAll('.contact__error')).toHaveLength(3);
    expect(container.querySelector('#contact-email').getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('muestra la confirmación al enviar datos válidos', () => {
    render(<ContactForm />, ['/contacto']);

    type(container.querySelector('#contact-name'), 'Ana');
    type(container.querySelector('#contact-email'), 'ana@correo.com');
    type(container.querySelector('#contact-message'), 'Quiero un sofá a medida.');
    click(getInteractive('Enviar consulta'));

    expect(container.querySelector('[role="status"]').textContent).toContain('¡Gracias, Ana!');

    click(getInteractive('Enviar otra consulta'));
    expect(container.querySelector('#contact-name').value).toBe('');
  });
});
