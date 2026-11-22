import { useEffect, useRef, useState } from 'react';
import '../styles/auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateAuthForm(values, mode = 'login') {
  const errors = {};

  if (mode === 'register' && !values.nombre.trim()) {
    errors.nombre = 'Ingresá tu nombre.';
  }

  const trimmedEmail = values.email.trim();
  if (!trimmedEmail) {
    errors.email = 'Ingresá tu email.';
  } else if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.email = 'Ingresá un email válido.';
  }

  if (!values.password) {
    errors.password = 'Ingresá tu contraseña.';
  } else if (mode === 'register' && values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  return errors;
}

function AuthForm({
  mode = 'login',
  onSubmit,
  submitLabel,
  submittingLabel,
  legend,
  hint,
}) {
  const isRegister = mode === 'register';
  const [values, setValues] = useState({ nombre: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const pendingRef = useRef(false);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);
    setSubmitError('');

    if (errors[name]) {
      setErrors(validateAuthForm(nextValues, mode));
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (pendingRef.current) return;

    const form = event.currentTarget;
    const nextErrors = validateAuthForm(values, mode);
    setErrors(nextErrors);
    setSubmitError('');

    const firstInvalidField = Object.keys(nextErrors)[0];
    if (firstInvalidField) {
      form.elements.namedItem(firstInvalidField)?.focus();
      return;
    }

    pendingRef.current = true;
    setSubmitting(true);

    const payload = isRegister
      ? {
          nombre: values.nombre.trim(),
          email: values.email.trim(),
          password: values.password,
        }
      : {
          email: values.email.trim(),
          password: values.password,
        };

    try {
      await onSubmit(payload);
    } catch (requestError) {
      if (activeRef.current) {
        setSubmitError(
          requestError?.message ||
            (isRegister
              ? 'No pudimos crear tu cuenta. Intentá nuevamente.'
              : 'No pudimos iniciar sesión. Intentá nuevamente.'),
        );
      }
    } finally {
      pendingRef.current = false;
      if (activeRef.current) {
        setSubmitting(false);
      }
    }
  }

  const resolvedSubmitLabel = submitLabel || (isRegister ? 'Crear cuenta' : 'Ingresar');
  const resolvedSubmittingLabel =
    submittingLabel || (isRegister ? 'Creando cuenta…' : 'Ingresando…');
  const resolvedLegend = legend || (isRegister ? 'Datos de tu cuenta' : 'Credenciales de acceso');

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate aria-busy={submitting}>
      {hint && <p className="auth-form__hint">{hint}</p>}

      <fieldset disabled={submitting}>
        <legend className="auth-form__legend">{resolvedLegend}</legend>

        {isRegister && (
          <AuthField
            id="auth-nombre"
            label="Nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            value={values.nombre}
            error={errors.nombre}
            onChange={handleChange}
          />
        )}

        <AuthField
          id="auth-email"
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={values.email}
          error={errors.email}
          onChange={handleChange}
        />

        <AuthField
          id="auth-password"
          label="Contraseña"
          name="password"
          type="password"
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          required
          value={values.password}
          error={errors.password}
          hint={isRegister ? `Debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.` : undefined}
          onChange={handleChange}
        />
      </fieldset>

      {Object.keys(errors).length > 0 && (
        <p className="auth-form__error" role="alert">
          Revisá los campos indicados antes de continuar.
        </p>
      )}

      {submitError && (
        <p className="auth-form__error auth-form__api-error" role="alert">
          {submitError}
        </p>
      )}

      <div className="auth-form__actions">
        <button type="submit" className="btn btn--primary" disabled={submitting}>
          {submitting ? resolvedSubmittingLabel : resolvedSubmitLabel}
        </button>
      </div>

      {submitting && (
        <p className="auth-form__hint" role="status">
          {resolvedSubmittingLabel}
        </p>
      )}
    </form>
  );
}

function AuthField({ id, label, name, error, hint, type = 'text', ...props }) {
  const describedBy =
    [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;

  return (
    <div className="auth-form__field">
      <label htmlFor={id}>
        {label}
        {props.required ? ' (obligatorio)' : ''}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy}
        {...props}
      />
      {hint && (
        <p id={`${id}-hint`} className="auth-form__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="auth-form__error">
          {error}
        </p>
      )}
    </div>
  );
}

export default AuthForm;
