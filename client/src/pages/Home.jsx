import { Link } from 'react-router-dom';
import ProductList from '../components/ProductList';

function Home({ products = [], loading = false, onAddToCart }) {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__inner">
          <p className="home-hero__label">Casa Taller en San Cristóbal, Buenos Aires</p>
          <h1 id="home-hero-title" className="home-hero__title">
            Muebles de madera maciza hechos para perdurar
          </h1>
          <p className="home-hero__lede">
            Diseñamos y construimos piezas de autor con maderas nativas certificadas, encastres tradicionales y acabados al aceite natural.
          </p>
          <div className="home-hero__actions">
            <Link to="/productos" className="btn btn--primary home-hero__cta">
              Explorar catálogo
            </Link>
            <Link to="/contacto" className="btn btn--secondary home-hero__secondary">
              Consultar a medida
            </Link>
          </div>
        </div>
      </section>

      <section className="app-content home-pillars" aria-label="Nuestro oficio">
        <div className="home-pillars__grid">
          <article className="home-pillar">
            <h2 className="home-pillar__title">Maderas seleccionadas</h2>
            <p className="home-pillar__text">
              Trabajamos nogal, petiribí, guatambú y roble estacionados con trazabilidad de origen responsable.
            </p>
          </article>

          <article className="home-pillar">
            <h2 className="home-pillar__title">Ebanistería reparable</h2>
            <p className="home-pillar__text">
              Uniones mecánicas y ceras vegetales que acompañan el uso cotidiano y permiten restaurar cada superficie.
            </p>
          </article>

          <article className="home-pillar">
            <h2 className="home-pillar__title">Trato directo de taller</h2>
            <p className="home-pillar__text">
              Recibimos visitas en Av. San Juan 2847 para revisar muestras de madera, medidas y entregas programadas.
            </p>
          </article>
        </div>
      </section>

      {!loading && featuredProducts.length > 0 && (
        <section className="app-content home-featured" aria-labelledby="home-featured-title">
          <div className="section-heading">
            <h2 id="home-featured-title" className="section-heading__title">
              Piezas seleccionadas del catálogo
            </h2>
            <Link to="/productos" className="btn btn--secondary">
              Ver todo el catálogo
            </Link>
          </div>
          <ProductList products={featuredProducts} onAddToCart={onAddToCart} />
        </section>
      )}
    </div>
  );
}

export default Home;

