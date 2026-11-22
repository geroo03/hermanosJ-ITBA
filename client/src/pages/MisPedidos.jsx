import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { getMyOrders } from '../services/ordersApi';
import { formatPrice } from '../utils/productHelpers';
import '../styles/orders.css';

function formatDate(date) {
  if (!date) return 'Fecha no disponible';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Fecha no disponible';
  }

  return parsedDate.toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function MisPedidos() {
  const { token } = useAuthContext();
  const location = useLocation();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMyOrders(token);
      setOrders(data);
    } catch (requestError) {
      setError(
        requestError.message || 'No pudimos cargar tus pedidos.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;

    async function fetchOrders() {
      setLoading(true);
      setError('');

      try {
        const data = await getMyOrders(token);

        if (active) {
          setOrders(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || 'No pudimos cargar tus pedidos.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchOrders();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="app-content orders-page" aria-labelledby="orders-title">
      <div className="orders-page__heading">
        <h1 id="orders-title" className="section-heading__title">
          Mis pedidos
        </h1>

        <p className="section-heading__subtitle">
          Consultá las compras que realizaste en Hermanos Jota.
        </p>
      </div>

      {location.state?.success && (
        <p className="orders-success" role="status">
          {location.state.success}
        </p>
      )}

      {loading && (
        <p className="app-message app-message--loading" role="status">
          Cargando tus pedidos…
        </p>
      )}

      {!loading && error && (
        <div className="app-message app-message--error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={loadOrders}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="orders-empty">
          <h2>Todavía no realizaste pedidos</h2>

          <p>
            Cuando realices una compra, vas a poder consultar sus detalles
            desde esta sección.
          </p>

          <Link to="/productos" className="btn btn--primary">
            Explorar catálogo
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => (
            <article
              className="order-card"
              key={order._id}
            >
              <header className="order-card__header">
                <div>
                  <h2>Pedido #{order._id?.slice(-8) || 'Sin número'}</h2>

                  <p>{formatDate(order.createdAt)}</p>
                </div>

                <span className="order-card__status">
                  Registrado
                </span>
              </header>

              <div className="order-card__body">
                <h3>Productos</h3>

                <ul className="order-card__items">
                  {order.items?.map((item, index) => (
                    <li
                      key={`${order._id}-${item.producto || index}`}
                    >
                      <span>
                        {item.nombre} × {item.cantidad}
                      </span>

                      <strong>
                        {formatPrice(
                          Number(item.precio) * Number(item.cantidad),
                        )}
                      </strong>
                    </li>
                  ))}
                </ul>
              </div>

              <footer className="order-card__footer">
                <span>Total del pedido</span>
                <strong>{formatPrice(order.total)}</strong>
              </footer>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default MisPedidos;
