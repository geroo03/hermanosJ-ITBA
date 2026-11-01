import { Link } from 'react-router-dom';
import InstagramPost from '../components/InstagramPost';
import ProductList from '../components/ProductList';
import { getImageUrl } from '../utils/productHelpers';

const HERO_STATS = [
  { value: '10 Años', label: 'Garantía Estructural' },
  { value: '100%', label: 'Madera Certificada FSC' },
  { value: '0%', label: 'Plásticos de un solo uso' },
];

function Home({ products = [], loading = false, error = null, onRetry, onAddToCart }) {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="home">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__media" aria-hidden="true">
          <video
            className="home-hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={getImageUrl('assets/images/historia-taller.jpg')}
            tabIndex={-1}
          >
            <source src={getImageUrl('assets/video/historia-inmueble.mp4')} type="video/mp4" />
          </video>
          <div className="home-hero__scrim" />
        </div>

        <div className="home-hero__inner">
          <div className="home-hero__glass">
            <p className="home-hero__label">Herencia &amp; Innovación</p>
            <h1 id="home-hero-title" className="home-hero__title">
              El redescubrimiento de un arte <span>olvidado</span>
            </h1>
            <p className="home-hero__lede">
              Donde la calidez del optimismo de los años 60 se encuentra con la conciencia de la sustentabilidad del 2026. Cada pieza cuenta la historia de manos expertas y materiales nobles.
            </p>
            <div className="home-hero__actions">
              <Link to="/productos" className="btn btn--primary home-hero__cta">
                Explorar catálogo
              </Link>
              <Link to="/contacto" className="btn btn--secondary home-hero__secondary">
                Visitar Casa Taller
              </Link>
            </div>
            <dl className="home-hero__stats">
              {HERO_STATS.map(({ value, label }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
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

