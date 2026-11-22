import { getProfile, loginUser, registerUser } from './authApi';

describe('authApi', () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  describe('registerUser', () => {
    it('envía POST /auth/register con JSON y devuelve { token, user }', async () => {
      const payload = { nombre: 'Ana Pérez', email: 'ana@correo.com', password: 'secreto123' };
      const authData = {
        token: 'header.payload.sig',
        user: { _id: '65f000000000000000000010', nombre: 'Ana Pérez', email: 'ana@correo.com', rol: 'cliente' },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue(authData),
      });

      await expect(registerUser(payload)).resolves.toEqual(authData);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });

    it('propaga el error 409 de la API cuando el email ya está registrado', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: jest.fn().mockResolvedValue({
          error: 'Ya existe una cuenta con ese email',
          status: 409,
        }),
      });

      await expect(
        registerUser({ nombre: 'Ana', email: 'ana@correo.com', password: 'secreto123' }),
      ).rejects.toMatchObject({
        message: 'Ya existe una cuenta con ese email',
        status: 409,
      });
    });

    it('propaga errores de validación 400 de la API', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: 'La contraseña debe tener al menos 6 caracteres',
          status: 400,
        }),
      });

      await expect(
        registerUser({ nombre: 'Ana', email: 'ana@correo.com', password: '123' }),
      ).rejects.toMatchObject({
        message: 'La contraseña debe tener al menos 6 caracteres',
        status: 400,
      });
    });

    it('informa error de conexión cuando el servidor no responde', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        registerUser({ nombre: 'Ana', email: 'ana@correo.com', password: 'secreto123' }),
      ).rejects.toMatchObject({
        message:
          'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.',
        isNetworkError: true,
      });
    });

    it('rechaza respuestas con estructura inválida', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: jest.fn().mockResolvedValue({ ok: true }),
      });

      await expect(
        registerUser({ nombre: 'Ana', email: 'ana@correo.com', password: 'secreto123' }),
      ).rejects.toThrow('No pudimos crear tu cuenta. Revisá los datos e intentá nuevamente.');
    });
  });

  describe('loginUser', () => {
    it('envía POST /auth/login aceptando objeto de credenciales o (email, password)', async () => {
      const authData = {
        token: 'header.payload.sig',
        user: { _id: '65f000000000000000000010', nombre: 'Ana Pérez', email: 'ana@correo.com', rol: 'cliente' },
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(authData),
      });

      await expect(loginUser({ email: 'ana@correo.com', password: 'secreto123' })).resolves.toEqual(authData);
      await expect(loginUser('ana@correo.com', 'secreto123')).resolves.toEqual(authData);

      expect(global.fetch).toHaveBeenNthCalledWith(1, 'http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ana@correo.com', password: 'secreto123' }),
      });
      expect(global.fetch).toHaveBeenNthCalledWith(2, 'http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ana@correo.com', password: 'secreto123' }),
      });
    });

    it('propaga el error 401 ante credenciales incorrectas', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          error: 'Email o contraseña incorrectos',
          status: 401,
        }),
      });

      await expect(loginUser('ana@correo.com', 'otra-clave')).rejects.toMatchObject({
        message: 'Email o contraseña incorrectos',
        status: 401,
      });
    });

    it('informa error de conexión cuando falla la red', async () => {
      global.fetch = jest.fn().mockRejectedValue(new TypeError('Network error'));

      await expect(loginUser('ana@correo.com', 'secreto123')).rejects.toMatchObject({
        message:
          'No pudimos conectarnos con el servidor. Verificá que la API esté en funcionamiento.',
        isNetworkError: true,
      });
    });
  });

  describe('getProfile', () => {
    it('envía GET /auth/perfil con Authorization Bearer y devuelve el usuario', async () => {
      const profile = {
        _id: '65f000000000000000000010',
        nombre: 'Ana Pérez',
        email: 'ana@correo.com',
        rol: 'cliente',
      };

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue(profile),
      });

      await expect(getProfile('jwt-token')).resolves.toEqual(profile);
      expect(global.fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/perfil', {
        method: 'GET',
        headers: { Authorization: 'Bearer jwt-token' },
      });
    });

    it('propaga 401 cuando el token expiró o es inválido', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          error: 'La sesión expiró. Iniciá sesión nuevamente',
          status: 401,
        }),
      });

      await expect(getProfile('token-vencido')).rejects.toMatchObject({
        message: 'La sesión expiró. Iniciá sesión nuevamente',
        status: 401,
      });
    });

    it('rechaza con 401 sin consultar la red si falta el token', async () => {
      global.fetch = jest.fn();

      await expect(getProfile('')).rejects.toMatchObject({ status: 401 });
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('marca respuestas 503 o HTML de arranque como reintentables', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        json: jest.fn().mockRejectedValue(new SyntaxError("Unexpected token '<'")),
      });

      await expect(getProfile('jwt-token')).rejects.toMatchObject({
        status: 503,
        retryable: true,
      });
    });
  });
});
