const { Orden, OrdenDetalle, Usuario } = require('../models');

exports.crearOrden = async (req, res) => {
  const { usuario_id, restaurante_id, items } = req.body;

  try {
    // Crear orden base
    const orden = await Orden.create({
      usuario_id,
      restaurante_id,
      repartidor_id: null,
      estado: "pendiente",
      total: 0 // se calcula abajo
    });

    // Crear los detalles
    const detalles = await Promise.all(
      items.map(async item => {
        // Obtener precio del platillo
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

    // Calcular total final
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

exports.listarOrdenes = async (req, res) => {
  const ordenes = await Orden.findAll({
    where: { restaurante_id: req.user.restaurante_id },
    include: ["Usuario", "Repartidor", "OrdenDetalles"]
  });

  res.json(ordenes);
};

exports.verOrden = async (req, res) => {
  const orden = await Orden.findByPk(req.params.id, {
    include: ["Usuario", "Repartidor", "OrdenDetalles"]
  });

  if (!orden || orden.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "No puedes ver esta orden" });

  res.json(orden);
};

exports.asignarRepartidor = async (req, res) => {
  const orden = await Orden.findByPk(req.params.id);

  if (!orden)
    return res.status(404).json({ error: "Orden no encontrada" });

  // Validar que la orden pertenece al restaurante del cocinero
  if (orden.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "No puedes editar esta orden" });

  const repartidor = await Usuario.findByPk(req.body.repartidor_id);

  if (!repartidor || repartidor.tipo !== "repartidor" ||
      repartidor.restaurante_id !== req.user.restaurante_id)
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

exports.cancelarOrden = async (req, res) => {
  const orden = await Orden.findByPk(req.params.id);

  if (!orden || orden.restaurante_id !== req.user.restaurante_id)
    return res.status(403).json({ error: "No puedes cancelar esta orden" });

  if (orden.estado === "entregada")
    return res.status(400).json({ error: "No puedes cancelar una orden entregada" });

  await orden.update({ estado: "cancelada" });

  res.json({ message: "Orden cancelada", orden });
};

exports.misOrdenes = async (req, res) => {
  const ordenes = await Orden.findAll({
    where: { usuario_id: req.user.id },
    include: ["OrdenDetalles", "Restaurante"]
  });

  res.json(ordenes);
};

exports.ordenesAsignadas = async (req, res) => {
  const ordenes = await Orden.findAll({
    where: { repartidor_id: req.user.id },
    include: ["Usuario", "OrdenDetalles", "Restaurante"]
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