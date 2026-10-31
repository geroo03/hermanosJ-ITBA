import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

export function getCartTotal(cart) {
  return cart.reduce((total, item) => total + Number(item.product.precio) * item.quantity, 0);
}

function Cart({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveFromCart }) {
  if (cart.length === 0) {
    return (
      <section className="cart cart--empty" aria-labelledby="cart-title">
        <h2 id="cart-title" className="cart__title">Tu carrito</h2>
        <p>Todavía no agregaste piezas a tu carrito.</p>
        <Link to="/productos" className="btn btn--primary">
          Ver el catálogo
        </Link>
      </section>
    );
  }

  const total = getCartTotal(cart);

  return (
    <section className="cart" aria-labelledby="cart-title">
      <h2 id="cart-title" className="cart__title">Tu carrito</h2>

      <ul className="cart__items">
        {cart.map(({ product, quantity }) => {
          const imageSrc = getImageUrl(product.imagenUrl);

          return (
            <li key={product._id} className="cart-item">
              {imageSrc ? (
                <img
                  className="cart-item__image"
                  src={imageSrc}
                  alt={product.nombre}
                />
              ) : (
                <div className="cart-item__image" aria-hidden="true" />
              )}

              <div className="cart-item__info">
                <h3 className="cart-item__name">
                  <Link to={`/productos/${product._id}`} className="cart-item__link">
                    {product.nombre}
                  </Link>
                </h3>
                <p className="cart-item__unit-price">{formatPrice(product.precio)} c/u</p>
              </div>

              <div className="cart-item__quantity" role="group" aria-label={`Cantidad de ${product.nombre}`}>
                <button
                  type="button"
                  aria-label={`Quitar una unidad de ${product.nombre}`}
                  onClick={() => onDecreaseQuantity(product._id)}
                >
                  −
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  type="button"
                  aria-label={`Agregar una unidad de ${product.nombre}`}
                  onClick={() => onIncreaseQuantity(product._id)}
                >
                  +
                </button>
              </div>

              <p className="cart-item__subtotal">{formatPrice(product.precio * quantity)}</p>

              <button
                type="button"
                className="cart-item__remove"
                onClick={() => onRemoveFromCart(product._id)}
              >
                Eliminar
              </button>
            </li>
          );
        })}
      </ul>

      <div className="cart__summary">
        <p className="cart__total">
          Total <strong>{formatPrice(total)}</strong>
        </p>
        <Link to="/productos" className="btn btn--secondary">
          Seguir comprando
        </Link>
      </div>
    </section>
  );
}

export default Cart;
