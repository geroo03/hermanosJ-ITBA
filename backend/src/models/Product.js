
const mongoose = require('mongoose');

// Definición del esquema de productos
const productSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },

    descripcion: {
      type: String,
      trim: true,
    },

    precio: {
      type: Number,
      required: [true, 'El precio del producto es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },

    stock: {
      type: Number,
      min: [0, 'El stock no puede ser negativo'],
      default: 0,
    },

    imagenUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Crear y exportar el modelo
const Product = mongoose.model('Product', productSchema);

module.exports = Product;
