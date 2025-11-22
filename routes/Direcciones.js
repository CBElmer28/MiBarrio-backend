const express = require('express');
const router = express.Router();
const direccionController = require('../controllers/direccionController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Crear dirección
router.post('/', direccionController.create);

// Listar direcciones de un usuario (puedes tomar el ID del token en el middleware o pasarlo por params)
// Aquí lo pasamos por params para flexibilidad, pero validaremos en frontend
router.get('/usuario/:usuario_id', direccionController.listarPorUsuario);

// Marcar como principal
router.put('/:id/principal', direccionController.setPrincipal);

// Eliminar
router.delete('/:id', direccionController.delete);

module.exports = router;