const Usuario = require('../models/Usuario');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Restaurante } = require('../models');

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
},

exports.login = async (req, res) => {
  try {
    const { email, contraseña } = req.body;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    let restaurante = null;

    // Cocinero y repartidor tienen restaurante
    if (usuario.tipo === 'cocinero' || usuario.tipo === 'repartidor') {
      restaurante = await Restaurante.findByPk(usuario.restaurante_id);
    }

    const token = jwt.sign(
      { id: usuario.id, tipo: usuario.tipo },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const usuarioLimpio = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      tipo: usuario.tipo,
      restaurante_id: usuario.restaurante_id || null
    };

    res.json({ token, usuario: usuarioLimpio, restaurante });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};