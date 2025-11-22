// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

require('dotenv').config();

// Importar modelos y configuración de DB
const { sequelize, Orden, Usuario } = require('./models');

// --- NUEVO: Importar servicio de Google Maps ---
const { getCoordinatesFromAddress } = require('./services/googleMapsService');

// Inicializar App
const app = express();
app.use(cors());
app.use(express.json());

// --- 1. RUTAS DE LA API ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platillos', require('./routes/Platillos'));
app.use('/api/restaurantes', require('./routes/Restaurantes'));
app.use('/api/favoritos', require('./routes/favoritos'));
app.use('/api/metodos-pago', require('./routes/MetodosPagos'));
app.use('/api/orden', require('./routes/Orden'));
app.use('/api/usuarios', require('./routes/Usuarios'));
app.use('/api/direcciones', require('./routes/Direcciones'));

// --- 2. CONFIGURACIÓN DEL SERVIDOR HTTP Y SOCKET.IO ---
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' } // Ajustar en producción según tus necesidades
});

// --- 3. MIDDLEWARE DE AUTENTICACIÓN SOCKET ---
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) return next(new Error('Autenticación requerida'));

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = payload;

        // Verificar existencia en BD para asegurar que el usuario es válido
        const user = await Usuario.findByPk(payload.id);
        if (!user) return next(new Error('Usuario no encontrado'));

        socket.userModel = user;
        return next();
    } catch (err) {
        console.error('Error de auth en socket:', err.message);
        return next(new Error('Error de autenticación'));
    }
});

// --- 4. EVENTOS DE SOCKET ---
io.on('connection', (socket) => {
    const user = socket.userModel;
    console.log(`Usuario conectado: ${user.id} (${user.tipo})`);

    // Unirse a sala personal (para notificaciones privadas)
    socket.join(`user:${user.id}`);

    // CLIENTE: Unirse a la sala de la orden para escuchar ubicación del repartidor
    socket.on('join_order', ({ orderId }) => {
        if (!orderId) return;
        socket.join(`order:${orderId}`);
        console.log(`Usuario ${user.id} se unió a la orden: ${orderId}`);
    });

    // REPARTIDOR: Iniciar tracking (Aquí ocurre la magia de Geocoding)
    socket.on('start_tracking', async ({ orderId }) => {
        if (user.tipo !== 'repartidor') return;

        socket.join(`order:${orderId}`);

        try {
            // 1. Buscar la orden en la BD para obtener la dirección de texto
            const orden = await Orden.findByPk(orderId);

            if (!orden) {
                console.error(`Orden ${orderId} no encontrada al iniciar tracking`);
                return;
            }

            console.log(`Procesando dirección para Orden #${orderId}: ${orden.direccion_entrega}`);

            // 2. GEOCODIFICACIÓN EN TIEMPO REAL
            // Convertimos la dirección de texto (BD) a lat/lng usando Google Maps API
            const destinationCoords = await getCoordinatesFromAddress(orden.direccion_entrega);

            // 3. Fallback: Coordenadas por defecto (Lima) si Google falla o no encuentra la dirección
            const finalCoords = destinationCoords || { latitude: -12.0464, longitude: -77.0428 };

            // 4. Emitir evento "start" INCLUYENDO las coordenadas calculadas
            // Esto permite que el frontend pinte el marcador de destino sin pedirlo de nuevo
            io.to(`order:${orderId}`).emit('orden:tracking_started', {
                orderId,
                repartidorId: user.id,
                destination: finalCoords, // <--- Coordenadas calculadas en el backend
                addressText: orden.direccion_entrega
            });

            console.log(`Tracking iniciado. Destino calculado: ${JSON.stringify(finalCoords)}`);

        } catch (err) {
            console.error("Error crítico en start_tracking:", err);
        }
    });

    // REPARTIDOR: Actualizar ubicación en tiempo real
    socket.on('location_update', (payload) => {
        const { orderId, coords } = payload || {};
        if (!orderId || !coords) return;

        // Verificación rápida de seguridad
        Orden.findByPk(orderId).then(ord => {
            if (!ord) return;
            if (ord.repartidor_id !== user.id) return; // Solo el repartidor asignado puede actualizar

            // Reenviar ubicación a todos en la sala (Cliente y Sistema)
            io.to(`order:${orderId}`).emit('driver_location', {
                orderId,
                repartidorId: user.id,
                coords,
                timestamp: Date.now()
            });
        }).catch(err => console.error("Error validando orden socket:", err));
    });

    // REPARTIDOR: Detener tracking
    socket.on('stop_tracking', ({ orderId }) => {
        socket.leave(`order:${orderId}`);
        io.to(`order:${orderId}`).emit('orden:tracking_stopped', { orderId });
        console.log(`Tracking detenido orden ${orderId}`);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado:', user.id);
    });
});

// --- 5. ENDPOINTS REST ADICIONALES ---

// Endpoint para asignar repartidor (Usado por Cocinero/Admin)
app.put('/api/orden/:id/asignar-repartidor', async (req, res) => {
    try {
        const orden = await Orden.findByPk(req.params.id);
        if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

        const { repartidor_id } = req.body;
        const repartidor = await Usuario.findByPk(repartidor_id);
        if (!repartidor || repartidor.tipo !== 'repartidor') {
            return res.status(400).json({ error: 'Repartidor inválido' });
        }

        // Actualizar orden
        await orden.update({ repartidor_id, estado: 'en_camino' });

        // Notificar por Socket al cliente y al repartidor
        io.to(`order:${orden.id}`).emit('orden:asignada', {
            orderId: orden.id,
            repartidorId: repartidor_id
        });

        io.to(`user:${repartidor_id}`).emit('orden:asignada:personal', {
            orderId: orden.id,
            orden: orden
        });

        return res.json({ message: 'Repartidor asignado', orden });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

// --- 6. INICIAR SERVIDOR ---
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos conectada y sincronizada');
    server.listen(PORT, () => {
        console.log(`Servidor + Sockets corriendo en puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al conectar BD:', err);
});