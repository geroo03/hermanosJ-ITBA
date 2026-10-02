// Importa la función Router del módulo Express para crear un enrutador modular y ejecutable
const { Router } = require('express');

// Importa los controladores de productos desde el archivo controller correspondiente
const {
  getAllProducts,
  getProductById,
} = require('../controllers/productsController');

// Instancia el enrutador de Express
const router = Router();

// Ruta GET para la raíz ('/')
// Mapea a la función getAllProducts para obtener la lista completa de productos
router.get('/', getAllProducts);

// Ruta GET para un recurso específico con un parámetro dinámico (':id')
// Mapea a la función getProductById para obtener un producto por su ID
router.get('/:id', getProductById);

// Exporta el enrutador para que pueda ser montado en la aplicación principal (ej. app.use('/api/productos', router))
module.exports = router;