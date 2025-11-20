const express = require('express');
const router = express.Router();
const { authCocinero } = require('../middleware/auth');
const platilloController = require('../controllers/platilloController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', platilloController.obtenerPlatillos);
router.get('/categoria/:categoria', platilloController.obtenerPorCategoria);
router.get('/restaurante/:restauranteId', platilloController.obtenerPorRestaurante);

router.use(authMiddleware);

router.post('/', authCocinero, platilloController.create);
router.put('/:id', authCocinero, platilloController.update);
router.delete('/:id', authCocinero, platilloController.delete);


module.exports = router;