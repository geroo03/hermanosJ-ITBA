import { Link, NavLink } from 'react-router-dom';
import { getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

const DEFAULT_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Catálogo' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/admin/crear-producto', label: 'Crear producto' },
];

function Navbar({ links = DEFAULT_LINKS, cartItemCount = 0 }) {
  const cartLabel = cartItemCount === 1 ? '1 producto' : `${cartItemCount} productos`;

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <img src={getImageUrl('assets/images/logo.svg')} alt="" className="navbar__logo" width="44" height="44" />
          <span className="navbar__brand-text">
            <span className="navbar__brand-name">Hermanos Jota</span>
            <span className="navbar__brand-tagline">Casa Taller y Ebanistería</span>
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="navbar__links">
            {links.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className="navbar__link">
                  {label}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink
                to="/carrito"
                className="navbar__link navbar__cart"
                aria-label={`Carrito, ${cartLabel}`}
              >
                Carrito
                <span className="navbar__cart-count" aria-hidden="true">
                  {cartItemCount}
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
