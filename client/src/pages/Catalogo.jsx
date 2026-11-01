import { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';

// Permite buscar sin distinguir mayúsculas ni tildes: "sofa" encuentra "Sofá".
function normalizeText(text = '') {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

function Catalogo({ products, loading, error, onRetry, onAddToCart }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = normalizeText(query.trim());
  const visibleProducts = products.filter((product) =>
    normalizeText(`${product.nombre} ${product.descripcion}`).includes(normalizedQuery),
  );

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

      {loading && <p className="app-message app-message--loading" role="status">Cargando catálogo… La primera visita puede tardar hasta un minuto.</p>}

      {!loading && error && (
        <section className="app-message app-message--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Reintentar
          </button>
        </section>
      )}

      {!loading && !error && (
        <>
          <label className="catalogo-search">
            Buscar piezas
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Nombre o descripción"
            />
          </label>
          <div aria-live="polite">
            {normalizedQuery && visibleProducts.length === 0 ? (
              <p className="app-message">No encontramos piezas para “{query.trim()}”.</p>
            ) : (
              <ProductList products={visibleProducts} onAddToCart={onAddToCart} />
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Catalogo;

