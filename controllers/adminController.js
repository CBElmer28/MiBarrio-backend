const { Usuario, Restaurante } = require('../models');
const bcrypt = require('bcrypt');

// ==========================================
// 🏢 GESTIÓN DE RESTAURANTES (CRUD COMPLETO)
// ==========================================

// 1. CREAR Restaurante
exports.crearRestaurante = async (req, res) => {
    try {
        const { nombre, direccion, imagen, tipo } = req.body;
        if (!nombre) return res.status(400).json({ error: "Nombre obligatorio" });

        const restaurante = await Restaurante.create({ nombre, direccion, imagen, tipo });
        res.status(201).json({ message: "Restaurante creado", restaurante });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. VER Restaurantes
exports.listarRestaurantes = async (req, res) => {
    try {
        const restaurantes = await Restaurante.findAll();
        res.json(restaurantes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. EDITAR Restaurante
exports.editarRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurante = await Restaurante.findByPk(id);
        
        if (!restaurante) return res.status(404).json({ error: "Restaurante no encontrado" });

        await restaurante.update(req.body);
        res.json({ message: "Restaurante actualizado", restaurante });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR Restaurante
exports.eliminarRestaurante = async (req, res) => {
    try {
        const { id } = req.params;
        const eliminado = await Restaurante.destroy({ where: { id } });
        
        if (!eliminado) return res.status(404).json({ error: "No se encontró el restaurante" });
        
        res.json({ message: "Restaurante eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ==========================================
// 👨‍🍳 GESTIÓN DE COCINEROS (CRUD COMPLETO)
// ==========================================

// 1. CREAR Cocinero
exports.crearCocinero = async (req, res) => {
    try {
        const { nombre, email, contraseña, restaurante_id } = req.body;

        const restaurante = await Restaurante.findByPk(restaurante_id);
        if (!restaurante) return res.status(404).json({ error: "Restaurante no existe" });

        const hash = await bcrypt.hash(contraseña, 10);

        const cocinero = await Usuario.create({
            nombre, email, contraseña: hash,
            tipo: 'cocinero',
            restaurante_id
        });

        res.status(201).json({ message: "Cocinero creado", cocinero });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. VER Cocineros (Dashboard)
exports.verDashboard = async (req, res) => {
    try {
        // Devuelve resumen de todo
        const restaurantes = await Restaurante.findAll();
        const cocineros = await Usuario.findAll({ 
            where: { tipo: 'cocinero' },
            include: [{ model: Restaurante, as: 'restaurante' }] // Ver dónde trabajan
        });
        res.json({ restaurantes, cocineros });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. EDITAR Cocinero
exports.editarCocinero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, email, contraseña, restaurante_id } = req.body;

        const cocinero = await Usuario.findByPk(id);
        if (!cocinero) return res.status(404).json({ error: "Usuario no encontrado" });

        const datos = { nombre, email, restaurante_id };
        
        // Si mandan contraseña nueva, la encriptamos
        if (contraseña && contraseña.length > 0) {
            datos.contraseña = await bcrypt.hash(contraseña, 10);
        }

        await cocinero.update(datos);
        res.json({ message: "Cocinero actualizado", cocinero });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR Cocinero
exports.eliminarCocinero = async (req, res) => {
    try {
        const { id } = req.params;
        // Solo borramos si es cocinero (seguridad extra)
        const eliminado = await Usuario.destroy({ where: { id, tipo: 'cocinero' } });
        
        if (!eliminado) return res.status(404).json({ error: "Cocinero no encontrado" });

        res.json({ message: "Cocinero eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};