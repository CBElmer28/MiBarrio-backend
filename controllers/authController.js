const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.registrar = async (req, res) => {
    try {
        const { nombre, email, contraseña, tipo } = req.body;

        // Validación básica
        if (!nombre || !email || !contraseña || !tipo) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Verificar si el email ya existe
        const usuarioExistente = await Usuario.findOne({ where: { email } });
        if (usuarioExistente) {
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }

        // Hashear la contraseña
        const hash = await bcrypt.hash(contraseña, 10);

        // Crear el usuario
        const nuevoUsuario = await Usuario.create({
            nombre,
            email,
            contraseña: hash,
            tipo
        });

        // Generar token
        const token = jwt.sign(
            { id: nuevoUsuario.id, tipo: nuevoUsuario.tipo },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Enviar respuesta
        res.status(201).json({
            token,
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                email: nuevoUsuario.email,
                tipo: nuevoUsuario.tipo,
                descripcion: nuevoUsuario.descripcion,
                imagen_perfil: nuevoUsuario.imagen_perfil
            }
        });
    } catch (error) {
        console.error('Error en registro:', error); // 👈 log para depurar
        res.status(500).json({ error: error.message || 'Error al registrar usuario' });
    }
};
