const { Platillo, Restaurante, Categoria } = require('../models');

exports.obtenerPlatillos = async (req, res) => {
  try {
    const platillos = await Platillo.findAll({
      include: [
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre', 'imagen', 'rating']
        },
        {
          model: Categoria,
          as: 'categorias',
          attributes: ['nombre']
        }
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
        {
          model: Categoria,
          as: 'categorias',
          where: { nombre: categoria },
          attributes: []
        },
        {
          model: Restaurante,
          as: 'restaurante',
          attributes: ['id', 'nombre', 'imagen']
        }
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
      include: [
        {
          model: Categoria,
          as: 'categorias',
          attributes: ['nombre']
        }
      ]
    });

    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const platillo = await Platillo.create({
      nombre: req.body.nombre,
      precio: req.body.precio,
      descripcion: req.body.descripcion,
      imagen: req.body.imagen,
      restaurante_id: req.user.restaurante_id
    });

    res.status(201).json(platillo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const platillo = await Platillo.findByPk(req.params.id);

    if (!platillo || platillo.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "Acceso denegado" });

    await platillo.update(req.body);

    res.json({ message: "Platillo actualizado", platillo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const platillo = await Platillo.findByPk(req.params.id);

    if (!platillo || platillo.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "Acceso denegado" });

    await platillo.destroy();

    res.json({ message: "Platillo eliminado" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
