import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/layout.css';

export function getCartTotal(cart) {
  return cart.reduce((total, item) => total + Number(item.product.precio) * item.quantity, 0);
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

function Cart({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveFromCart, onCheckout }) {
  const [completedTotal, setCompletedTotal] = useState(null);

  function handleCheckout() {
    setCompletedTotal(getCartTotal(cart));
    onCheckout();
  }

  if (cart.length === 0 && completedTotal !== null) {
    return (
      <section className="cart cart--empty cart--completed" aria-labelledby="cart-title">
        <h1 id="cart-title" className="cart__title">¡Gracias por tu compra!</h1>
        <p role="status">
          El total de tu compra fue {formatPrice(completedTotal)}. Esta tienda es una demostración: no se guardó ningún pedido ni se realizó ningún cobro.
        </p>
        <Link to="/productos" className="btn btn--primary">
          Ver el catálogo
        </Link>
      </section>
    );
  }

  if (cart.length === 0) {
    return (
      <section className="cart cart--empty" aria-labelledby="cart-title">
        <h1 id="cart-title" className="cart__title">Tu carrito</h1>
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
      <h1 id="cart-title" className="cart__title">Tu carrito</h1>

      <ul className="cart__items">
        {cart.map(({ product, quantity }) => {
          return (
            <li key={product._id} className="cart-item">
              <CartItemImage product={product} />

              <div className="cart-item__info">
                <h2 className="cart-item__name">
                  <Link to={`/productos/${product._id}`} className="cart-item__link">
                    {product.nombre}
                  </Link>
                </h2>
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
        <div className="cart__actions">
          <Link to="/productos" className="btn btn--secondary">
            Seguir comprando
          </Link>
          <button type="button" className="btn btn--primary" onClick={handleCheckout}>
            Finalizar compra
          </button>
        </div>
      </div>
    </section>
  );
}

export default Cart;
