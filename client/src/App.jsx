import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { getProductById, getProducts } from './services/productsApi';
import { formatPrice, getImageUrl } from './utils/productHelpers';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import './styles/app.css';

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

  return (
    <div className="app-shell">
      <Navbar cartItemCount={cartItemCount} />

      <main className="app-main">
        <Routes>
          <Route
            path="/"
            element={
              <Home
                products={products}
                loading={loading}
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

          {/* Punto de integración Tarea 4: reemplazar estos tres elementos provisorios
              por ProductDetail, CrearProducto y EditarProducto cuando estén listos. */}
          <Route
            path="/productos/:id"
            element={<ProvisionalProductDetail onAddToCart={addToCart} />}
          />

          <Route
            path="/admin/crear-producto"
            element={<ProvisionalCreateProduct />}
          />

          <Route
            path="/admin/editar-producto/:id"
            element={<ProvisionalEditProduct />}
          />

          <Route
            path="/contacto"
            element={
              <div className="app-content">
                <ContactForm />
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

function ProvisionalProductDetail({ onAddToCart }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getProductById(id)
      .then((data) => {
        if (isMounted) {
          setProduct(data);
        }
      })
      .catch((requestError) => {
        if (isMounted) {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <p className="app-message">Cargando producto…</p>;
  }

  if (error || !product) {
    return (
      <section className="app-message app-message--error" role="alert">
        <p>{error || 'Producto no encontrado.'}</p>
        <Link to="/productos" className="btn btn--secondary">
          Volver al catálogo
        </Link>
      </section>
    );
  }

  const imageSrc = getImageUrl(product.imagenUrl);

  return (
    <article className="app-content provisional-detail">
      <Link to="/productos" className="btn btn--secondary">
        Volver al catálogo
      </Link>

      <div className="product-detail__layout">
        {imageSrc ? (
          <img
            className="product-detail__image"
            src={imageSrc}
            alt={product.nombre}
          />
        ) : (
          <div className="product-detail__image product-card__image--placeholder" aria-hidden="true" />
        )}

        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.nombre}</h1>
          <p className="product-detail__price">{formatPrice(product.precio)}</p>
          {typeof product.stock === 'number' && (
            <p className="provisional-detail__stock">Stock disponible: {product.stock}</p>
          )}
          {product.descripcion && (
            <p className="product-detail__description">{product.descripcion}</p>
          )}

          <div className="product-card__actions">
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => onAddToCart(product)}
            >
              Agregar al carrito
            </button>
            <Link to={`/admin/editar-producto/${product._id}`} className="btn btn--secondary">
              Editar
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProvisionalCreateProduct() {
  return (
    <section className="app-content provisional-panel" aria-labelledby="crear-title">
      <h1 id="crear-title" className="section-heading__title">Alta de producto</h1>
      <p>
        Ruta montada en <code>/admin/crear-producto</code>. El formulario controlado corresponde a la Tarea 4.
      </p>
      <Link to="/productos" className="btn btn--secondary">
        Volver al catálogo
      </Link>
    </section>
  );
}

function ProvisionalEditProduct() {
  const { id } = useParams();

  return (
    <section className="app-content provisional-panel" aria-labelledby="editar-title">
      <h1 id="editar-title" className="section-heading__title">Edición de producto</h1>
      <p>
        Ruta montada para el identificador <code>{id}</code>. El formulario precargado corresponde a la Tarea 4.
      </p>
      <Link to={`/productos/${id}`} className="btn btn--secondary">
        Volver al detalle
      </Link>
    </section>
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
