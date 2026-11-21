const { Router } = require('express');
const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productsController');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// Montado en /api/productos desde app.js.
// Lecturas públicas; escritura protegida con JWT.
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', verifyToken, createProduct);
router.put('/:id', verifyToken, updateProduct);
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;
