const MetodoPagoUsuario = require('../models/MetodoPagoUsuario');
const MetodoPago = require('../models/MetodoPago');

const obtenerMetodosPorUsuario = async (req, res) => {
    const usuario_id = req.params.id;

    try {
        const metodos = await MetodoPagoUsuario.findAll({
            where: { usuario_id },
            include: [
                {
                    model: MetodoPago,
                    as: 'metodoPago'
                }
            ]
        });

        res.json(metodos);
    } catch (error) {
        console.error('Error al obtener métodos de pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

const asignarMetodoPago = async (req, res) => {
    const { usuario_id, metodo_pago_id, detalles, principal } = req.body;

    try {
        const asignacion = await MetodoPagoUsuario.create({
            usuario_id,
            metodo_pago_id,
            detalles,
            principal
        });

        res.status(201).json(asignacion);
    } catch (error) {
        console.error('Error al asignar método de pago:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

module.exports = {
    obtenerMetodosPorUsuario,
    asignarMetodoPago
};
