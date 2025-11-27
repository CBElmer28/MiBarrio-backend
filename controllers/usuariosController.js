const { Usuario } = require('../models');
const bcrypt = require('bcrypt');

// 📌 Crear repartidor
exports.create = async (req, res) => {
  const { nombre, email, contraseña } = req.body;

  try {
    // Evitar emails duplicados
    const existe = await Usuario.findOne({ where: { email } });
    if (existe)
      return res.status(400).json({ error: "El email ya está registrado" });

    // Encriptar contraseña
    const hash = await bcrypt.hash(contraseña, 10);

    const repartidor = await Usuario.create({
      nombre,
      email,
      contraseña: hash,
      tipo: "repartidor",
      restaurante_id: req.user.restaurante_id // Se asigna al restaurante del cocinero
    });

    res.json({
      message: "Repartidor creado con éxito",
      repartidor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Listar repartidores (Solo los de mi restaurante)
exports.list = async (req, res) => {
  try {
    const repartidores = await Usuario.findAll({
      where: {
        tipo: "repartidor",
        restaurante_id: req.user.restaurante_id
      },
      attributes: { exclude: ['contraseña'] } // No enviamos la contraseña por seguridad
    });
    res.json(repartidores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Actualizar repartidor (CORREGIDO)
exports.update = async (req, res) => {
  try {
    const repartidor = await Usuario.findByPk(req.params.id);

    // Verificar que exista y que sea MI repartidor
    if (!repartidor || repartidor.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "Acceso denegado" });

    const { nombre, email, contraseña } = req.body;
    
    // Preparamos los datos a actualizar
    const datosUpdate = { nombre, email };

    // Solo encriptamos si viene una contraseña nueva
    if (contraseña && contraseña.length > 0) {
        datosUpdate.contraseña = await bcrypt.hash(contraseña, 10);
    }

    await repartidor.update(datosUpdate);

    res.json({ message: "Repartidor actualizado", repartidor });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Eliminar repartidor
exports.delete = async (req, res) => {
  try {
    const repartidor = await Usuario.findByPk(req.params.id);

    if (!repartidor || repartidor.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "Acceso denegado" });

    await repartidor.destroy();

    res.json({ message: "Repartidor eliminado" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};