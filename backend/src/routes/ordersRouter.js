const { Router } = require('express');
const { createOrder, getMyOrders } = require('../controllers/ordersController');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// Montado en /api/pedidos desde app.js. Todas las rutas exigen sesión.
router.post('/', verifyToken, createOrder);
router.get('/mis-pedidos', verifyToken, getMyOrders);

module.exports = router;
