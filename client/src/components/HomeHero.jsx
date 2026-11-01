import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImageUrl } from '../utils/productHelpers';

const HERO_STATS = [
  { value: '10 Años', label: 'Garantía Estructural' },
  { value: '100%', label: 'Madera Certificada FSC' },
  { value: '0%', label: 'Plásticos de un solo uso' },
];

// En pantallas angostas el panel crece hacia abajo: con el mouse movería los botones.
const HOVER_QUERY = '(min-width: 48.01rem)';
const INITIAL_DELAY = 4500;
const LEAVE_DELAY = 2000;

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Portada con video. El panel de vidrio se abre con todo el texto y luego se
 * achica para dejar ver el video; vuelve a abrirse con el mouse o con el botón.
 */
function HomeHero() {
  const [expanded, setExpanded] = useState(true);
  const timeoutRef = useRef(null);

  const scheduleCollapse = useCallback((delay) => {
    clearTimeout(timeoutRef.current);
    if (prefersReducedMotion()) return;
    timeoutRef.current = setTimeout(() => setExpanded(false), delay);
  }, []);

  useEffect(() => {
    scheduleCollapse(INITIAL_DELAY);
    return () => clearTimeout(timeoutRef.current);
  }, [scheduleCollapse]);

  function handlePointerEnter(event) {
    if (event.pointerType !== 'mouse' || !window.matchMedia?.(HOVER_QUERY).matches) return;
    clearTimeout(timeoutRef.current);
    setExpanded(true);
  }

  function handlePointerLeave(event) {
    if (event.pointerType === 'mouse') scheduleCollapse(LEAVE_DELAY);
  }

  function handleToggle() {
    clearTimeout(timeoutRef.current);
    setExpanded((current) => !current);
  }

  return (
    <section
      className={`home-hero${expanded ? '' : ' home-hero--video-visible'}`}
      aria-labelledby="home-hero-title"
    >
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
        <div
          className="home-hero__glass"
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
        >
          <p className="home-hero__label">Herencia &amp; Innovación</p>
          <h1 id="home-hero-title" className="home-hero__title">
            El redescubrimiento de un arte <span>olvidado</span>
          </h1>
          <div className="home-hero__collapsible">
            <div>
              <p className="home-hero__lede">
                Donde la calidez del optimismo de los años 60 se encuentra con la conciencia de la sustentabilidad del 2026. Cada pieza cuenta la historia de manos expertas y materiales nobles.
              </p>
            </div>
          </div>
          <div className="home-hero__collapsible">
            <div>
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
          <div className="home-hero__actions">
            <Link to="/productos" className="btn btn--primary home-hero__cta">
              Explorar catálogo
            </Link>
            <Link to="/contacto" className="btn btn--secondary home-hero__secondary">
              Visitar Casa Taller
            </Link>
            <button type="button" className="home-hero__toggle" onClick={handleToggle}>
              {expanded ? 'Ver el video' : 'Mostrar texto'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HomeHero;
