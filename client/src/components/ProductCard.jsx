// Importa las funciones auxiliares (formateo de precio, URL de imagen y truncado de texto)
import { formatPrice, getImageUrl, truncate } from '../utils/productHelpers';
// Importa los estilos CSS específicos para la tarjeta de producto
import '../styles/products.css';

/**
 * Componente funcional React que representa la tarjeta visual de un producto.
 * 
 * @param {Object} props - Propiedades del componente.
 * @param {Object} props.product - Objeto con los datos del producto.
 * @param {Function} props.onViewDetail - Función callback para ver los detalles del producto.
 * @param {Function} props.onAddToCart - Función callback para añadir el producto al carrito.
 */
function ProductCard({ product, onViewDetail, onAddToCart }) {
  // Desestructura las propiedades principales necesarias desde el objeto 'product'
  const { name, price, image, description, category } = product;

  return (
    // Elemento HTML semántico 'article' con metodología de clases BEM (Block Element Modifier)
    <article className="product-card">
      {/* Imagen del producto con lazy loading para optimizar el rendimiento de carga */}
      <img
        className="product-card__image"
        src={getImageUrl(image)} // Procesa la ruta o URL de la imagen
        alt={name}               // Texto alternativo accesible para la imagen
        loading="lazy"           // Carga diferida según visibilidad en pantalla
      />

      {/* Contenedor principal con la información textual del producto */}
      <div className="product-card__body">
        {/* Categoría a la que pertenece el producto */}
        <p className="product-card__category">{category}</p>

        {/* Título o nombre del producto */}
        <h3 className="product-card__name">{name}</h3>

        {/* Descripción corta truncada automáticamente a 110 caracteres */}
        <p className="product-card__description">{truncate(description)}</p>

        {/* Precio del producto formateado en moneda local ($) */}
        <p className="product-card__price">{formatPrice(price)}</p>

        {/* Contenedor de acciones (botones interactivos) */}
        <div className="product-card__actions">
          {/* Botón para ver la vista detallada del producto */}
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => onViewDetail(product)} // Pasa el objeto completo del producto a la función enviada por prop
          >
            Ver detalle
          </button>

          {/* Botón para agregar el producto directamente al carrito de compras */}
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => onAddToCart(product)} // Pasa el objeto completo del producto a la función enviada por prop
          >
            Agregar al carrito
          </button>
        </div>
      </div>
    </article>
  );
}

// Exporta el componente por defecto para poder utilizarlo en listas o grillas de productos
export default ProductCard;