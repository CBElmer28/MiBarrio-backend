const { Orden, OrdenDetalle, Usuario, Platillo, Restaurante, Direccion } = require('../models');

exports.crearOrden = async (req, res) => {
    // NOTA: Quitamos 'restaurante_id' del body. Lo calcularemos nosotros.
    const { cliente_id, direccion_id, direccion_entrega: direccionTexto, items } = req.body;

    console.log("---- CREANDO ORDEN (Lógica Corregida) ----");

    try {
        // 1. VALIDACIÓN DE ITEMS
        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No hay items en la orden" });
        }

        // 2. CORRECCIÓN DEL RESTAURANTE_ID
        // Buscamos el primer platillo en la BD para saber de qué restaurante es realmente
        const primerPlatilloId = items[0].platillo_id || items[0].id;
        const platilloData = await Platillo.findByPk(primerPlatilloId);

        if (!platilloData) {
            return res.status(404).json({ error: `El platillo con ID ${primerPlatilloId} no existe.` });
        }

        const restaurante_id_real = platilloData.restaurante_id;
        console.log(`ℹ️ Restaurante detectado automáticamente en BD: ID ${restaurante_id_real}`);

        // 3. GESTIÓN DE DIRECCIÓN (Lógica Híbrida: ID o Texto)
        let direccion_final = null;

        // A. Intentar por ID (Dirección guardada)
        if (direccion_id) {
            const dir = await Direccion.findByPk(direccion_id);
            // Validamos que la dirección exista y pertenezca al cliente
            if (dir && dir.usuario_id === cliente_id) {
                direccion_final = dir.direccion;
            }
        }

        // B. Intentar por Texto (Input manual o fallback si falló el ID)
        if (!direccion_final && direccionTexto) {
            direccion_final = direccionTexto;
        }

        // C. Validación final
        if (!direccion_final) {
            return res.status(400).json({ error: "Debes proporcionar una dirección de entrega válida (ID o texto)." });
        }

        // 4. CREAR ORDEN
        const orden = await Orden.create({
            cliente_id,
            restaurante_id: restaurante_id_real, // <--- AQUÍ USAMOS EL ID REAL DE LA BD
            repartidor_id: null,
            direccion_entrega: direccion_final,
            estado: "pendiente",
            total: 0
        });

        // 5. CREAR DETALLES
        const detalles = await Promise.all(
            items.map(async item => {
                const platillo = await Platillo.findByPk(item.platillo_id || item.id);

                if (!platillo) throw new Error(`Platillo ID ${item.id} no encontrado`);

                // Opcional: Validar que no mezclen restaurantes en un mismo pedido
                if (platillo.restaurante_id !== restaurante_id_real) {
                    // Aquí podrías lanzar error si tu negocio no permite pedidos mixtos
                    console.warn(`⚠️ Advertencia: El platillo ${platillo.id} es de otro restaurante.`);
                }

                return {
                    orden_id: orden.id,
                    platillo_id: platillo.id,
                    cantidad: item.qty || item.cantidad,
                    subtotal: platillo.precio * (item.qty || item.cantidad)
                };
            })
        );

        await OrdenDetalle.bulkCreate(detalles);

        // 6. CALCULAR TOTAL
        const totalCalculado = detalles.reduce((sum, d) => sum + d.subtotal, 0);
        await orden.update({ total: totalCalculado });

        console.log("✅ Orden creada ID:", orden.id);

        const ordenCompleta = await Orden.findByPk(orden.id, {
            include: [{ model: OrdenDetalle, as: 'detalles' }]
        });

        res.json({
            message: "Orden creada correctamente",
            orden: ordenCompleta
        });

    } catch (err) {
        console.error("🔥 Error crearOrden:", err);
        res.status(500).json({ error: err.message });
    }
};

// --- RESTO DE FUNCIONES (Sin cambios) ---

exports.misOrdenes = async (req, res) => {
    const ordenes = await Orden.findAll({
        where: { cliente_id: req.user.id },
        include: [
            {
                model: OrdenDetalle,
                as: "detalles",
                include: [{ model: Platillo, as: "platillo" }]
            }
        ]
    });
    res.json(ordenes);
};

exports.listarOrdenes = async (req, res) => {
    const ordenes = await Orden.findAll({
        where: { restaurante_id: req.user.restaurante_id },
        include: [
            { model: Usuario, as: "cliente" },
            { model: Usuario, as: "repartidor" },
            { model: OrdenDetalle, as: "detalles" }
        ]
    });
    res.json(ordenes);
};

exports.verOrden = async (req, res) => {
    const orden = await Orden.findByPk(req.params.id, {
        include: [
            { model: Usuario, as: "cliente" },
            { model: Usuario, as: "repartidor" },
            { model: OrdenDetalle, as: "detalles" }
        ]
    });
    if (!orden || orden.restaurante_id !== req.user.restaurante_id)
        return res.status(403).json({ error: "No puedes ver esta orden" });
    res.json(orden);
};

exports.asignarRepartidor = async (req, res) => {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    if (orden.restaurante_id !== req.user.restaurante_id)
        return res.status(403).json({ error: "No puedes editar esta orden" });
    const repartidor = await Usuario.findByPk(req.body.repartidor_id);
    if (!repartidor || repartidor.tipo !== "repartidor")
        return res.status(400).json({ error: "Repartidor inválido" });
    await orden.update({ repartidor_id: req.body.repartidor_id, estado: "asignada" });
    res.json({ message: "Repartidor asignado", orden });
};

exports.cambiarEstado = async (req, res) => {
    const { estado } = req.body;
    const estadosValidos = ["pendiente", "asignada", "preparando", "lista", "entregada"];
    if (!estadosValidos.includes(estado)) return res.status(400).json({ error: "Estado inválido" });
    const orden = await Orden.findByPk(req.params.id);
    if (!orden || orden.restaurante_id !== req.user.restaurante_id)
        return res.status(403).json({ error: "No puedes cambiar esta orden" });
    await orden.update({ estado });
    res.json({ message: "Estado actualizado", orden });
};

exports.ordenesAsignadas = async (req, res) => {
    try {
        const ordenes = await Orden.findAll({
            where: { repartidor_id: req.user.id },

            include: [
                { model: Usuario, as: "cliente" },

                {
                    model: OrdenDetalle,
                    as: "detalles",
                    include: [
                        { model: Platillo, as: "platillo" }
                    ]
                },

                { model: Restaurante, as: "restaurante" }
            ]
        });

        res.json(ordenes);

    } catch (err) {
        console.error("Error en ordenesAsignadas:", err);
        res.status(500).json({ error: "Error al obtener órdenes asignadas" });
    }
};


exports.marcarEntregada = async (req, res) => {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
    if (orden.repartidor_id !== req.user.id)
        return res.status(403).json({ error: "No puedes modificar esta orden" });
    await orden.update({ estado: "entregada" });
    res.json({ message: "Orden entregada", orden });
};

exports.cancelarOrden = async (req, res) => {
    try {
        const orden = await Orden.findByPk(req.params.id);
        if (!orden) return res.status(404).json({ error: "Orden no encontrada" });
        if (orden.restaurante_id !== req.user.restaurante_id)
            return res.status(403).json({ error: "No tienes permiso" });
        if (orden.estado === "entregada")
            return res.status(400).json({ error: "Ya fue entregada" });
        await orden.update({ estado: "cancelada" });
        res.json({ message: "Orden cancelada", orden });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};