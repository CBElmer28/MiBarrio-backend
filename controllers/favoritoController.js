const { Favorito, Platillo } = require('../models');

exports.asignarFavorito = async (req, res) => {
    try {
        const { cliente_id, platillo_id } = req.body;

        const favorito = await Favorito.create({
            cliente_id,
            platillo_id,
            fecha: new Date()
        });

        res.status(201).json(favorito);
    } catch (error) {
        console.error('Error al asignar favorito:', error);
        res.status(500).json({ error: 'No se pudo asignar el favorito' });
    }
}
exports.obtenerFavoritosPorCliente = async (req, res) => {
    try {
        const { cliente_id } = req.params;

        const favoritos = await Favorito.findAll({
            where: { cliente_id },
            include: [{ model: Platillo, as: 'platillo' }],
            order: [['fecha', 'DESC']]
        });

        res.json(favoritos);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        res.status(500).json({ error: 'No se pudieron recuperar los favoritos' });
    }
};