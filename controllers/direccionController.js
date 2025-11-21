const { Direccion, Usuario } = require('../models');

// 📌 Crear una nueva dirección
exports.create = async (req, res) => {
  // LOG DE DEPURACIÓN
  console.log("---- INTENTO DE CREAR DIRECCIÓN ----");
  console.log("Body recibido:", req.body);

  const { usuario_id, direccion, etiqueta, principal } = req.body;

  try {
    if (!usuario_id) {
        console.log("❌ Error: usuario_id es undefined o null");
        return res.status(400).json({ error: "Falta el ID del usuario (usuario_id es nulo)" });
    }

    // 1. VALIDACIÓN: Verificar que el usuario exista
    const usuarioExiste = await Usuario.findByPk(usuario_id);
    if (!usuarioExiste) {
        console.log(`❌ Error: Usuario con ID ${usuario_id} no existe en la BD`);
        return res.status(404).json({ error: "Usuario no encontrado en la base de datos." });
    }

    // 2. LÓGICA: Si marca como principal, desmarcar las anteriores
    if (principal) {
      await Direccion.update(
        { principal: false },
        { where: { usuario_id } }
      );
    }

    // 3. LÓGICA: Si es la PRIMERA dirección, forzarla como principal
    const count = await Direccion.count({ where: { usuario_id } });
    const esPrincipal = count === 0 ? true : (principal || false);

    const nuevaDireccion = await Direccion.create({
      usuario_id,
      direccion,
      etiqueta: etiqueta || 'Casa',
      principal: esPrincipal
    });

    console.log("✅ Dirección creada con éxito ID:", nuevaDireccion.id);
    res.status(201).json({
      message: "Dirección guardada",
      direccion: nuevaDireccion
    });

  } catch (error) {
    console.error("🔥 Error CRÍTICO en create:", error);
    res.status(500).json({ error: "Error interno: " + error.message });
  }
};

// 📌 Listar direcciones de un usuario
exports.listarPorUsuario = async (req, res) => {
  const { usuario_id } = req.params;
  console.log(`---- LISTANDO DIRECCIONES PARA USUARIO ID: ${usuario_id} ----`);

  try {
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) {
        console.log("❌ Usuario no encontrado para listar");
        return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const direcciones = await Direccion.findAll({
      where: { usuario_id },
      order: [['principal', 'DESC'], ['id', 'DESC']]
    });

    console.log(`✅ Se encontraron ${direcciones.length} direcciones.`);
    res.json(direcciones);
  } catch (error) {
    console.error("🔥 Error listando:", error);
    res.status(500).json({ error: "Error al obtener direcciones" });
  }
};

// 📌 Establecer dirección como principal
exports.setPrincipal = async (req, res) => {
  const { id } = req.params;
  const { usuario_id } = req.body; 

  try {
    const usuario = await Usuario.findByPk(usuario_id);
    if (!usuario) return res.status(404).json({ error: "Usuario inválido" });

    await Direccion.update({ principal: false }, { where: { usuario_id } });

    const direccion = await Direccion.findByPk(id);
    if (!direccion) return res.status(404).json({ error: "Dirección no encontrada" });

    if (direccion.usuario_id !== parseInt(usuario_id)) {
        return res.status(403).json({ error: "Esta dirección no pertenece al usuario" });
    }

    await direccion.update({ principal: true });
    res.json({ message: "Actualizado", direccion });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📌 Eliminar dirección
exports.delete = async (req, res) => {
  const { id } = req.params;
  try {
    const direccion = await Direccion.findByPk(id);
    if (!direccion) return res.status(404).json({ error: "No encontrada" });

    await direccion.destroy();
    res.json({ message: "Dirección eliminada" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar" });
  }
};