import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { getProducts } from './services/productsApi';
import { useCartContext } from './context/CartContext';
import Navbar from './components/Navbar';
import Cart from './components/Cart';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductDetail from './components/ProductDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Perfil from './pages/Perfil';
import MisPedidos from './pages/MisPedidos';
import CrearProducto from './pages/CrearProducto';
import EditarProducto from './pages/EditarProducto';
import Login from './pages/Login';
import Registro from './pages/Registro';
import './styles/app.css';
import './styles/glass.css';

// La API puede tardar cerca de un minuto en despertar: reintenta durante 90 segundos.
const WAKE_RETRY_DELAY = 5000;
const WAKE_MAX_ATTEMPTS = 18;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const {
    removeFromCart,
    updateCartProduct,
  } = useCartContext();

  const location = useLocation();
  const hasMountedRef = useRef(false);

  // Cada pantalla nueva arranca desde arriba, no en el scroll de la anterior.
  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [location.pathname]);

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

  function handleProductUpdated(product) {
    setProducts((current) =>
      current.map((item) => item._id === product._id ? product : item),
    );

    updateCartProduct(product);
  }

  function handleProductDeleted(productId) {
    setProducts((current) =>
      current.filter((item) => item._id !== productId),
    );

    removeFromCart(productId);
  }

  return (
    <div className="app-shell">
      <Navbar />

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
              />
            }
          />

          <Route
            path="/productos/:id"
            element={
              <ProductDetail
                onProductDeleted={handleProductDeleted}
              />
            }
          />

          <Route element={<ProtectedRoute />}>
            <Route
              path="/perfil"
              element={<Perfil />}
            />

            <Route
              path="/mis-pedidos"
              element={<MisPedidos />}
            />

            <Route
              path="/admin/crear-producto"
              element={<CrearProducto />}
            />

            <Route
              path="/admin/editar-producto/:id"
              element={
                <EditarProducto onProductUpdated={handleProductUpdated} />
              }
            />
          </Route>

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
                <Cart />
              </div>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

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
