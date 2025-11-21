const { Orden, OrdenDetalle, Usuario, Platillo, Restaurante, Direccion } = require('../models'); // Asegúrate de importar Direccion si lo usas

exports.crearOrden = async (req, res) => {
  // Aceptamos direccion_entrega (texto) directamente también
  const { cliente_id, restaurante_id, direccion_id, direccion_entrega: direccionTexto, items } = req.body;

  console.log("---- CREANDO ORDEN ----");
  console.log("Datos:", req.body);

  try {
    let direccion_final = null;

    // 1. Si envían ID, buscamos en la BD
    if (direccion_id) {
      const DireccionModel = require('../models/Direccion'); 
      const dir = await DireccionModel.findByPk(direccion_id);

      if (dir && dir.usuario_id === cliente_id) {
        direccion_final = dir.direccion;
      }
    }

    // 2. Si no se encontró por ID, usamos el texto enviado directamente
    if (!direccion_final && direccionTexto) {
        direccion_final = direccionTexto;
    }

    // 3. Validación final
    if (!direccion_final) {
      return res.status(400).json({ error: "Debes proporcionar una dirección de entrega válida." });
    }

    // Crear orden
    const orden = await Orden.create({
      cliente_id,
      restaurante_id, // Asegúrate que el frontend envíe esto (o sacarlo del primer item)
      repartidor_id: null,
      direccion_entrega: direccion_final,
      estado: "pendiente",
      total: 0 // Se actualizará abajo
    });

    // Crear detalles
    const detalles = await Promise.all(
      items.map(async item => {
        // Busca precio actual del platillo para asegurar integridad
        const platillo = await Platillo.findByPk(item.platillo_id || item.id); 
        
        if (!platillo) throw new Error(`Platillo ID ${item.id} no encontrado`);

        return {
          orden_id: orden.id,
          platillo_id: platillo.id,
          cantidad: item.qty || item.cantidad, // Frontend suele usar qty
          subtotal: platillo.precio * (item.qty || item.cantidad)
        };
      })
    );

    await OrdenDetalle.bulkCreate(detalles);

    // Calcular total real
    const totalCalculado = detalles.reduce((sum, d) => sum + d.subtotal, 0);
    await orden.update({ total: totalCalculado });

    console.log("✅ Orden creada ID:", orden.id);
    
    // Devolver la orden completa con detalles para el tracking
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

// ... (Mantén el resto de tus funciones: misOrdenes, listarOrdenes, etc. igual que antes) ...
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