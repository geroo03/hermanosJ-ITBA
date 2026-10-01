import { useCallback, useEffect, useMemo, useState } from 'react';
import { getProducts } from './services/productsApi';
import './styles/app.css';

const VIEWS = {
  CATALOGUE: 'catalogue',
  DETAIL: 'detail',
  CART: 'cart',
  CONTACT: 'contact',
};

const CART_STORAGE_KEY = 'hermanos-jota-cart';

function readStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
}

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState(VIEWS.CATALOGUE);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState(readStoredCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // El carrito sigue funcionando en memoria si el almacenamiento no está disponible.
    }
  }, [cart]);

  const loadProducts = useCallback(async (isActive = () => true) => {
    setLoading(true);
    setError('');

    try {
      const catalogue = await getProducts();

      if (isActive()) {
        setProducts(catalogue);
      }
    } catch (requestError) {
      if (isActive()) {
        setError(requestError.message);
      }
    } finally {
      if (isActive()) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadProducts(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadProducts]);

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.product.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [...currentCart, { product, quantity: 1 }];
    });
  }

  function increaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decreaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product.id !== productId),
    );
  }

  function showProductDetail(product) {
    setSelectedProduct(product);
    setCurrentView(VIEWS.DETAIL);
  }

  function changeView(view) {
    setCurrentView(view);

    if (view !== VIEWS.DETAIL) {
      setSelectedProduct(null);
    }
  }

  const sharedProps = {
    products,
    cart,
    cartItemCount,
    selectedProduct,
    onAddToCart: addToCart,
    onIncreaseQuantity: increaseQuantity,
    onDecreaseQuantity: decreaseQuantity,
    onRemoveFromCart: removeFromCart,
    onShowProductDetail: showProductDetail,
    onChangeView: changeView,
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <p className="app-eyebrow">Mueblería Hermanos Jota</p>
        <h1>Diseño y calidez para tu hogar</h1>
        <nav aria-label="Navegación principal" className="app-nav">
          <button type="button" onClick={() => changeView(VIEWS.CATALOGUE)}>
            Catálogo
          </button>
          <button type="button" onClick={() => changeView(VIEWS.CART)}>
            Carrito ({cartItemCount})
          </button>
          <button type="button" onClick={() => changeView(VIEWS.CONTACT)}>
            Contacto
          </button>
        </nav>
      </header>

      {loading && <p className="app-message">Cargando catálogo…</p>}

      {!loading && error && (
        <section className="app-message app-message--error" role="alert">
          <p>{error}</p>
          <button type="button" onClick={() => loadProducts()}>
            Reintentar
          </button>
        </section>
      )}

      {!loading && !error && (
        <section className="app-content" aria-live="polite">
          <ViewBridge view={currentView} {...sharedProps} />
        </section>
      )}
    </main>
  );
}

/*
 * Punto de integración: cuando se incorporen las tareas de componentes,
 * reemplazar cada bloque por ProductList, ProductDetail, Cart y ContactForm.
 * El contrato de datos y callbacks ya está centralizado en sharedProps.
 */
function ViewBridge({ view, products, cart, selectedProduct, onShowProductDetail }) {
  if (view === VIEWS.DETAIL) {
    return selectedProduct ? (
      <article>
        <h2>{selectedProduct.name}</h2>
        <p>La vista de detalle se conectará con ProductDetail.</p>
      </article>
    ) : (
      <p>Seleccioná un producto para ver su detalle.</p>
    );
  }

  if (view === VIEWS.CART) {
    return <p>Hay {cart.length} tipos de producto en tu carrito.</p>;
  }

  if (view === VIEWS.CONTACT) {
    return <p>El formulario de contacto estará disponible próximamente.</p>;
  }

  return (
    <section>
      <h2>Catálogo</h2>
      {products.length === 0 ? (
        <p>No hay productos disponibles por el momento.</p>
      ) : (
        <ul className="product-preview-list">
          {products.map((product) => (
            <li key={product.id}>
              <strong>{product.name}</strong>
              <button type="button" onClick={() => onShowProductDetail(product)}>
                Ver detalle
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default App;
