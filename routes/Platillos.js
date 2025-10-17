const express = require('express');
const router = express.Router();
const platilloController = require('../controllers/platilloController');

router.get('/', platilloController.obtenerPlatillos);
router.get('/categoria/:categoria', platilloController.obtenerPorCategoria);
router.get('/restaurante/:restauranteId', platilloController.obtenerPorRestaurante);


module.exports = router;