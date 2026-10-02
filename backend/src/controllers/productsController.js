// Importa el array/módulo de productos desde un archivo JSON o JavaScript local
const products = require('../data/products');

// Controlador para obtener la lista completa de productos
// GET /api/productos -> Devuelve un array con todos los productos [ {...}, {...} ]
function getAllProducts(req, res) {
  // Responde con un estado HTTP 200 (OK) y envía el listado completo en formato JSON
  res.status(200).json(products);
}

// Controlador para obtener un único producto según su identificador
// GET /api/productos/:id -> Devuelve el objeto del producto { ... } o un error 404
function getProductById(req, res) {
  // Extrae el parámetro 'id' de la URL (proveniente de req.params)
  const { id } = req.params;

  // Busca dentro del array el primer elemento cuyo 'id' coincida con el recibido en la URL
  // Ojo: req.params.id suele ser un String. Si tus IDs son numéricos, considera usar Number(id)
  const product = products.find((item) => item.id === id);

  // Si no se encuentra ningún producto que coincida con el ID
  if (!product) {
    // Retorna inmediatamente una respuesta con estado HTTP 404 (Not Found) y un objeto JSON de error
    return res.status(404).json({
      error: `Producto no encontrado: ${id}`,
      status: 404,
    });
  }

  // Si el producto fue encontrado, responde con estado HTTP 200 (OK) y entrega el objeto correspondiente
  res.status(200).json(product);
}

// Exporta las funciones para que puedan ser utilizadas como controladores en el archivo de rutas
module.exports = { getAllProducts, getProductById };