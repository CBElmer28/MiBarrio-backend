const { Platillo, Restaurante, Categoria } = require('../models');

exports.obtenerPlatillos = async (req, res) => {
  try {
    const platillos = await Platillo.findAll({
      include: [
        { model: Restaurante,as:'restaurante', attributes: ['id', 'nombre', 'imagen', 'rating'] },
        { model: Categoria, attributes: ['nombre'] }
      ]
    });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorCategoria = async (req, res) => {
  const { categoria } = req.params;
  try {
    const platillos = await Platillo.findAll({
      include: [
        { model: Categoria, where: { nombre: categoria }, attributes: [] },
        { model: Restaurante, as:'restaurante',attributes: ['nombre'] }
      ]
    });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPorRestaurante = async (req, res) => {
  const { restauranteId } = req.params;
  try {
    const platillos = await Platillo.findAll({
      where: { restaurante_id: restauranteId },
      include: [{ model: Categoria, attributes: ['nombre'] }]
    });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
