const express = require('express');
const router = express.Router();
const {authCliente, authCocinero, authRepartidor} = require('../middleware/auth');
const ordenController = require('../controllers/ordenController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

//  1. RUTAS ESPECÍFICAS (VAN PRIMERO)
router.get('/mis-ordenes', authCliente, ordenController.misOrdenes);
router.get('/asignadas', authRepartidor, ordenController.ordenesAsignadas); // <--- ESTA ES LA CLAVE, TIENE QUE IR AQUÍ

router.post('/', authCliente, ordenController.crearOrden);

//  2. RUTA GENERAL CON ID (VA DESPUÉS)
// Si pones esta arriba, bloqueará a '/asignadas' creyendo que es un ID
router.get('/:id', authCocinero, ordenController.verOrden); 
router.get('/', authCocinero, ordenController.listarOrdenes);

//  3. RUTAS DE ACCIÓN
router.put('/:id/estado', authCocinero, ordenController.cambiarEstado);
router.put('/:id/asignar-repartidor', authCocinero, ordenController.asignarRepartidor);
router.delete('/:id', authCocinero, ordenController.cancelarOrden);
router.put('/:id/entregar', authRepartidor, ordenController.marcarEntregada);

module.exports = router;