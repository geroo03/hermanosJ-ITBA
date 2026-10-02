const { Router } = require('express');
const {
  getAllProducts,
  getProductById,
} = require('../controllers/productsController');

const router = Router();

// Montar este router en /api/productos desde la aplicación principal.
router.get('/', getAllProducts);
router.get('/:id', getProductById);

module.exports = router;
