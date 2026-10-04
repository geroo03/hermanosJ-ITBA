import '../styles/layout.css';

function Navbar({ links, currentView, cartView, cartItemCount, onChangeView }) {
  const cartLabel = cartItemCount === 1 ? '1 producto' : `${cartItemCount} productos`;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <button
          type="button"
          className="navbar__brand"
          onClick={() => onChangeView(links[0].view)}
        >
          <span className="navbar__brand-name">Hermanos Jota</span>
          <span className="navbar__brand-tagline">Casa Taller &amp; Ebanistería</span>
        </button>

        <nav aria-label="Navegación principal">
          <ul className="navbar__links">
            {links.map(({ view, label }) => (
              <li key={view}>
                <button
                  type="button"
                  className="navbar__link"
                  aria-current={currentView === view ? 'page' : undefined}
                  onClick={() => onChangeView(view)}
                >
                  {label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="navbar__link navbar__cart"
                aria-current={currentView === cartView ? 'page' : undefined}
                aria-label={`Carrito, ${cartLabel}`}
                onClick={() => onChangeView(cartView)}
              >
                Carrito
                <span className="navbar__cart-count" aria-hidden="true">
                  {cartItemCount}
                </span>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
