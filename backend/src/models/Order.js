const mongoose = require('mongoose');

// Subdocumento de cada ítem del pedido: conserva nombre y precio del producto al momento de la compra.
const orderItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'El producto del ítem es obligatorio'],
    },

    nombre: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true,
    },

    precio: {
      type: Number,
      required: [true, 'El precio del producto es obligatorio'],
      min: [0, 'El precio no puede ser negativo'],
    },

    cantidad: {
      type: Number,
      required: [true, 'La cantidad es obligatoria'],
      min: [1, 'La cantidad debe ser mayor a cero'],
      validate: {
        validator: Number.isInteger,
        message: 'La cantidad debe ser un número entero mayor a cero',
      },
    },
  },
  { _id: false }
);

// Definición del esquema de pedidos asociados al usuario autenticado.
const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'El usuario del pedido es obligatorio'],
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: [true, 'El pedido debe incluir al menos un producto'],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: 'El pedido debe incluir al menos un producto',
      },
    },

    total: {
      type: Number,
      required: [true, 'El total del pedido es obligatorio'],
      min: [0, 'El total no puede ser negativo'],
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
