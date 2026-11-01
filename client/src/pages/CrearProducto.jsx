import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import { createProduct } from '../services/productsApi';

function CrearProducto() {
  const navigate = useNavigate();
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => { activeRef.current = false; };
  }, []);

  async function handleCreate(values) {
    const product = await createProduct(values);
    if (activeRef.current) {
      navigate('/productos', { state: { success: `Se creó “${product.nombre}” correctamente.` } });
    }
  }

  return (
    <section className="app-content admin-page" aria-labelledby="create-product-title">
      <h1 id="create-product-title" className="section-heading__title">Nuevo producto</h1>
      <p className="section-heading__subtitle">Agregá una pieza al catálogo de Hermanos Jota.</p>
      <ProductForm onSubmit={handleCreate} submitLabel="Crear producto" />
    </section>
  );
}

export default CrearProducto;
