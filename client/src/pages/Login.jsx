import { useEffect, useRef } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuthContext } from '../context/AuthContext';
import '../styles/auth.css';

export function getRedirectTarget(state) {
  const from = state?.from;
  let target = '/';

  if (typeof from === 'string' && from.startsWith('/') && !from.startsWith('//')) {
    target = from;
  } else if (
    from &&
    typeof from === 'object' &&
    typeof from.pathname === 'string' &&
    from.pathname.startsWith('/') &&
    !from.pathname.startsWith('//')
  ) {
    target = `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`;
  }

  if (target === '/login' || target === '/registro') {
    return '/';
  }

  return target;
}

function Login() {
  const { isAuthenticated, loading, login } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const activeRef = useRef(true);
  const submittedRef = useRef(false);
  const redirectTarget = getRedirectTarget(location.state);
  const cameFromProtectedRoute = Boolean(location.state?.from);

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

  async function handleLogin({ email, password }) {
    submittedRef.current = true;
    try {
      const { user } = await login(email, password);
      if (activeRef.current) {
        navigate(redirectTarget, {
          replace: true,
          state: {
            success: user?.nombre
              ? `¡Hola, ${user.nombre}! Iniciaste sesión correctamente.`
              : 'Iniciaste sesión correctamente.',
          },
        });
      }
    } catch (error) {
      submittedRef.current = false;
      throw error;
    }
  }

  return (
    <section className="app-content auth-page" aria-labelledby="login-title">
      <h1 id="login-title" className="section-heading__title">
        Iniciar sesión
      </h1>
      <p className="section-heading__subtitle">
        Ingresá a tu cuenta de Hermanos Jota para finalizar tus compras y consultar tus pedidos.
      </p>

      {cameFromProtectedRoute && (
        <p className="auth-page__notice" role="status">
          Iniciá sesión para continuar hacia la sección solicitada.
        </p>
      )}

      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        submitLabel="Ingresar"
        submittingLabel="Ingresando…"
        hint="Ingresá el email y la contraseña de tu cuenta."
      />

      <p className="auth-page__footer">
        ¿Todavía no tenés cuenta?{' '}
        <Link to="/registro" state={location.state} className="auth-page__link">
          Crear cuenta
        </Link>
      </p>
    </section>
  );
}

export default Login;
