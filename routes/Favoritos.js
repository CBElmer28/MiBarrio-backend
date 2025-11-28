const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');
const authMiddleware = require('../middleware/authMiddleware');

// Todo requiere autenticación
router.use(authMiddleware);

// POST /api/favoritos/toggle -> Body: { platillo_id: 1 }
router.post('/toggle', favoritoController.toggleFavorito);

// GET /api/favoritos -> Lista de mis favoritos
router.get('/', favoritoController.misFavoritos);

// GET /api/favoritos/check/:platillo_id -> True/False
router.get('/check/:platillo_id', favoritoController.esFavorito);

module.exports = router;