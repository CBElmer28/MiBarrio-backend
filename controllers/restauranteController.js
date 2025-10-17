const { Op } = require('sequelize');
const { Restaurante, Categoria } = require('../models');


exports.buscarYFiltrar = async (req, res) => {
  const { nombre, categoria } = req.query;

  const where = {};
  if (nombre) {
    where.nombre = { [Op.like]: `%${nombre}%` };
  }

  const include = [];
  if (categoria) {
    include.push({
      model: Categoria,
      where: { nombre: categoria },
      through: { attributes: [] }
    });
  }

  try {
    const restaurantes = await Restaurante.findAll({ where, include });
    res.json(restaurantes);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar o filtrar restaurantes' });
  }
};
