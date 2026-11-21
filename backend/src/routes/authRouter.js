const { Router } = require('express');
const { register, login, getProfile } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

const router = Router();

// Montado en /api/auth desde app.js.
router.post('/register', register);
router.post('/login', login);
router.get('/perfil', verifyToken, getProfile);

module.exports = router;
