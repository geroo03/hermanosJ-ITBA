const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Valida la forma de `items` y consolida productos repetidos preservando el orden de aparición.
function parseOrderItems(rawItems) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw httpError(400, 'El pedido debe incluir al menos un producto en "items"');
  }

  const quantitiesByProduct = new Map();

  for (const entry of rawItems) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw httpError(400, 'Cada ítem del pedido debe ser un objeto con "producto" y "cantidad"');
    }

    const { producto, cantidad } = entry;

    if (!producto || typeof producto !== 'string') {
      throw httpError(400, 'Cada ítem debe indicar un identificador de producto válido');
    }

    if (!OBJECT_ID_REGEX.test(producto) || !mongoose.isValidObjectId(producto)) {
      throw httpError(400, `El identificador de producto "${producto}" no es válido`);
    }

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw httpError(400, 'La cantidad de cada ítem debe ser un número entero mayor a cero');
    }

    const productId = producto.toLowerCase();
    quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + cantidad);
  }

  return [...quantitiesByProduct.entries()].map(([producto, cantidad]) => ({ producto, cantidad }));
}

// POST /api/pedidos (ruta protegida)
async function createOrder(req, res, next) {
  try {
    const requestedItems = parseOrderItems(req.body?.items);

    const resolvedItems = [];
    const stockUpdates = [];
    let total = 0;

    // Se validan existencia y stock de todos los productos antes de mutar stock o guardar el pedido.
    for (const { producto: productId, cantidad } of requestedItems) {
      const product = await Product.findById(productId);
      if (!product) {
        throw httpError(404, `Producto no encontrado: ${productId}`);
      }

      // Política de stock (coherente con seed.js y ProductDetail.jsx):
      // - stock > 0: valida disponibilidad y descuenta al confirmar el pedido.
      // - stock === 0 (o no positivo): "Disponible a pedido" (taller artesanal), se permite y queda en 0.
      const currentStock = typeof product.stock === 'number' ? product.stock : 0;
      if (currentStock > 0) {
        if (cantidad > currentStock) {
          throw httpError(
            400,
            `Stock insuficiente para "${product.nombre}": disponible ${currentStock}, solicitado ${cantidad}`
          );
        }
        stockUpdates.push({
          id: product._id,
          previousStock: currentStock,
          nextStock: currentStock - cantidad,
        });
      }

      // Nombre, precio y total se toman y calculan siempre desde la base de datos.
      resolvedItems.push({
        producto: product._id,
        nombre: product.nombre,
        precio: product.precio,
        cantidad,
      });
      total += product.precio * cantidad;
    }

    const order = new Order({
      usuario: req.user.id,
      items: resolvedItems,
      total,
    });
    await order.validate();

    const appliedUpdates = [];
    try {
      for (const update of stockUpdates) {
        const updatedProduct = await Product.findByIdAndUpdate(
          update.id,
          { stock: update.nextStock },
          { returnDocument: 'after', runValidators: true }
        );
        if (!updatedProduct) {
          throw httpError(404, `Producto no encontrado: ${update.id}`);
        }
        appliedUpdates.push(update);
      }

      await order.save();
    } catch (error) {
      for (const update of [...appliedUpdates].reverse()) {
        try {
          await Product.findByIdAndUpdate(
            update.id,
            { stock: update.previousStock },
            { returnDocument: 'after', runValidators: true }
          );
        } catch (rollbackError) {
          console.error(
            `[Error] No se pudo revertir el stock del producto ${update.id}:`,
            rollbackError.message
          );
        }
      }
      throw error;
    }

    return res.status(201).json(order);
  } catch (error) {
    return next(error);
  }
}

// GET /api/pedidos/mis-pedidos (ruta protegida)
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ usuario: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(orders);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createOrder,
  getMyOrders,
};
