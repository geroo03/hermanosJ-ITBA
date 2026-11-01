import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getImageUrl, truncate } from '../utils/productHelpers';
import '../styles/products.css';

/**
 * Tarjeta visual de un producto del catálogo conectada a React Router.
 */
function ProductCard({ product, onAddToCart }) {
  const { _id, nombre, descripcion, precio, imagenUrl } = product;
  const detailPath = `/productos/${_id}`;
  const imageSrc = getImageUrl(imagenUrl);
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="product-card">
      {imageSrc && !imageFailed ? (
        <Link to={detailPath} className="product-card__media-link" tabIndex={-1} aria-hidden="true">
          <img
            className="product-card__image"
            src={imageSrc}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        </Link>
      ) : (
        <div className="product-card__image product-card__image--placeholder" aria-hidden="true" />
      )}

      <div className="product-card__body">
        <h3 className="product-card__name">
          <Link to={detailPath} className="product-card__title-link">
            {nombre}
          </Link>
        </h3>

        {descripcion && (
          <p className="product-card__description">{truncate(descripcion)}</p>
        )}

        <p className="product-card__price">{formatPrice(precio)}</p>

        <div className="product-card__actions">
          <Link to={detailPath} className="btn btn--secondary">
            Ver detalle
          </Link>

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

export default ProductCard;
