const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// 1. Importamos los middlewares
const authMiddleware = require('../middleware/authMiddleware'); // Verifica Token
const roleAuth = require('../middleware/roleAuth');             // Verifica Rol

// 2. Aplicamos seguridad en cascada
// Primero: ¿Tienes token válido?
router.use(authMiddleware);

// Segundo: ¿Eres ADMIN? (Creamos un filtro para usar abajo)
const soloAdmin = roleAuth(['admin']);

// --- RUTAS PROTEGIDAS (Solo Admin) ---

// Restaurantes
router.get('/restaurante', soloAdmin, adminController.listarRestaurantes);
router.post('/restaurante', soloAdmin, adminController.crearRestaurante);
router.put('/restaurante/:id', soloAdmin, adminController.editarRestaurante);
router.delete('/restaurante/:id', soloAdmin, adminController.eliminarRestaurante);

// Cocineros
router.get('/dashboard', soloAdmin, adminController.verDashboard);
router.post('/cocinero', soloAdmin, adminController.crearCocinero);
router.put('/cocinero/:id', soloAdmin, adminController.editarCocinero);
router.delete('/cocinero/:id', soloAdmin, adminController.eliminarCocinero);

module.exports = router;