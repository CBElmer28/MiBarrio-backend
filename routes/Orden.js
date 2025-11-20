const express = require('express');
const router = express.Router();
const {authCliente,authCocinero,authRepartidor} = require('../middleware/auth');
const ordenController = require('../controllers/ordenController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/mis-ordenes', authCliente, ordenController.misOrdenes);
router.post('/', authCliente, ordenController.crearOrden);

router.get('/', authCocinero, ordenController.listarOrdenes);
router.get('/:id', authCocinero, ordenController.verOrden);
router.put('/:id/estado', authCocinero, ordenController.cambiarEstado);
router.put('/:id/asignar-repartidor', authCocinero, ordenController.asignarRepartidor);
router.delete('/:id', authCocinero, ordenController.cancelarOrden);

router.get('/asignadas', authRepartidor, ordenController.ordenesAsignadas);
router.put('/:id/entregar', authRepartidor, ordenController.marcarEntregada);


module.exports = router;