const express = require('express');
const router = express.Router();
const { asignarMetodoPago, obtenerMetodosPorUsuario } = require('../controllers/metodosPagoController');

router.post('/asignar', asignarMetodoPago);
router.get('/usuario/:id', obtenerMetodosPorUsuario);

module.exports = router;
