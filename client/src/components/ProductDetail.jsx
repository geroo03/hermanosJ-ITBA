import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/products.css';

function ProductDetail({ product, onBack, onAddToCart }) {
  const { name, price, image, description, category } = product;

  return (
    <article className="product-detail">
      <button type="button" className="btn btn--secondary" onClick={onBack}>
        ← Volver al catálogo
      </button>

      <div className="product-detail__layout">
        <img
          className="product-detail__image"
          src={getImageUrl(image)}
          alt={name}
        />

        <div className="product-detail__info">
          <p className="product-card__category">{category}</p>
          <h2 className="product-detail__name">{name}</h2>
          <p className="product-detail__price">{formatPrice(price)}</p>
          <p className="product-detail__description">{description}</p>

          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onAddToCart(product)}
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductDetail;