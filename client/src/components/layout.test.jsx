import { act } from 'react';
import { createRoot } from 'react-dom/client';
import Cart, { getCartTotal } from './Cart';
import ContactForm, { validateContact } from './ContactForm';
import Navbar from './Navbar';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const sofa = { id: 'sofa-patagonia', name: 'Sofá Patagonia', price: 2490000, image: 'assets/images/sofa.png' };
const mesa = { id: 'mesa-aconcagua', name: 'Mesa de Noche Aconcagua', price: 525000, image: 'assets/images/mesa.png' };

let container;
let root;

function render(element) {
  act(() => root.render(element));
}

function click(element) {
  act(() => element.dispatchEvent(new MouseEvent('click', { bubbles: true })));
}

function type(field, value) {
  const prototype = Object.getPrototypeOf(field);
  const setValue = Object.getOwnPropertyDescriptor(prototype, 'value').set;

  act(() => {
    setValue.call(field, value);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function getButton(label) {
  return [...container.querySelectorAll('button')].find(
    (button) => button.textContent.trim() === label || button.getAttribute('aria-label') === label,
  );
}

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

describe('Navbar', () => {
  it('muestra el contador del carrito y navega con el callback recibido', () => {
    const onChangeView = jest.fn();

    render(
      <Navbar
        links={[{ view: 'catalogue', label: 'Catálogo' }]}
        currentView="catalogue"
        cartView="cart"
        cartItemCount={3}
        onChangeView={onChangeView}
      />,
    );

    const cartButton = getButton('Carrito, 3 productos');
    expect(cartButton.textContent).toContain('3');
    expect(getButton('Catálogo').getAttribute('aria-current')).toBe('page');

    click(cartButton);
    expect(onChangeView).toHaveBeenCalledWith('cart');
  });
});

describe('Cart', () => {
  const cart = [
    { product: sofa, quantity: 2 },
    { product: mesa, quantity: 1 },
  ];

  it('calcula el total según precio y cantidad', () => {
    expect(getCartTotal(cart)).toBe(2490000 * 2 + 525000);
    expect(getCartTotal([])).toBe(0);
  });

  it('muestra el total y delega incrementar, decrementar y eliminar en App', () => {
    const handlers = {
      onIncreaseQuantity: jest.fn(),
      onDecreaseQuantity: jest.fn(),
      onRemoveFromCart: jest.fn(),
      onContinueShopping: jest.fn(),
    };

    render(<Cart cart={cart} {...handlers} />);

    expect(container.querySelectorAll('.cart-item')).toHaveLength(2);
    expect(container.querySelector('.cart__total').textContent).toMatch(/5\.505\.000/);

    click(getButton('Agregar una unidad de Sofá Patagonia'));
    click(getButton('Quitar una unidad de Mesa de Noche Aconcagua'));
    click(container.querySelectorAll('.cart-item__remove')[0]);

    expect(handlers.onIncreaseQuantity).toHaveBeenCalledWith('sofa-patagonia');
    expect(handlers.onDecreaseQuantity).toHaveBeenCalledWith('mesa-aconcagua');
    expect(handlers.onRemoveFromCart).toHaveBeenCalledWith('sofa-patagonia');
  });

  it('ofrece volver al catálogo cuando está vacío', () => {
    const onContinueShopping = jest.fn();

    render(<Cart cart={[]} onContinueShopping={onContinueShopping} />);

    expect(container.textContent).toContain('Todavía no agregaste piezas');
    click(getButton('Ver el catálogo'));
    expect(onContinueShopping).toHaveBeenCalled();
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
    render(<ContactForm />);

    click(getButton('Enviar consulta'));

    expect(container.querySelectorAll('.contact__error')).toHaveLength(3);
    expect(container.querySelector('#contact-email').getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector('[role="status"]')).toBeNull();
  });

  it('muestra la confirmación al enviar datos válidos', () => {
    render(<ContactForm />);

    type(container.querySelector('#contact-name'), 'Ana');
    type(container.querySelector('#contact-email'), 'ana@correo.com');
    type(container.querySelector('#contact-message'), 'Quiero un sofá a medida.');
    click(getButton('Enviar consulta'));

    expect(container.querySelector('[role="status"]').textContent).toContain('¡Gracias, Ana!');

    click(getButton('Enviar otra consulta'));
    expect(container.querySelector('#contact-name').value).toBe('');
  });
});
