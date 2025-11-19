const { Restaurante, Categoria, Platillo } = require('../models');

exports.obtenerRestaurantes = async (req, res) => {
  try {
    const restaurantes = await Restaurante.findAll({
      include: [{ model: Categoria, as:'categorias' ,attributes: ['nombre'] }],
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
        { model: Categoria,as: 'categorias' , attributes: ['nombre'] },
        { model: Platillo, as: 'platillos' }
      ]
    });
    if (!restaurante) return res.status(404).json({ message: 'Restaurante no encontrado' });
    res.json(restaurante);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const id = req.params.id;
    const restaurante = await Restaurante.findByPk(id);

    // Validación: el cocinero solo puede editar SU restaurante
    if (req.user.restaurante_id !== restaurante.id) {
      return res.status(403).json({ error: "Acceso denegado" });
    }

    await restaurante.update({
      nombre: req.body.nombre,
      imagen: req.body.imagen,
      delivery_cost: req.body.delivery_cost,
      tiempo_entrega: req.body.tiempo_entrega
    });

    res.json({ message: "Restaurante actualizado", restaurante });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};