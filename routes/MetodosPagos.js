const express = require('express');
const router = express.Router();
const { asignarMetodoPago, obtenerMetodosPorUsuario, editarMetodoPago, eliminarMetodoPago } = require('../controllers/metodosPagoController');

// 👇 IMPORTANTE: Importa y usa tu middleware aquí
const authMiddleware = require('../middleware/authMiddleware');
router.use(authMiddleware); 

// Rutas
router.post('/asignar', asignarMetodoPago);
router.get('/usuario/:id', obtenerMetodosPorUsuario);
router.put('/:id', editarMetodoPago);
router.delete('/:id', eliminarMetodoPago);

module.exports = router;