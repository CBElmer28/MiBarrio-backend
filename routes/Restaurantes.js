const express = require('express');
const router = express.Router();
const {authCocinero} = require('../middleware/auth');
const auth = require('../middleware/authMiddleware');
const restauranteController = require('../controllers/restauranteController');

router.get('/', restauranteController.obtenerRestaurantes);
router.get('/:id', restauranteController.obtenerRestauranteConPlatillos);
router.put('/edit/:id', auth, authCocinero, restauranteController.update);

module.exports = router;