
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { useCartContext } from '../context/CartContext';
import { getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

const DEFAULT_LINKS = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/productos', label: 'Catálogo' },
  { to: '/contacto', label: 'Contacto' },
];

function Navbar() {
  const { user, isAuthenticated, logout, loading } = useAuthContext();
  const { cartItemCount } = useCartContext();
  const navigate = useNavigate();

  const cartLabel =
    cartItemCount === 1 ? '1 producto' : `${cartItemCount} productos`;

  function handleLogout() {
    logout();
    navigate('/', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand">
          <img
            src={getImageUrl('assets/images/logo.svg')}
            alt=""
            className="navbar__logo"
            width="44"
            height="44"
          />
          <span className="navbar__brand-text">
            <span className="navbar__brand-name">Hermanos Jota</span>
            <span className="navbar__brand-tagline">
              Casa Taller y Ebanistería
            </span>
          </span>
        </Link>

        <nav aria-label="Navegación principal">
          <ul className="navbar__links">
            {DEFAULT_LINKS.map(({ to, label, end }) => (
              <li key={to}>
                <NavLink to={to} end={end} className="navbar__link">
                  {label}
                </NavLink>
              </li>
            ))}

            {!loading && (
              <>
                {isAuthenticated ? (
                  <>
                    <li>
                      <span className="navbar__link">
                        Hola, {user?.nombre || 'usuario'}
                      </span>
                    </li>

                    <li>
                      <NavLink to="/mis-pedidos" className="navbar__link">
                        Mis pedidos
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/perfil" className="navbar__link">
                        Perfil
                      </NavLink>
                    </li>

                    {user?.rol === 'admin' && (
                      <li>
                        <NavLink
                          to="/admin/crear-producto"
                          className="navbar__link"
                        >
                          Crear producto
                        </NavLink>
                      </li>
                    )}

                    <li>
                      <button
                        type="button"
                        className="navbar__link"
                        onClick={handleLogout}
                      >
                        Salir
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <NavLink to="/login" className="navbar__link">
                        Ingresar
                      </NavLink>
                    </li>

                    <li>
                      <NavLink to="/registro" className="navbar__link">
                        Crear cuenta
                      </NavLink>
                    </li>
                  </>
                )}
              </>
            )}

            <li>
              <NavLink
                to="/carrito"
                className="navbar__link navbar__cart"
                aria-label={`Carrito, ${cartLabel}`}
              >
                Carrito
                <span
                  key={cartItemCount}
                  className="navbar__cart-count"
                  aria-hidden="true"
                >
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
