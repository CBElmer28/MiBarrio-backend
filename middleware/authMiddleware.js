// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const { Usuario } = require("../models");

module.exports = async function (req, res, next) {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Token requerido" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuario.findByPk(decoded.id);

        if (!usuario) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        req.user = usuario; // 👈 Aquí adjuntamos el usuario completo
        next();
    } catch (e) {
        return res.status(401).json({ error: "Token inválido" });
    }
};
