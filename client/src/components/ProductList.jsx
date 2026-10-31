import ProductCard from './ProductCard';
import '../styles/products.css';

function ProductList({ products, onAddToCart }) {
  if (products.length === 0) {
    return <p>No hay productos disponibles por el momento.</p>;
  }

  return (
    <div className="product-list">
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}

export default ProductList;
