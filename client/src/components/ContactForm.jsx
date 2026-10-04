import { useState } from 'react';
import '../styles/layout.css';

const INITIAL_VALUES = { name: '', email: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MESSAGE_LENGTH = 10;

export function validateContact({ name, email, message }) {
  const errors = {};

  if (!name.trim()) {
    errors.name = 'Ingresá tu nombre.';
  }

  if (!email.trim()) {
    errors.email = 'Ingresá tu email.';
  } else if (!EMAIL_PATTERN.test(email.trim())) {
    errors.email = 'Ingresá un email válido, por ejemplo nombre@correo.com.';
  }

  if (message.trim().length < MIN_MESSAGE_LENGTH) {
    errors.message = `Contanos un poco más (al menos ${MIN_MESSAGE_LENGTH} caracteres).`;
  }

  return errors;
}

function ContactForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submittedName, setSubmittedName] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };

    setValues(nextValues);

    // Una vez mostrado un error, se revalida en vivo para que desaparezca al corregirlo.
    if (errors[name]) {
      setErrors(validateContact(nextValues));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateContact(values);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmittedName(values.name.trim());
    setValues(INITIAL_VALUES);
  }

  if (submittedName) {
    return (
      <section className="contact" aria-labelledby="contact-title">
        <div className="contact__success" role="status">
          <h2 id="contact-title" className="contact__title">¡Gracias, {submittedName}!</h2>
          <p>Recibimos tu mensaje. Te vamos a responder dentro de las próximas 48 horas hábiles.</p>
          <button type="button" className="btn btn--secondary" onClick={() => setSubmittedName('')}>
            Enviar otra consulta
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="contact" aria-labelledby="contact-title">
      <h2 id="contact-title" className="contact__title">Contacto</h2>
      <p className="contact__intro">
        ¿Tenés una consulta sobre una pieza o un proyecto a medida? Escribinos.
      </p>

      <form className="contact__form" onSubmit={handleSubmit} noValidate>
        <Field
          label="Nombre"
          name="name"
          autoComplete="name"
          value={values.name}
          error={errors.name}
          onChange={handleChange}
        />

        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          error={errors.email}
          onChange={handleChange}
        />

        <Field
          label="Mensaje"
          name="message"
          multiline
          value={values.message}
          error={errors.message}
          onChange={handleChange}
        />

        <button type="submit" className="btn btn--primary">
          Enviar consulta
        </button>
      </form>
    </section>
  );
}

function Field({ label, name, error, multiline = false, type = 'text', ...inputProps }) {
  const inputId = `contact-${name}`;
  const errorId = `${inputId}-error`;
  const sharedProps = {
    id: inputId,
    name,
    required: true,
    'aria-invalid': Boolean(error),
    'aria-describedby': error ? errorId : undefined,
    ...inputProps,
  };

  return (
    <div className={`contact__field${error ? ' contact__field--invalid' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      {multiline ? <textarea rows="5" {...sharedProps} /> : <input type={type} {...sharedProps} />}
      {error && (
        <p id={errorId} className="contact__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default ContactForm;
