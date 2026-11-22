
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter, useLocation } from 'react-router-dom';
import App from '../App';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider, readStoredCart } from '../context/CartContext';
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
let originalFetch;

function LocationProbe() {
  const location = useLocation();

  return (
    <output data-testid="current-path">
      {location.pathname}
    </output>
  );
}

const ROUTER_FUTURE = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};

function render(element, initialEntries = ['/']) {
  act(() => {
    root.render(
      <MemoryRouter
        initialEntries={initialEntries}
        future={ROUTER_FUTURE}
      >
        <LocationProbe />
        <AuthProvider>
          <CartProvider>
            {element}
          </CartProvider>
        </AuthProvider>
      </MemoryRouter>,
    );
  });
}

function click(element) {
  if (!element) {
    throw new Error('No se encontró el elemento que se intenta pulsar.');
  }

  act(() => {
    element.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        button: 0,
      }),
    );
  });
}

function type(field, value) {
  const prototype = Object.getPrototypeOf(field);
  const setValue = Object.getOwnPropertyDescriptor(
    prototype,
    'value',
  ).set;

  act(() => {
    setValue.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function getInteractive(label) {
  return [...container.querySelectorAll('button, a')].find(
    (element) =>
      element.textContent.trim() === label ||
      element.getAttribute('aria-label') === label,
  );
}

beforeEach(() => {
  localStorage.clear();

  originalFetch = global.fetch;

  container = document.createElement('div');
  document.body.appendChild(container);

  root = createRoot(container);
});

afterEach(() => {
  jest.restoreAllMocks();

  global.fetch = originalFetch;

  act(() => {
    root.unmount();
  });

  container.remove();
});

describe('Navbar con React Router', () => {
  it('marca el enlace activo y permite navegar al carrito', () => {
    localStorage.setItem(
      'hermanos-jota-cart',
      JSON.stringify([
        {
          product: sofa,
          quantity: 3,
        },
      ]),
    );

    render(<Navbar />, ['/productos']);

    const cartLink = getInteractive('Carrito, 3 productos');

    expect(cartLink).toBeTruthy();
    expect(cartLink.textContent).toContain('3');

    expect(
      getInteractive('Catálogo').getAttribute('aria-current'),
    ).toBe('page');

    click(cartLink);

    expect(
      container.querySelector('[data-testid="current-path"]').textContent,
    ).toBe('/carrito');
  });
});

describe('Cart con identificadores _id y campos en español', () => {
  const cart = [
    { product: sofa, quantity: 2 },
    { product: mesa, quantity: 1 },
  ];

  it('calcula el total según precio y cantidad', () => {
    expect(getCartTotal(cart)).toBe(
      2490000 * 2 + 525000,
    );

    expect(getCartTotal([])).toBe(0);
  });

  it('muestra el total y permite incrementar, decrementar y eliminar productos', () => {
    localStorage.setItem(
      'hermanos-jota-cart',
      JSON.stringify(cart),
    );

    render(<Cart />, ['/carrito']);

    expect(container.querySelectorAll('.cart-item')).toHaveLength(2);

    expect(
      container.querySelector('.cart__total').textContent,
    ).toMatch(/5\.505\.000/);

    click(getInteractive('Agregar una unidad de Sofá Patagonia'));

    let storedCart = JSON.parse(
      localStorage.getItem('hermanos-jota-cart'),
    );

    expect(
      storedCart.find((item) => item.product._id === sofa._id).quantity,
    ).toBe(3);

    click(
      getInteractive('Quitar una unidad de Mesa de Noche Aconcagua'),
    );

    storedCart = JSON.parse(
      localStorage.getItem('hermanos-jota-cart'),
    );

    expect(
      storedCart.some((item) => item.product._id === mesa._id),
    ).toBe(false);

    click(container.querySelector('.cart-item__remove'));

    storedCart = JSON.parse(
      localStorage.getItem('hermanos-jota-cart'),
    );

    expect(
      storedCart.some((item) => item.product._id === sofa._id),
    ).toBe(false);
  });

  it('ofrece un enlace al catálogo cuando el carrito está vacío', () => {
    render(<Cart />, ['/carrito']);

    expect(container.textContent).toContain(
      'Todavía no agregaste piezas',
    );

    click(getInteractive('Ver el catálogo'));

    expect(
      container.querySelector('[data-testid="current-path"]').textContent,
    ).toBe('/productos');
  });

  it('conserva ítems válidos y descarta el formato antiguo del carrito', () => {
    localStorage.setItem(
      'hermanos-jota-cart',
      JSON.stringify([
        { product: sofa, quantity: 2 },
        {
          product: {
            id: 'viejo-id',
            price: 1000,
          },
          quantity: 1,
        },
      ]),
    );

    expect(readStoredCart()).toEqual([
      { product: sofa, quantity: 2 },
    ]);
  });
});

describe('Ruteo en App', () => {
  it('navega entre Inicio, Catálogo y Detalle', async () => {
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
        <MemoryRouter
          initialEntries={['/']}
          future={ROUTER_FUTURE}
        >
          <LocationProbe />
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </MemoryRouter>,
      );
    });

    expect(container.textContent).toContain(
      'El redescubrimiento de un arte olvidado',
    );

    await act(async () => {
      click(getInteractive('Explorar catálogo'));
    });

    expect(
      container.querySelector('[data-testid="current-path"]').textContent,
    ).toBe('/productos');

    expect(container.textContent).toContain('Sofá Patagonia');

    await act(async () => {
      click(getInteractive('Sofá Patagonia'));
    });

    expect(
      container.querySelector('[data-testid="current-path"]').textContent,
    ).toBe(`/productos/${sofa._id}`);

    expect(container.textContent).toContain(
      'Sofá de tres cuerpos en madera maciza',
    );
  });
});

describe('ContactForm', () => {
  it('valida nombre, email y mensaje', () => {
    expect(
      validateContact({
        name: ' ',
        email: 'sin-arroba',
        message: 'Hola',
      }),
    ).toEqual({
      name: expect.any(String),
      email: expect.stringContaining('válido'),
      message: expect.any(String),
    });

    expect(
      validateContact({
        name: 'Ana',
        email: 'ana@correo.com',
        message: 'Quiero un sofá a medida.',
      }),
    ).toEqual({});
  });

  it('no envía un formulario inválido y muestra los errores', () => {
    render(<ContactForm />, ['/contacto']);

    click(getInteractive('Enviar consulta'));

    expect(
      container.querySelectorAll('.contact__error'),
    ).toHaveLength(3);

    expect(
      container.querySelector('#contact-email').getAttribute('aria-invalid'),
    ).toBe('true');

    expect(
      container.querySelector('[role="status"]'),
    ).toBeNull();
  });

  it('muestra la confirmación al enviar datos válidos', () => {
    render(<ContactForm />, ['/contacto']);

    type(
      container.querySelector('#contact-name'),
      'Ana',
    );

    type(
      container.querySelector('#contact-email'),
      'ana@correo.com',
    );

    type(
      container.querySelector('#contact-message'),
      'Quiero un sofá a medida.',
    );

    click(getInteractive('Enviar consulta'));

    expect(
      container.querySelector('[role="status"]').textContent,
    ).toContain('¡Gracias, Ana!');

    click(getInteractive('Enviar otra consulta'));

    expect(
      container.querySelector('#contact-name').value,
    ).toBe('');
  });
});

