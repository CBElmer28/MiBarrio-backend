const MetodoPagoUsuario = require('../models/MetodoPagoUsuario');
const MetodoPago = require('../models/MetodoPago');

// 1. OBTENER MIS MÉTODOS
const obtenerMetodosPorUsuario = async (req, res) => {
    const usuario_id = req.params.id;

    // Seguridad extra: Solo yo puedo ver mis tarjetas
    // (Si req.user.id es distinto al id que pides, bloqueamos)
    if (req.user.id != usuario_id) {
        return res.status(403).json({ error: "No puedes ver tarjetas de otros usuarios" });
    }

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
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 2. ASIGNAR (CREAR)
const asignarMetodoPago = async (req, res) => {
    const { usuario_id, metodo_pago_id, detalles, principal } = req.body;

    // Seguridad: Solo puedo asignarme tarjetas a mí mismo
    if (req.user.id != usuario_id) {
        return res.status(403).json({ error: "No puedes asignar tarjetas a otros" });
    }

    try {
        const asignacion = await MetodoPagoUsuario.create({
            usuario_id,
            metodo_pago_id,
            detalles,
            principal
        });
        res.status(201).json(asignacion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

// 3. EDITAR (Solo si es mía)
const editarMetodoPago = async (req, res) => {
    const { id } = req.params; // ID de la relación
    const { detalles, principal } = req.body;

    try {
        const metodo = await MetodoPagoUsuario.findByPk(id);

        if (!metodo) return res.status(404).json({ error: "Método no encontrado" });

        // 🔒 SEGURIDAD: Verificamos que la tarjeta pertenezca al usuario logueado
        if (metodo.usuario_id !== req.user.id) {
            return res.status(403).json({ error: "No tienes permiso para editar esta tarjeta" });
        }

        await metodo.update({ detalles, principal });
        res.json({ message: "Método actualizado", metodo });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR (Solo si es mía)
const eliminarMetodoPago = async (req, res) => {
    const { id } = req.params;
    try {
        const metodo = await MetodoPagoUsuario.findByPk(id);
        
        if (!metodo) return res.status(404).json({ error: "Método no encontrado" });

        // 🔒 SEGURIDAD: Verificamos dueño
        if (metodo.usuario_id !== req.user.id) {
            return res.status(403).json({ error: "No tienes permiso para eliminar esta tarjeta" });
        }

        await metodo.destroy();
        res.json({ message: "Método eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    obtenerMetodosPorUsuario,
    asignarMetodoPago,
    editarMetodoPago,
    eliminarMetodoPago
};