import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { getProducts } from './services/productsApi';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductDetail from './components/ProductDetail';
import CrearProducto from './pages/CrearProducto';
import EditarProducto from './pages/EditarProducto';
import './styles/app.css';
import './styles/glass.css';

const CART_STORAGE_KEY = 'hermanos-jota-cart';

export function readStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));

    if (!Array.isArray(stored)) {
      return [];
    }

    // Descarta ítems corruptos o de versiones previas sin _id/precio numérico.
    return stored.filter(
      (item) =>
        item?.product?._id != null &&
        Number.isFinite(Number(item.product.precio)) &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
  } catch {
    return [];
  }
}

// La API puede tardar cerca de un minuto en despertar: reintenta durante 90 segundos.
const WAKE_RETRY_DELAY = 5000;
const WAKE_MAX_ATTEMPTS = 18;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cart, setCart] = useState(readStoredCart);
  const location = useLocation();
  const hasMountedRef = useRef(false);

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

    for (let attempt = 1; attempt <= WAKE_MAX_ATTEMPTS; attempt += 1) {
      try {
        const catalogue = await getProducts();

        if (isActive()) {
          setProducts(catalogue);
          setLoading(false);
        }
        return;
      } catch (requestError) {
        if (!requestError.retryable || attempt === WAKE_MAX_ATTEMPTS) {
          if (isActive()) {
            setError(requestError.message);
            setLoading(false);
          }
          return;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, WAKE_RETRY_DELAY));
      if (!isActive()) return;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadProducts(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadProducts]);

  // Al volver al catálogo tras crear, editar o eliminar un producto, refresca los datos desde la API.
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    if (location.pathname !== '/productos') {
      return undefined;
    }

    let isMounted = true;
    loadProducts(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [location.pathname, loadProducts]);

  const cartItemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart],
  );

  function addToCart(product) {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.product._id === product._id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.product._id === product._id
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
        item.product._id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decreaseQuantity(productId) {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.product._id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeFromCart(productId) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.product._id !== productId),
    );
  }

  function handleProductUpdated(product) {
    setProducts((current) => current.map((item) => item._id === product._id ? product : item));
    setCart((current) => current.map((item) =>
      item.product._id === product._id ? { ...item, product } : item,
    ));
  }

  function handleProductDeleted(productId) {
    setProducts((current) => current.filter((item) => item._id !== productId));
    removeFromCart(productId);
  }

  return (
    <div className="app-shell">
      <Navbar cartItemCount={cartItemCount} />

      <main className="app-main">
        {location.state?.success && (
          <p className="app-content product-feedback" role="status">
            {location.state.success}
          </p>
        )}
        <Routes>
          <Route
            path="/"
            element={
              <Home
                products={products}
                loading={loading}
                error={error}
                onRetry={() => loadProducts()}
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/productos"
            element={
              <Catalogo
                products={products}
                loading={loading}
                error={error}
                onRetry={() => loadProducts()}
                onAddToCart={addToCart}
              />
            }
          />

          <Route
            path="/productos/:id"
            element={<ProductDetail onAddToCart={addToCart} onProductDeleted={handleProductDeleted} />}
          />

          <Route
            path="/admin/crear-producto"
            element={<CrearProducto />}
          />

          <Route
            path="/admin/editar-producto/:id"
            element={<EditarProducto onProductUpdated={handleProductUpdated} />}
          />

          <Route
            path="/contacto"
            element={
              <div className="app-content contact-page">
                <ContactForm />
                <aside className="contact-aside" aria-labelledby="contact-aside-title">
                  <h2 id="contact-aside-title">Casa Taller y showroom</h2>
                  <p>Av. San Juan 2847 (C1232AAB)<br />San Cristóbal, CABA</p>
                  <h3>Horarios</h3>
                  <p>Lunes a viernes: 10:00 a 19:00 hs<br />Sábados: 10:00 a 14:00 hs</p>
                  <h3>Canales</h3>
                  <p>
                    <a href="mailto:info@hermanosjota.com.ar">info@hermanosjota.com.ar</a><br />
                    <a href="https://wa.me/541145678900" target="_blank" rel="noopener noreferrer">WhatsApp +54 11 4567-8900</a>
                  </p>
                </aside>
              </div>
            }
          />

          <Route
            path="/carrito"
            element={
              <div className="app-content">
                <Cart
                  cart={cart}
                  onIncreaseQuantity={increaseQuantity}
                  onDecreaseQuantity={decreaseQuantity}
                  onRemoveFromCart={removeFromCart}
                  onCheckout={() => setCart([])}
                />
              </div>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function NotFoundPage() {
  return (
    <section className="app-content provisional-panel" aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="section-heading__title">Página no encontrada</h1>
      <p>La dirección que buscás no existe o fue movida.</p>
      <div className="product-card__actions">
        <Link to="/" className="btn btn--primary">
          Ir al inicio
        </Link>
        <Link to="/productos" className="btn btn--secondary">
          Ver catálogo
        </Link>
      </div>
    </section>
  );
}

export default App;
