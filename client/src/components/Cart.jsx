import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

export function getCartTotal(cart) {
  return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
}

function Cart({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveFromCart, onContinueShopping }) {
  if (cart.length === 0) {
    return (
      <section className="cart cart--empty" aria-labelledby="cart-title">
        <h2 id="cart-title" className="cart__title">Tu carrito</h2>
        <p>Todavía no agregaste piezas a tu carrito.</p>
        <button type="button" className="btn btn--primary" onClick={onContinueShopping}>
          Ver el catálogo
        </button>
      </section>
    );
  }

  const total = getCartTotal(cart);

  return (
    <section className="cart" aria-labelledby="cart-title">
      <h2 id="cart-title" className="cart__title">Tu carrito</h2>

      <ul className="cart__items">
        {cart.map(({ product, quantity }) => (
          <li key={product.id} className="cart-item">
            <img
              className="cart-item__image"
              src={getImageUrl(product.image)}
              alt={product.name}
            />

            <div className="cart-item__info">
              <h3 className="cart-item__name">{product.name}</h3>
              <p className="cart-item__unit-price">{formatPrice(product.price)} c/u</p>
            </div>

            <div className="cart-item__quantity" role="group" aria-label={`Cantidad de ${product.name}`}>
              <button
                type="button"
                aria-label={`Quitar una unidad de ${product.name}`}
                onClick={() => onDecreaseQuantity(product.id)}
              >
                −
              </button>
              <span aria-live="polite">{quantity}</span>
              <button
                type="button"
                aria-label={`Agregar una unidad de ${product.name}`}
                onClick={() => onIncreaseQuantity(product.id)}
              >
                +
              </button>
            </div>

            <p className="cart-item__subtotal">{formatPrice(product.price * quantity)}</p>

            <button
              type="button"
              className="cart-item__remove"
              onClick={() => onRemoveFromCart(product.id)}
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
        <button type="button" className="btn btn--secondary" onClick={onContinueShopping}>
          Seguir comprando
        </button>
      </div>
    </section>
  );
}

export default Cart;
