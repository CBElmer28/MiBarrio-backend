const { Platillo, Restaurante, Categoria } = require('../models');

// 1. LISTAR TODOS (Con categorías)
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
          as: 'categorias', // Asegúrate de que en tu modelo Platillo.js diga as: 'categorias'
          attributes: ['id', 'nombre']
        }
      ]
    });
    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. OBTENER POR CATEGORÍA
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

// 3. OBTENER POR RESTAURANTE (Para tu pantalla "Mis Artículos")
exports.obtenerPorRestaurante = async (req, res) => {
  const { restauranteId } = req.params;
  try {
    const platillos = await Platillo.findAll({
      where: { restaurante_id: restauranteId },
      include: [
        {
          model: Categoria,
          as: 'categorias',
          attributes: ['id', 'nombre'],
          through: { attributes: [] } // Oculta datos de la tabla intermedia
        }
      ]
    });

    res.json(platillos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. CREAR (Con Categoría)
exports.create = async (req, res) => {
  const { nombre, precio, descripcion, imagen, categoria_id } = req.body;

  try {
    // A. Creamos el platillo base
    const platillo = await Platillo.create({
      nombre,
      precio,
      descripcion,
      imagen,
      restaurante_id: req.user.restaurante_id
    });

    // B. Si enviaron categoría, creamos la relación
    if (categoria_id) {
      const categoria = await Categoria.findByPk(categoria_id);
      if (categoria) {
        // Método mágico de Sequelize para relación Muchos-a-Muchos
        // Intenta añadir la categoría a la tabla intermedia
        if (platillo.addCategoria) {
             await platillo.addCategoria(categoria); 
        } else {
             console.log("⚠️ Advertencia: El método addCategoria no existe. Revisa las asociaciones en models/Platillo.js");
        }
      }
    }

    res.status(201).json(platillo);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 5. EDITAR (Con Categoría)
exports.update = async (req, res) => {
  const { nombre, precio, descripcion, imagen, categoria_id } = req.body;

  try {
    const platillo = await Platillo.findByPk(req.params.id);

    if (!platillo || platillo.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "Acceso denegado" });

    // A. Actualizamos datos básicos
    await platillo.update({ nombre, precio, descripcion, imagen });

    // B. Actualizamos categoría si se envió una nueva
    if (categoria_id) {
        const categoria = await Categoria.findByPk(categoria_id);
        if (categoria && platillo.setCategorias) {
            // setCategorias REEMPLAZA las anteriores por esta nueva
            await platillo.setCategorias([categoria]);
        }
    }

    res.json({ message: "Platillo actualizado", platillo });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// 6. ELIMINAR
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