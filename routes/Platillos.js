const express = require('express');
const router = express.Router();
const platilloController = require('../controllers/platilloController');

router.get('/', platilloController.buscarPorNombre);
router.get('/', platilloController.filtrarPorCategoria);
router.get('/', platilloController.buscarYFiltrar);


module.exports = router;