const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');           // verifica token
const { authCocinero } = require('../middleware/auth'); // solo cocineros

const usuarioController = require('../controllers/usuariosController');

// Crear repartidor
router.post('/repartidores', auth, authCocinero, usuarioController.create);

// Listar repartidores
router.get('/repartidores', auth, authCocinero, usuarioController.list);

// Actualizar repartidor
router.put('/repartidores/:id', auth, authCocinero, usuarioController.update);

// Eliminar repartidor
router.delete('/repartidores/:id', auth, authCocinero, usuarioController.delete);

module.exports = router;
