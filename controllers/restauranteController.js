const { Restaurante, Categoria, Platillo } = require('../models');

exports.obtenerRestaurantes = async (req, res) => {
  try {
    const restaurantes = await Restaurante.findAll({
      include: [{ model: Categoria, attributes: ['nombre'] }],
    });
    res.json(restaurantes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerRestauranteConPlatillos = async (req, res) => {
  const { id } = req.params;
  try {
    const restaurante = await Restaurante.findByPk(id, {
      include: [
        { model: Categoria, attributes: ['nombre'] },
        { model: Platillo, as: 'platillos' }
      ]
    });
    if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
    res.json(restaurante);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
