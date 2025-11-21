const { Orden, OrdenDetalle, Usuario, Platillo, Restaurante } = require('../models');

exports.crearOrden = async (req, res) => {
  const { cliente_id, restaurante_id, direccion_id, items } = req.body;

  try {
    // Obtener dirección de la tabla Direcciones
    let direccion_entrega = null;

    if (direccion_id) {
      const Direccion = require('../models/Direccion'); // si tienes este modelo
      const dir = await Direccion.findByPk(direccion_id);

      if (!dir || dir.usuario_id !== cliente_id) {
        return res.status(400).json({ error: "Dirección inválida" });
      }

      direccion_entrega = dir.direccion;
    }

    if (!direccion_entrega) {
      return res.status(400).json({ error: "Debes elegir una dirección de entrega" });
    }

    // Crear orden
    const orden = await Orden.create({
      cliente_id,
      restaurante_id,
      repartidor_id: null,
      direccion_entrega,
      estado: "pendiente",
      total: 0
    });

    // Crear detalles
    const detalles = await Promise.all(
      items.map(async item => {
        const platillo = await Platillo.findByPk(item.platillo_id);

        return {
          orden_id: orden.id,
          platillo_id: item.platillo_id,
          cantidad: item.cantidad,
          subtotal: platillo.precio * item.cantidad
        };
      })
    );

    await OrdenDetalle.bulkCreate(detalles);

    // Calcular total
    const total = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    await orden.update({ total });

    res.json({
      message: "Orden creada correctamente",
      orden_id: orden.id
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.misOrdenes = async (req, res) => {
  const ordenes = await Orden.findAll({
    where: { cliente_id: req.user.id },
    include: [
      {
        model: OrdenDetalle,
        as: "detalles",
        include: [
          {
            model: Platillo,
            as: "platillo"
          }
        ]
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

  if (!orden)
    return res.status(404).json({ error: "Orden no encontrada" });

  if (orden.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "No puedes editar esta orden" });

  const repartidor = await Usuario.findByPk(req.body.repartidor_id);

  if (!repartidor || repartidor.tipo !== "repartidor")
    return res.status(400).json({ error: "Repartidor inválido" });

  await orden.update({
    repartidor_id: req.body.repartidor_id,
    estado: "asignada"
  });

  res.json({ message: "Repartidor asignado", orden });
};


exports.cambiarEstado = async (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ["pendiente", "asignada", "preparando", "lista", "entregada"];

  if (!estadosValidos.includes(estado))
    return res.status(400).json({ error: "Estado inválido" });

  const orden = await Orden.findByPk(req.params.id);

  if (!orden || orden.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "No puedes cambiar esta orden" });

  await orden.update({ estado });

  res.json({ message: "Estado actualizado", orden });
};


exports.ordenesAsignadas = async (req, res) => {
  const ordenes = await Orden.findAll({
    where: { repartidor_id: req.user.id },
    include: [
      { model: Usuario, as: "cliente" },
      { model: OrdenDetalle, as: "detalles" },
      { model: Restaurante, as: "restaurante" }
    ]
  });

  res.json(ordenes);
};


exports.marcarEntregada = async (req, res) => {
  const orden = await Orden.findByPk(req.params.id);

  if (!orden)
    return res.status(404).json({ error: "Orden no encontrada" });

  if (orden.repartidor_id !== req.user.id)
    return res.status(403).json({ error: "No puedes modificar esta orden" });

  await orden.update({ estado: "entregada" });

  res.json({ message: "Orden entregada", orden });
};

// ... (código anterior) ...

exports.cancelarOrden = async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);

    if (!orden) 
      return res.status(404).json({ error: "Orden no encontrada" });

    // Verificar que la orden pertenezca al restaurante del cocinero
    if (orden.restaurante_id !== req.user.restaurante_id)
      return res.status(403).json({ error: "No tienes permiso para cancelar esta orden" });

    // No permitir cancelar si ya se entregó
    if (orden.estado === "entregada")
      return res.status(400).json({ error: "No puedes cancelar una orden ya entregada" });

    // Opción A: Marcarla como cancelada (Recomendado para mantener historial)
    await orden.update({ estado: "cancelada" });

    // Opción B: Borrarla físicamente (Descomenta si prefieres esto)
    // await orden.destroy();

    res.json({ message: "Orden cancelada correctamente", orden });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};