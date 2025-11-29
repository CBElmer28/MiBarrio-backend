/**
 * Middleware para restringir acceso según el rol (tipo) del usuario.
 * @param {Array} rolesPermitidos - Ejemplo: ['admin', 'cocinero']
 */
const roleAuth = (rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Verificamos si el usuario existe (esto viene del authMiddleware previo)
    if (!req.user) {
      return res.status(401).json({ error: "Usuario no autenticado o token inválido." });
    }

    // 2. Verificamos si su rol (tipo) está en la lista permitida
    if (rolesPermitidos.includes(req.user.tipo)) {
      next(); // ✅ Tiene permiso, pasa.
    } else {
      // ⛔ Bloqueado
      return res.status(403).json({ 
        error: `Acceso denegado. Tu rol es '${req.user.tipo}', se requiere: ${rolesPermitidos.join(' o ')}` 
      });
    }
  };
};

module.exports = roleAuth;