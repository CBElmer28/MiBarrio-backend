const express = require('express');
const router = express.Router();
const restauranteController = require('../controllers/restauranteController');

router.get('/', restauranteController.obtenerRestaurantes);
router.get('/:id', restauranteController.obtenerRestauranteConPlatillos);


module.exports = router;