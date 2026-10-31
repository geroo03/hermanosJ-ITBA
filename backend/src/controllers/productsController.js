const mongoose = require('mongoose');
const Product = require('../models/Product');

function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// Un _id mal formado nunca llega a la base: se responde 400 de inmediato.
function assertValidId(id) {
  if (!mongoose.isValidObjectId(id)) {
    throw httpError(400, `El identificador "${id}" no es válido`);
  }
}

// El cuerpo se limita a los campos del modelo para ignorar datos ajenos.
function pickFields(body = {}) {
  const fields = {};
  for (const key of ['nombre', 'descripcion', 'precio', 'stock', 'imagenUrl']) {
    if (body[key] !== undefined) fields[key] = body[key];
  }
  return fields;
}

// GET /api/productos
async function getAllProducts(req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: 1 });
    return res.status(200).json(products);
  } catch (error) {
    return next(error);
  }
}

// GET /api/productos/:id
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    assertValidId(id);

    const product = await Product.findById(id);
    if (!product) throw httpError(404, `Producto no encontrado: ${id}`);

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

// POST /api/productos
async function createProduct(req, res, next) {
  try {
    const product = await new Product(pickFields(req.body)).save();
    return res.status(201).json(product);
  } catch (error) {
    return next(error);
  }
}

// PUT /api/productos/:id
async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    assertValidId(id);

    const product = await Product.findByIdAndUpdate(id, pickFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) throw httpError(404, `Producto no encontrado: ${id}`);

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

// DELETE /api/productos/:id
async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;
    assertValidId(id);

    const product = await Product.findByIdAndDelete(id);
    if (!product) throw httpError(404, `Producto no encontrado: ${id}`);

    return res.status(200).json(product);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
