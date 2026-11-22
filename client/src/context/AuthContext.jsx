import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getProfile, loginUser, registerUser } from '../services/authApi';

export const TOKEN_STORAGE_KEY = 'hermanos-jota-token';

export const AuthContext = createContext(null);

/**
 * Decodifica el payload de un JWT (Base64URL) sin verificar la firma criptográfica.
 * La validez definitiva siempre la confirma el backend mediante GET /api/auth/perfil.
 */
export function decodeJwtPayload(token) {
  if (typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 3 || !parts[1]) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const remainder = base64.length % 4;
    if (remainder === 1) return null;

    const padded = remainder === 0 ? base64 : base64.padEnd(base64.length + (4 - remainder), '=');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json =
      typeof TextDecoder !== 'undefined'
        ? new TextDecoder().decode(bytes)
        : decodeURIComponent(
            Array.from(bytes, (byte) => `%${byte.toString(16).padStart(2, '0')}`).join(''),
          );
    const payload = JSON.parse(json);

    return payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(payload) {
  if (!payload) return true;
  if (typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 <= Date.now();
}

function readStoredToken() {
  try {
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    return typeof stored === 'string' && stored.trim() ? stored.trim() : null;
  } catch {
    return null;
  }
}

function writeStoredToken(token) {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // La sesión sigue funcionando en memoria si el almacenamiento local no está disponible.
  }
}

function removeStoredToken() {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Sin acción si localStorage no está disponible.
  }
}

function mergeUserWithPayload(user, payload) {
  if (!user && !payload) return null;

  const base = user && typeof user === 'object' ? { ...user } : {};

  if (base._id == null && payload?.id != null) {
    base._id = payload.id;
  }
  if (base.rol == null && payload?.rol != null) {
    base.rol = payload.rol;
  }

  return base;
}

function inspectStoredToken() {
  const stored = readStoredToken();
  if (!stored) return { token: null, shouldClear: false };

  const payload = decodeJwtPayload(stored);
  if (!payload || !payload.id || isTokenExpired(payload)) {
    return { token: null, shouldClear: true };
  }

  return { token: stored, shouldClear: false };
}

export function AuthProvider({ children }) {
  const [initialCheck] = useState(inspectStoredToken);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(initialCheck.token));
  const sessionVersionRef = useRef(0);

  // Restaura la sesión al recargar validando el token guardado contra GET /api/auth/perfil.
  useEffect(() => {
    if (initialCheck.shouldClear) {
      removeStoredToken();
      return undefined;
    }

    if (!initialCheck.token) return undefined;

    let active = true;
    const initialToken = initialCheck.token;
    const version = sessionVersionRef.current;
    const payload = decodeJwtPayload(initialToken);

    if (!payload || !payload.id || isTokenExpired(payload)) {
      removeStoredToken();
      setToken(null);
      setUser(null);
      setLoading(false);
      return undefined;
    }

    async function restoreSession() {
      try {
        const profile = await getProfile(initialToken);
        if (!active || sessionVersionRef.current !== version) return;

        setToken(initialToken);
        setUser(mergeUserWithPayload(profile, payload));
      } catch (error) {
        if (!active || sessionVersionRef.current !== version) return;

        // Descarta el token si venció o fue rechazado por la API; conserva el almacenamiento ante cortes transitorios.
        if (!error?.isNetworkError && !error?.retryable) {
          removeStoredToken();
        }
        setToken(null);
        setUser(null);
      } finally {
        if (active && sessionVersionRef.current === version) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [initialCheck]);

  const applySession = useCallback((authData) => {
    const payload = decodeJwtPayload(authData.token);
    const nextUser = mergeUserWithPayload(authData.user, payload);

    sessionVersionRef.current += 1;
    writeStoredToken(authData.token);
    setToken(authData.token);
    setUser(nextUser);
    setLoading(false);

    return { token: authData.token, user: nextUser };
  }, []);

  const login = useCallback(
    async (emailOrCredentials, maybePassword) => {
      const credentials =
        typeof emailOrCredentials === 'object' && emailOrCredentials !== null
          ? emailOrCredentials
          : { email: emailOrCredentials, password: maybePassword };

      const data = await loginUser(credentials);
      return applySession(data);
    },
    [applySession],
  );

  const register = useCallback(
    async ({ nombre, email, password }) => {
      const data = await registerUser({ nombre, email, password });
      return applySession(data);
    },
    [applySession],
  );

  const logout = useCallback(() => {
    sessionVersionRef.current += 1;
    removeStoredToken();
    setToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loading,
      login,
      register,
      logout,
    }),
    [user, token, loading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de un AuthProvider.');
  }

  return context;
}

export default AuthContext;
