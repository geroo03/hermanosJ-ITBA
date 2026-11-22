import { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCartContext } from '../context/CartContext';
import { useAuthContext } from '../context/AuthContext';
import { createOrder } from '../services/ordersApi';
import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

export function getCartTotal(cart) {
  return cart.reduce(
    (total, item) =>
      total + Number(item.product.precio) * item.quantity,
    0,
  );
}

function CartItemImage({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getImageUrl(product.imagenUrl);

  if (!imageSrc || imageFailed) {
    return <div className="cart-item__image" aria-hidden="true" />;
  }

  return (
    <img
      className="cart-item__image"
      src={imageSrc}
      alt={product.nombre}
      onError={() => setImageFailed(true)}
    />
  );
}

function Cart() {
  const {
    cart,
    total,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCartContext();

  const { token, isAuthenticated, loading: authLoading } = useAuthContext();

  const navigate = useNavigate();
  const location = useLocation();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const pendingRef = useRef(false);

  async function handleCheckout() {
    if (pendingRef.current || cart.length === 0 || authLoading) {
      return;
    }

    if (!isAuthenticated || !token) {
      navigate('/login', {
        state: { from: location },
      });
      return;
    }

    pendingRef.current = true;
    setSubmitting(true);
    setError('');

    try {
      const items = cart.map(({ product, quantity }) => ({
        producto: product._id,
        cantidad: quantity,
      }));

      await createOrder(items, token);

      clearCart();

      navigate('/mis-pedidos', {
        replace: true,
        state: {
          success: '¡Tu pedido se realizó correctamente!',
        },
      });
    } catch (requestError) {
      setError(
        requestError.message ||
          'No pudimos finalizar tu compra. Intentá nuevamente.',
      );
    } finally {
      pendingRef.current = false;
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <section className="cart cart--empty" aria-labelledby="cart-title">
        <h1 id="cart-title" className="cart__title">
          Tu carrito
        </h1>

        <p>Todavía no agregaste piezas a tu carrito.</p>

        <Link to="/productos" className="btn btn--primary">
          Ver el catálogo
        </Link>
      </section>
    );
  }

  return (
    <section className="cart" aria-labelledby="cart-title">
      <h1 id="cart-title" className="cart__title">
        Tu carrito
      </h1>

      <ul className="cart__items">
        {cart.map(({ product, quantity }) => (
          <li key={product._id} className="cart-item">
            <CartItemImage product={product} />

            <div className="cart-item__info">
              <h2 className="cart-item__name">
                <Link
                  to={`/productos/${product._id}`}
                  className="cart-item__link"
                >
                  {product.nombre}
                </Link>
              </h2>

              <p className="cart-item__unit-price">
                {formatPrice(product.precio)} c/u
              </p>
            </div>

            <div
              className="cart-item__quantity"
              role="group"
              aria-label={`Cantidad de ${product.nombre}`}
            >
              <button
                type="button"
                aria-label={`Quitar una unidad de ${product.nombre}`}
                disabled={submitting}
                onClick={() => decreaseQuantity(product._id)}
              >
                −
              </button>

              <span aria-live="polite">{quantity}</span>

              <button
                type="button"
                aria-label={`Agregar una unidad de ${product.nombre}`}
                disabled={submitting}
                onClick={() => increaseQuantity(product._id)}
              >
                +
              </button>
            </div>

            <p className="cart-item__subtotal">
              {formatPrice(Number(product.precio) * quantity)}
            </p>

            <button
              type="button"
              className="cart-item__remove"
              disabled={submitting}
              onClick={() => removeFromCart(product._id)}
            >
              Eliminar
            </button>
          </li>
        ))}
      </ul>

      <div className="cart__summary">
        <p className="cart__total">
          Total <strong>{formatPrice(total)}</strong>
        </p>

        <div className="cart__actions">
          <Link to="/productos" className="btn btn--secondary">
            Seguir comprando
          </Link>

          <button
            type="button"
            className="btn btn--primary"
            onClick={handleCheckout}
            disabled={submitting || authLoading}
          >
            {submitting
              ? 'Procesando pedido…'
              : authLoading
                ? 'Verificando sesión…'
                : 'Finalizar compra'}
          </button>
        </div>
      </div>

      {error && (
        <p className="app-message app-message--error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default Cart;
