const { Op } = require('sequelize');
const { Platillo, Categoria } = require('../models');


exports.buscarPorNombre = async (req, res) => {
  const { nombre } = req.query;

  try {
    const platillos = await Platillo.findAll({
      where: {
        nombre: {
          [Op.like]: `%${nombre}%`
        }
      }
    });

    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar platillos por nombre' });
  }
};

exports.filtrarPorCategoria = async (req, res) => {
  const { categoria } = req.query;

  try {
    const platillos = await Platillo.findAll({
      include: {
        model: Categoria,
        where: { nombre: categoria },
        through: { attributes: [] } // evita mostrar la tabla intermedia
      }
    });

    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar platillos por categoría' });
  }
};


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
    const platillos = await Platillo.findAll({ where, include });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar o filtrar platillos' });
  }
};
