import ProductCard from './ProductCard';
import '../styles/products.css';

function ProductList({ products, onViewDetail, onAddToCart }) {
  if (products.length === 0) {
    return <p>No hay productos disponibles por el momento.</p>;
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onViewDetail={onViewDetail}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default ProductList;