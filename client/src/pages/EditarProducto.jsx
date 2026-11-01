import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import useProduct from '../hooks/useProduct';
import { updateProduct } from '../services/productsApi';

function EditarProducto(props) {
  const { id } = useParams();
  return <EditarProductoContent key={id} id={id} {...props} />;
}

function EditarProductoContent({ id, onProductUpdated }) {
  const { product, loading, error, retry } = useProduct(id);
  const navigate = useNavigate();
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  async function handleUpdate(values) {
    const updated = await updateProduct(id, values);
    onProductUpdated?.(updated);
    if (!activeRef.current) return;
    navigate(`/productos/${updated._id}`, {
      replace: true,
      state: { success: `Se actualizó “${updated.nombre}” correctamente.` },
    });
  }

  if (loading) return <p className="app-message" role="status">Cargando producto para editar…</p>;
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

  return (
    <section className="app-content admin-page" aria-labelledby="edit-product-title">
      <h1 id="edit-product-title" className="section-heading__title">Editar producto</h1>
      <p className="section-heading__subtitle">Actualizá los datos de “{product.nombre}”.</p>
      <ProductForm key={product._id} initialValues={product} onSubmit={handleUpdate} submitLabel="Guardar cambios" cancelTo={`/productos/${product._id}`} />
    </section>
  );
}

export default EditarProducto;
