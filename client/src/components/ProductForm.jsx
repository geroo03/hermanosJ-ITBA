import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/admin.css';

export function validateProduct(values) {
  const errors = {};
  if (!values.nombre.trim()) errors.nombre = 'Ingresá el nombre del producto.';
  if (!values.precio.trim()) {
    errors.precio = 'Ingresá el precio del producto.';
  } else if (!Number.isFinite(Number(values.precio)) || Number(values.precio) < 0) {
    errors.precio = 'El precio debe ser un número igual o mayor que cero.';
  }
  if (values.stock.trim() && (!Number.isFinite(Number(values.stock)) || Number(values.stock) < 0)) {
    errors.stock = 'El stock debe ser un número igual o mayor que cero.';
  }
  return errors;
}

function ProductForm({ initialValues = {}, onSubmit, submitLabel = 'Guardar producto', cancelTo = '/productos' }) {
  const [values, setValues] = useState(() => ({
    nombre: initialValues.nombre ?? '',
    descripcion: initialValues.descripcion ?? '',
    precio: String(initialValues.precio ?? ''),
    stock: String(initialValues.stock ?? ''),
    imagenUrl: initialValues.imagenUrl ?? '',
  }));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pendingRef = useRef(false);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setSubmitError('');
    if (errors[name]) setErrors(validateProduct(nextValues));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pendingRef.current) return;
    const form = event.currentTarget;
    const nextErrors = validateProduct(values);
    for (const name of ['precio', 'stock']) {
      if (form.elements.namedItem(name).validity.badInput) {
        nextErrors[name] = `Ingresá un número válido para ${name === 'precio' ? 'el precio' : 'el stock'}.`;
      }
    }
    setErrors(nextErrors);
    setSubmitError('');
    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      form.elements.namedItem(firstInvalidField).focus();
      return;
    }

    pendingRef.current = true;
    setSubmitting(true);
    try {
      await onSubmit({
        nombre: values.nombre.trim(),
        descripcion: values.descripcion.trim(),
        precio: Number(values.precio),
        stock: values.stock.trim() ? Number(values.stock) : 0,
        imagenUrl: values.imagenUrl.trim(),
      });
    } catch (requestError) {
      setSubmitError(requestError.message || 'No pudimos guardar el producto. Intentá nuevamente.');
    } finally {
      pendingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      <p className="product-form__hint">Nombre y precio son obligatorios. Si dejás el stock vacío, se guardará como 0.</p>
      <fieldset disabled={submitting}>
        <legend className="product-form__legend">Datos del producto</legend>
        <Field label="Nombre" name="nombre" required value={values.nombre} error={errors.nombre} onChange={handleChange} />
        <Field label="Descripción" name="descripcion" multiline value={values.descripcion} onChange={handleChange} />
        <div className="product-form__numbers">
          <Field label="Precio (ARS)" name="precio" type="number" min="0" step="any" required value={values.precio} error={errors.precio} onChange={handleChange} />
          <Field label="Stock" name="stock" type="number" min="0" step="any" value={values.stock} error={errors.stock} onChange={handleChange} />
        </div>
        <Field label="Imagen (URL o ruta)" name="imagenUrl" value={values.imagenUrl} onChange={handleChange} hint="Podés usar una URL https:// o una ruta como assets/images/mesa.png." />
      </fieldset>
      {Object.keys(errors).length > 0 && <p className="product-form__error" role="alert">Revisá los campos indicados antes de guardar.</p>}
      {submitError && <p className="product-form__error product-form__api-error" role="alert">{submitError}</p>}
      <div className="product-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>{submitting ? 'Guardando…' : submitLabel}</button>
        <Link to={cancelTo} className="btn btn--secondary" aria-disabled={submitting} tabIndex={submitting ? -1 : undefined} onClick={(event) => {
          if (pendingRef.current) event.preventDefault();
        }}>Cancelar</Link>
      </div>
      {submitting && <p className="product-form__hint" role="status">Guardando producto…</p>}
    </form>
  );
}

function Field({ label, name, error, hint, multiline = false, type = 'text', ...props }) {
  const id = `product-${name}`;
  const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  const sharedProps = { id, name, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, ...props };

  return (
    <div className="product-form__field">
      <label htmlFor={id}>{label}{props.required ? ' (obligatorio)' : ''}</label>
      {multiline ? <textarea rows="5" {...sharedProps} /> : <input type={type} {...sharedProps} />}
      {hint && <p id={`${id}-hint`} className="product-form__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="product-form__error">{error}</p>}
    </div>
  );
}

export default ProductForm;
