const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');

// Importación de Middlewares de Seguridad
const auth = require('../middleware/authMiddleware'); // Valida Token
const { authAdmin } = require('../middleware/auth');  // Valida Rol Admin


// GET /api/categorias
router.get('/', categoriaController.listar);

// GET /api/categorias/:id
router.get('/:id', categoriaController.obtenerPorId);

// POST /api/categorias (Crear)
router.post('/', auth, authAdmin, categoriaController.crear);

// PUT /api/categorias/:id (Editar)
router.put('/:id', auth, authAdmin, categoriaController.actualizar);

// DELETE /api/categorias/:id (Borrar)
router.delete('/:id', auth, authAdmin, categoriaController.eliminar);

module.exports = router;