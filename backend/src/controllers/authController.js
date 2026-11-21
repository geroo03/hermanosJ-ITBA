const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { signToken } = require('../utils/token');

const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 6;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Respuesta común de registro y login: el token y los datos públicos del usuario.
function authResponse(user) {
  return { token: signToken(user), user: user.toJSON() };
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { nombre, email, password } = req.body || {};

    if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
      throw httpError(400, `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
    }

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : email;
    if (normalizedEmail && await User.findOne({ email: normalizedEmail })) {
      throw httpError(409, 'Ya existe una cuenta con ese email');
    }

    // El rol nunca se toma del cuerpo: todo registro público es "cliente".
    const user = new User({
      nombre,
      email,
      password: await bcrypt.hash(password, SALT_ROUNDS),
    });
    await user.save();

    return res.status(201).json(authResponse(user));
  } catch (error) {
    // Carrera entre dos registros con el mismo email: lo detecta el índice único.
    if (error.code === 11000) return next(httpError(409, 'Ya existe una cuenta con ese email'));
    return next(error);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (typeof email !== 'string' || typeof password !== 'string' || !email || !password) {
      throw httpError(400, 'El email y la contraseña son obligatorios');
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    const isValid = user ? await bcrypt.compare(password, user.password) : false;

    // Mismo mensaje para email inexistente y contraseña incorrecta: no revela qué cuentas existen.
    if (!isValid) throw httpError(401, 'Email o contraseña incorrectos');

    return res.status(200).json(authResponse(user));
  } catch (error) {
    return next(error);
  }
}

// GET /api/auth/perfil (ruta protegida)
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) throw httpError(401, 'La cuenta de esta sesión ya no existe');

    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
}

module.exports = { register, login, getProfile };
