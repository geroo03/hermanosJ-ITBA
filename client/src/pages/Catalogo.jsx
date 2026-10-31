import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';

function Catalogo({ products, loading, error, onRetry, onAddToCart }) {
  return (
    <section className="app-content catalogo-page" aria-labelledby="catalogo-title">
      <div className="section-heading">
        <div>
          <h1 id="catalogo-title" className="section-heading__title">
            Catálogo de piezas
          </h1>
          <p className="section-heading__subtitle">
            Mobiliario de autor producido en nuestra Casa Taller y disponible bajo pedido o en stock.
          </p>
        </div>

        <Link to="/admin/crear-producto" className="btn btn--secondary">
          Nuevo producto
        </Link>
      </div>

      {loading && <p className="app-message">Cargando catálogo…</p>}

      {!loading && error && (
        <section className="app-message app-message--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Reintentar
          </button>
        </section>
      )}

      {!loading && !error && (
        <div aria-live="polite">
          <ProductList products={products} onAddToCart={onAddToCart} />
        </div>
      )}
    </section>
  );
}

export default Catalogo;

