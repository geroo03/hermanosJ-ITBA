const products = require('../data/products');

// GET /api/productos: el cliente recibe directamente el array del catálogo.
function getAllProducts(req, res) {
  return res.status(200).json(products);
}

// GET /api/productos/:id: los IDs del catálogo son slugs de texto.
function getProductById(req, res) {
  const { id } = req.params;
  const product = products.find((item) => item.id === id);

  if (!product) {
    return res.status(404).json({
      error: `Producto no encontrado: ${id}`,
      status: 404,
    });
  }

  return res.status(200).json(product);
}

module.exports = { getAllProducts, getProductById };
