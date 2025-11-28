const { Categoria } = require('../models');

// 1. Listar todas las categorías
exports.listar = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({
            order: [['nombre', 'ASC']] // Orden alfabético para mejor UX
        });
        res.json(categorias);
    } catch (error) {
        console.error("Error al listar categorías:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// 2. Obtener una categoría por ID
exports.obtenerPorId = async (req, res) => {
    const { id } = req.params;
    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }
        res.json(categoria);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Crear nueva categoría
exports.crear = async (req, res) => {
    const { nombre } = req.body;

    if (!nombre) {
        return res.status(400).json({ error: "El nombre de la categoría es obligatorio." });
    }

    try {
        // Normalizar nombre (Primera mayúscula, resto minúscula) para evitar "Pizza" y "pizza"
        const nombreNormalizado = nombre.charAt(0).toUpperCase() + nombre.slice(1).toLowerCase();

        // Verificar duplicados
        const existe = await Categoria.findOne({ where: { nombre: nombreNormalizado } });
        if (existe) {
            return res.status(409).json({ error: `La categoría '${nombreNormalizado}' ya existe.` });
        }

        const nuevaCategoria = await Categoria.create({ nombre: nombreNormalizado });
        
        res.status(201).json({ 
            message: "Categoría creada con éxito", 
            categoria: nuevaCategoria 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Actualizar categoría
exports.actualizar = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        await categoria.update({ nombre });
        
        res.json({ 
            message: "Categoría actualizada", 
            categoria 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Eliminar categoría
exports.eliminar = async (req, res) => {
    const { id } = req.params;

    try {
        const categoria = await Categoria.findByPk(id);
        if (!categoria) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // NOTA: Si tienes integridad referencial estricta en la BD, esto fallará si hay platos asociados.
        // Sequelize por defecto lanzará un error si hay llave foránea restrictiva.
        await categoria.destroy();
        
        res.json({ message: "Categoría eliminada correctamente" });
    } catch (error) {
        // Manejo de error si la categoría está en uso
        res.status(500).json({ error: "No se pudo eliminar la categoría. Asegúrate de que no tenga platillos o restaurantes asociados." });
    }
};