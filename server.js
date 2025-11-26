const http = require('http');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
require('dotenv').config();

// Importamos la APP configurada desde app.js
const app = require('./app'); 

// Importar modelos y configuración de DB
const { sequelize, Orden, Usuario } = require('./models');

// Importar servicio de Google Maps
const { getCoordinatesFromAddress } = require('./services/googleMapsService');

// Creamos el servidor HTTP usando la app de Express
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// --- MIDDLEWARE SOCKET ---
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Autenticación requerida'));

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await Usuario.findByPk(payload.id);

        if (!user) return next(new Error('Usuario no encontrado'));

        socket.userModel = user;
        return next();
    } catch (err) {
        return next(new Error('Token inválido'));
    }
});

// --- EVENTOS SOCKET ---
io.on('connection', (socket) => {
    const user = socket.userModel;
    console.log(`✅ Conectado: ${user.nombre} (${user.tipo}) ID:${user.id}`);

    socket.join(`user:${user.id}`);

    // 1. UNIRSE A SALA
    socket.on('join_order_room', async ({ orderId }) => {
        if (!orderId) return;
        try {
            const orden = await Orden.findByPk(orderId);
            if (!orden) return;

            const userId = String(user.id);
            const ownerId = String(orden.cliente_id);
            const driverId = orden.repartidor_id ? String(orden.repartidor_id) : null;

            const esCliente = (user.tipo === 'cliente' && userId === ownerId);
            const esDriver = (user.tipo === 'repartidor' && userId === driverId);

            if (esCliente || esDriver) {
                const roomName = `order_${orderId}`;
                socket.join(roomName);
                console.log(`✅ ${user.nombre} entró a sala ${roomName}`);
            }
        } catch (err) {
            console.error("Error join_order_room:", err);
        }
    });

    // 2. REPARTIDOR: Iniciar Tracking
    socket.on('start_tracking', async ({ orderId }) => {
        if (user.tipo !== 'repartidor') return;

        try {
            const orden = await Orden.findByPk(orderId);
            if (!orden) return;

            const roomName = `order_${orderId}`;
            socket.join(roomName);

            let searchAddress = orden.direccion_entrega;
            if (!searchAddress.toLowerCase().includes("peru")) {
                searchAddress += ", Lima, Peru";
            }

            console.log(`🤨 Buscando coordenadas para: "${searchAddress}"`);
            const finalCoords = await getCoordinatesFromAddress(searchAddress);
            console.log(` Destino calculado:`, finalCoords);

            io.to(roomName).emit('orden:tracking_started', {
                orderId,
                repartidorId: user.id,
                destination: finalCoords,
                addressText: orden.direccion_entrega
            });

        } catch (err) {
            console.error("Error en start_tracking:", err);
        }
    });

    // 3. REPARTIDOR: Enviar Ubicación
    socket.on('send_location', ({ orderId, coords }) => {
        if (user.tipo !== 'repartidor') return;
        socket.to(`order_${orderId}`).emit('driver_position_update', { coords });
    });

    socket.on('stop_tracking', ({ orderId }) => {
        socket.leave(`order_${orderId}`);
    });

    socket.on('disconnect', () => console.log('Desconectado:', user.id));
});

// Esto permite usar 'req.app.get('io')' en tus controladores
app.set('io', io);

const PORT = process.env.PORT || 3000;

// Sincronizar DB y levantar servidor
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
    server.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
});