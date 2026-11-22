import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuthContext } from '../context/AuthContext';
import { getRedirectTarget } from './Login';
import '../styles/auth.css';

function Registro() {
  const { isAuthenticated, loading, register } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const activeRef = useRef(true);
  const submittedRef = useRef(false);
  const redirectTarget = getRedirectTarget(location.state);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="app-content auth-status" aria-live="polite">
        <p className="app-message app-message--loading" role="status">
          Verificando sesión…
        </p>
      </section>
    );
  }

  if (isAuthenticated && !submittedRef.current) {
    return <Navigate to={redirectTarget} replace />;
  }

  async function handleRegister({ nombre, email, password }) {
    submittedRef.current = true;
    try {
      const { user } = await register({ nombre, email, password });
      if (activeRef.current) {
        navigate(redirectTarget, {
          replace: true,
          state: {
            success: user?.nombre
              ? `¡Hola, ${user.nombre}! Tu cuenta fue creada correctamente.`
              : 'Tu cuenta fue creada correctamente.',
          },
        });
      }
    } catch (error) {
      submittedRef.current = false;
      throw error;
    }
  }

  return (
    <section className="app-content auth-page" aria-labelledby="register-title">
      <h1 id="register-title" className="section-heading__title">
        Crear cuenta
      </h1>
      <p className="section-heading__subtitle">
        Registrate en Hermanos Jota para guardar tus pedidos y gestionar tus compras.
      </p>

      <AuthForm
        mode="register"
        onSubmit={handleRegister}
        submitLabel="Crear cuenta"
        submittingLabel="Creando cuenta…"
        hint="Completá tus datos para crear tu cuenta de cliente."
      />

      <p className="auth-page__footer">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" state={location.state} className="auth-page__link">
          Ingresar
        </Link>
      </p>
    </section>
  );
}

export default Registro;
