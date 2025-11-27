exports.authCliente = (req, res, next) => {
    if (!req.user || req.user.tipo !== 'cliente') {
        return res.status(403).json({ error: 'Acceso no autorizado: solo cliente' });
    }
    next();
};

exports.authCocinero = (req, res, next) => {
    if (!req.user || req.user.tipo !== 'cocinero') {
        return res.status(403).json({ error: 'Acceso no autorizado: solo cocinero' });
    }
    next();
};

exports.authRepartidor = (req, res, next) => {
    if (!req.user || req.user.tipo !== 'repartidor') {
        return res.status(403).json({ error: 'Acceso no autorizado: solo repartidor' });
    }
    next();
};


exports.authAdmin = (req, res, next) => {
    // Verificamos si el usuario existe y es admin
    if (!req.user || req.user.tipo !== 'admin') {
        return res.status(403).json({ error: 'Acceso no autorizado: solo admin' });
    }
    next();
};