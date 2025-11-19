const express = require('express');
const router = express.Router();
const authCocinero = require('../middleware/auth');
const usuarioController = require('../controllers/usuarioController');


router.get('/repartidores', auth, authCocinero, usuarioController.listRepartidores);
router.put('/repartidores/:id', auth, authCocinero, usuarioController.updateRepartidor);

module.exports = router;