import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { getProfile } from '../services/authApi';
import '../styles/orders.css';

function formatDate(date) {
  if (!date) return 'No disponible';

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No disponible';
  }

  return parsedDate.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function Perfil() {
  const { user, token } = useAuthContext();

  const [profile, setProfile] = useState(user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getProfile(token);
      setProfile(data);
    } catch (requestError) {
      setError(
        requestError.message || 'No pudimos cargar tus datos.',
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let active = true;

    async function fetchProfile() {
      setLoading(true);
      setError('');

      try {
        const data = await getProfile(token);

        if (active) {
          setProfile(data);
        }
      } catch (requestError) {
        if (active) {
          setError(
            requestError.message || 'No pudimos cargar tus datos.',
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchProfile();

    return () => {
      active = false;
    };
  }, [token]);

  return (
    <section className="app-content orders-page" aria-labelledby="profile-title">
      <div className="orders-page__heading">
        <h1 id="profile-title" className="section-heading__title">
          Mi perfil
        </h1>

        <p className="section-heading__subtitle">
          Consultá los datos de tu cuenta de Hermanos Jota.
        </p>
      </div>

      {loading && (
        <p className="app-message app-message--loading" role="status">
          Cargando tus datos…
        </p>
      )}

      {!loading && error && (
        <div className="app-message app-message--error" role="alert">
          <p>{error}</p>

          <button
            type="button"
            className="btn btn--secondary"
            onClick={loadProfile}
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && profile && (
        <article className="account-card">
          <div className="account-card__header">
            <h2>Información personal</h2>
            <span className="account-card__role">
              {profile.rol || 'cliente'}
            </span>
          </div>

          <dl className="account-card__details">
            <div>
              <dt>Nombre</dt>
              <dd>{profile.nombre || 'No disponible'}</dd>
            </div>

            <div>
              <dt>Correo electrónico</dt>
              <dd>{profile.email || 'No disponible'}</dd>
            </div>

            <div>
              <dt>Fecha de registro</dt>
              <dd>{formatDate(profile.createdAt)}</dd>
            </div>

            <div>
              <dt>Identificador de usuario</dt>
              <dd>{profile._id || 'No disponible'}</dd>
            </div>
          </dl>
        </article>
      )}
    </section>
  );
}

export default Perfil;
