const express = require('express');
const router = express.Router();
const favoritoController = require('../controllers/favoritoController');

router.post('/', favoritoController.asignarFavorito);
router.get('/:cliente_id', favoritoController.obtenerFavoritosPorCliente);

module.exports = router;