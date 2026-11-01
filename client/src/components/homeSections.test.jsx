import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Catalogo from '../pages/Catalogo';
import Home from '../pages/Home';

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true };

const products = [
  { _id: 'a', nombre: 'Sofá Patagonia', descripcion: 'Tres cuerpos', precio: 100, stock: 1 },
  { _id: 'b', nombre: 'Mesa Pampa', descripcion: 'Comedor de roble', precio: 200, stock: 1 },
];

let container;
let root;

beforeEach(() => {
  global.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

function render(ui) {
  act(() => {
    root.render(<MemoryRouter future={ROUTER_FUTURE}>{ui}</MemoryRouter>);
  });
}

function type(input, value) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  act(() => {
    setter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function click(element) {
  act(() => {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
}

describe('Home', () => {
  it('muestra el video de marca silenciado y las secciones recuperadas', () => {
    render(<Home />);

    const heroVideo = container.querySelector('.home-hero__video');
    expect(heroVideo.muted).toBe(true);
    expect(heroVideo.querySelector('source').getAttribute('src')).toBe('/assets/video/historia-inmueble.mp4');
    expect(container.textContent).toContain('El arte de escuchar la madera');
    expect(container.textContent).toContain('Una historia, treinta segundos');
  });
});

describe('Estados de carga de Home', () => {
  it('avisa mientras carga y permite reintentar si la API falla', () => {
    const onRetry = jest.fn();
    render(<Home loading />);
    expect(container.querySelector('[role="status"]').textContent).toContain('Cargando piezas');

    render(<Home error="No pudimos cargar el catálogo." onRetry={onRetry} />);
    expect(container.querySelector('[role="alert"]').textContent).toContain('No pudimos cargar');
    click(container.querySelector('[role="alert"] button'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});

describe('InstagramPost', () => {
  it('alterna me gusta y guardado', () => {
    render(<Home />);
    const like = container.querySelector('[aria-label="Me gusta"]');
    const save = container.querySelector('[aria-label="Guardar publicación"]');

    click(like);
    expect(like.getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.ig-likes').textContent).toBe('12.387 Me gusta');
    click(like);
    expect(container.querySelector('.ig-likes').textContent).toBe('12.386 Me gusta');

    click(save);
    expect(save.getAttribute('aria-pressed')).toBe('true');
  });

  it('el doble clic da me gusta una sola vez', () => {
    render(<Home />);
    const media = container.querySelector('.ig-media');

    act(() => {
      media.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      media.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    });

    expect(container.querySelector('.ig-likes').textContent).toBe('12.387 Me gusta');
  });

  it('publica comentarios como texto e ignora los vacíos', () => {
    render(<Home />);
    const input = container.querySelector('.ig-comment-input');
    const publish = container.querySelector('.ig-publish');
    const count = () => container.querySelectorAll('.ig-comments li').length;
    const initial = count();

    type(input, '   ');
    click(publish);
    expect(count()).toBe(initial);

    type(input, '<b>hola</b>');
    click(publish);
    expect(count()).toBe(initial + 1);
    expect(container.querySelector('.ig-comments').textContent).toContain('<b>hola</b>');
    expect(input.value).toBe('');
  });
});

describe('Buscador del catálogo', () => {
  function renderCatalog() {
    render(<Catalogo products={products} loading={false} error={null} onAddToCart={() => {}} />);
    return container.querySelector('input[type="search"]');
  }

  it('filtra sin distinguir mayúsculas ni tildes, también por descripción', () => {
    const search = renderCatalog();

    type(search, 'SOFA');
    expect(container.textContent).toContain('Sofá Patagonia');
    expect(container.textContent).not.toContain('Mesa Pampa');

    type(search, 'roble');
    expect(container.textContent).toContain('Mesa Pampa');
    expect(container.textContent).not.toContain('Sofá Patagonia');
  });

  it('avisa cuando no hay resultados', () => {
    const search = renderCatalog();

    type(search, 'zzz');
    expect(container.textContent).toContain('No encontramos piezas para “zzz”.');
  });
});
