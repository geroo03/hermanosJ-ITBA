import { Link } from 'react-router-dom';
import HomeHero from '../components/HomeHero';
import InstagramPost from '../components/InstagramPost';
import ProductList from '../components/ProductList';
import { getImageUrl } from '../utils/productHelpers';


function Home({ products = [], loading = false, error = null, onRetry, onAddToCart }) {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      <HomeHero />

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

      {loading && (
        <p className="app-message app-message--loading" role="status">
          Cargando piezas del catálogo… La primera visita puede tardar hasta un minuto.
        </p>
      )}

      {!loading && error && (
        <section className="app-message app-message--error" role="alert">
          <p>{error}</p>
          <button type="button" className="btn btn--secondary" onClick={onRetry}>
            Reintentar
          </button>
        </section>
      )}

      {!loading && !error && featuredProducts.length > 0 && (
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

      <section className="app-content home-workshop" aria-labelledby="home-workshop-title">
        <img
          src={getImageUrl('assets/images/aparador-uspallata.png')}
          alt="Casa Taller Hermanos Jota"
          className="home-workshop__image"
          loading="lazy"
        />
        <div className="home-workshop__text">
          <p className="home-tag">Casa Taller</p>
          <h2 id="home-workshop-title" className="home-workshop__title">
            El arte de escuchar la madera
          </h2>
          <p className="home-workshop__description">
            En Hermanos Jota entendemos la madera no como un insumo industrial, sino como un material vivo que cuenta una historia. Cada veta, nudo y textura define el alma de la pieza final en nuestro taller de San Cristóbal.
          </p>
          <Link to="/contacto" className="btn btn--primary">
            Conocé Nuestra Casa Taller
          </Link>
        </div>
      </section>

      <InstagramPost />
    </div>
  );
}

export default Home;

