const mongoose = require('mongoose');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Definición del esquema de usuarios. La contraseña se guarda siempre hasheada (bcrypt).
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_REGEX, 'El email no tiene un formato válido'],
    },

    // Hash de bcrypt: nunca se devuelve en las consultas salvo que se pida con select('+password').
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
      select: false,
    },

    rol: {
      type: String,
      enum: { values: ['cliente', 'admin'], message: 'El rol debe ser "cliente" o "admin"' },
      default: 'cliente',
    },
  },
  {
    timestamps: true,
  }
);

// Al serializar a JSON se oculta el hash por seguridad.
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

module.exports = User;
