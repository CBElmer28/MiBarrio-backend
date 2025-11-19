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
      restaurante_id: req.user.restaurante_id
    });

    res.json({
      message: "Repartidor creado con éxito",
      repartidor
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// 📌 Listar repartidores del restaurante del cocinero
exports.list = async (req, res) => {
  const repartidores = await Usuario.findAll({
    where: {
      tipo: "repartidor",
      restaurante_id: req.user.restaurante_id
    }
  });

  res.json(repartidores);
};


// 📌 Actualizar repartidor
exports.update = async (req, res) => {
  const repartidor = await Usuario.findByPk(req.params.id);

  if (!repartidor || repartidor.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "Acceso denegado" });

  // Evitar cambios peligrosos
  delete req.body.tipo;
  delete req.body.restaurante_id;

  await repartidor.update(req.body);

  res.json({ message: "Repartidor actualizado", repartidor });
};


// 📌 Eliminar repartidor
exports.delete = async (req, res) => {
  const repartidor = await Usuario.findByPk(req.params.id);

  if (!repartidor || repartidor.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "Acceso denegado" });

  await repartidor.destroy();

  res.json({ message: "Repartidor eliminado" });
};
