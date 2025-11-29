const { Favorito, Platillo, Restaurante } = require('../models');

// 1. TOGGLE FAVORITO (Agregar / Quitar)
// Esta función verifica si ya existe. Si sí, lo borra (dislike). Si no, lo crea (like).
exports.toggleFavorito = async (req, res) => {
    try {
        const { platillo_id } = req.body;
        const cliente_id = req.user.id; // Obtenido del token

        // Buscar si ya existe
        const existente = await Favorito.findOne({
            where: { cliente_id, platillo_id }
        });

        if (existente) {
            // Si existe, lo eliminamos
            await existente.destroy();
            return res.json({ message: "Eliminado de favoritos", esFavorito: false });
        } else {
            // Si no existe, lo creamos
            await Favorito.create({
                cliente_id,
                platillo_id,
                fecha: new Date()
            });
            return res.status(201).json({ message: "Agregado a favoritos", esFavorito: true });
        }

    } catch (error) {
        console.error('Error en toggleFavorito:', error);
        res.status(500).json({ error: 'Error al gestionar favorito' });
    }
};

// 2. OBTENER MIS FAVORITOS
exports.misFavoritos = async (req, res) => {
    try {
        const cliente_id = req.user.id;

        const favoritos = await Favorito.findAll({
            where: { cliente_id },
            include: [
                {
                    model: Platillo,
                    as: 'platillo', // Según tu index.js
                    include: [
                        {
                            model: Restaurante,
                            as: 'restaurante', // Para mostrar el nombre del restaurante en la tarjeta
                            attributes: ['id', 'nombre']
                        }
                    ]
                }
            ],
            order: [['fecha', 'DESC']] // Los más recientes primero
        });

        // Limpiamos la respuesta para devolver solo la lista de platillos con un flag extra
        // O devolvemos el objeto favorito completo, depende de tu gusto. 
        // Aquí devolvemos la estructura de Favorito que contiene al Platillo.
        res.json(favoritos);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ error: 'Error al obtener la lista' });
    }
};

// 3. VERIFICAR SI UN PLATILLO ES FAVORITO (Para el icono en FoodDetails)
exports.esFavorito = async (req, res) => {
    try {
        const { platillo_id } = req.params;
        const cliente_id = req.user.id;

        const count = await Favorito.count({
            where: { cliente_id, platillo_id }
        });

        res.json({ esFavorito: count > 0 });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};