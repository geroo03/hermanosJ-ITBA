import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteProduct } from '../services/productsApi';
import useProduct from '../hooks/useProduct';
import { formatPrice, getImageUrl } from '../utils/productHelpers';
import '../styles/products.css';

function ProductDetail(props) {
  const { id } = useParams();
  return <ProductDetailContent key={id} id={id} {...props} />;
}

function ProductDetailContent({ id, onAddToCart, onProductDeleted }) {
  const { product, loading, error, retry } = useProduct(id);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [cartMessage, setCartMessage] = useState('');
  const [imageFailed, setImageFailed] = useState(false);
  const pendingRef = useRef(false);
  const activeRef = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  async function handleDelete() {
    if (pendingRef.current || !window.confirm(`¿Querés eliminar “${product.nombre}”? Esta acción no se puede deshacer.`)) {
      return;
    }

    pendingRef.current = true;
    setDeleting(true);
    setDeleteError('');
    try {
      await deleteProduct(id);
      onProductDeleted?.(product._id);
      if (!activeRef.current) return;
      navigate('/productos', {
        replace: true,
        state: { success: `Se eliminó “${product.nombre}” correctamente.` },
      });
    } catch (requestError) {
      if (activeRef.current) setDeleteError(requestError.message || 'No pudimos eliminar el producto. Intentá nuevamente.');
    } finally {
      pendingRef.current = false;
      if (activeRef.current) setDeleting(false);
    }
  }

  if (loading) return <p className="app-message" role="status">Cargando producto…</p>;

  if (error || !product) {
    return (
      <section className="app-message app-message--error" role="alert">
        <h1>{error?.status === 404 || !error ? 'Producto no encontrado' : 'No pudimos cargar el producto'}</h1>
        <p>{error?.message || 'El producto solicitado no está disponible.'}</p>
        {error?.status !== 404 && <button type="button" className="btn btn--secondary" onClick={retry}>Reintentar</button>}
        <Link to="/productos" className="btn btn--secondary">Volver al catálogo</Link>
      </section>
    );
  }

  const imageSrc = getImageUrl(product.imagenUrl);

  return (
    <article className="app-content product-detail" aria-labelledby="product-title">
      <Link to="/productos" className="btn btn--secondary">← Volver al catálogo</Link>
      <div className="product-detail__layout">
        {imageSrc && !imageFailed ? (
          <img className="product-detail__image" src={imageSrc} alt={product.nombre} onError={() => setImageFailed(true)} />
        ) : (
          <div className="product-detail__placeholder">Imagen no disponible</div>
        )}
        <div className="product-detail__info">
          <h1 id="product-title" className="product-detail__name">{product.nombre}</h1>
          <p className="product-detail__price">{formatPrice(product.precio)}</p>
          <p className="product-detail__stock">
            {typeof product.stock === 'number' ? `Stock disponible: ${product.stock}` : 'Stock no informado'}
          </p>
          <p className="product-detail__description">{product.descripcion || 'Sin descripción disponible.'}</p>
          <button type="button" className="btn btn--primary" disabled={deleting} onClick={() => {
            onAddToCart(product);
            setCartMessage(`Se agregó “${product.nombre}” al carrito.`);
          }}>
            Agregar al carrito
          </button>
          {cartMessage && <p className="product-detail__notice" role="status">{cartMessage}</p>}
          <div className="product-detail__management">
            <h2>Administrar producto</h2>
            <div className="product-card__actions">
              <Link to={`/admin/editar-producto/${product._id}`} className="btn btn--secondary" aria-disabled={deleting} tabIndex={deleting ? -1 : undefined} onClick={(event) => {
                if (pendingRef.current) event.preventDefault();
              }}>Editar</Link>
              <button type="button" className="btn btn--danger" disabled={deleting} onClick={handleDelete}>
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </button>
            </div>
            {deleting && <p role="status">Eliminando producto…</p>}
            {deleteError && <p className="product-detail__error" role="alert">{deleteError}</p>}
          </div>
        </div>
      </div>
    </article>
  );
}

export default ProductDetail;
