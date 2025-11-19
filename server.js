// server.js
const express = require('express');
const http = require('http');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sequelize, Orden, Usuario } = require('./models'); // ajustar ruta
const { Server } = require('socket.io');

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// --- Socket auth middleware (token from query or auth header) ---
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Auth error'));

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach user info
    socket.user = payload; // { id, tipo, ... }
    // optionally load user from DB
    const user = await Usuario.findByPk(payload.id);
    if (!user) return next(new Error('User not found'));
    socket.userModel = user;
    return next();
  } catch (err) {
    console.error('Socket auth err:', err);
    return next(new Error('Auth error'));
  }
});

// --- Socket events ---
io.on('connection', (socket) => {
  const user = socket.userModel;
  console.log('Socket connected', user.id, user.tipo);

  // join personal room for private events
  socket.join(`user:${user.id}`);

  // clients (customer) will join order room to receive driver's locations:
  // socket.emit join: { orderId }
  socket.on('join_order', ({ orderId }) => {
    if (!orderId) return;
    socket.join(`order:${orderId}`);
    console.log(`User ${user.id} joined order:${orderId}`);
  });

  // Repartidor: start tracking for an order
  // payload { orderId }
  socket.on('start_tracking', ({ orderId }) => {
    if (user.tipo !== 'repartidor') return socket.emit('error', 'Only repartidor can start tracking');
    // join order room as driver too if wanted
    socket.join(`order:${orderId}`);
    // notify clients in order room that driver started (optional)
    io.to(`order:${orderId}`).emit('orden:tracking_started', { orderId, repartidorId: user.id });
  });

  // Repartidor sends location updates
  // payload { orderId, coords: { latitude, longitude, accuracy, speed } }
  socket.on('location_update', (payload) => {
    const { orderId, coords } = payload || {};
    if (!orderId || !coords) return;
    // security check: ensure sender is the assigned repartidor for that order
    // (fast DB check)
    Orden.findByPk(orderId).then(ord => {
      if (!ord) return;
      if (ord.repartidor_id !== user.id) {
        // not assigned; ignore or optionally send error
        return;
      }
      // broadcast to clients listening to the order
      io.to(`order:${orderId}`).emit('driver_location', {
        orderId,
        repartidorId: user.id,
        coords,
        timestamp: Date.now()
      });
    }).catch(err => console.error(err));
  });

  socket.on('stop_tracking', ({ orderId }) => {
    socket.leave(`order:${orderId}`);
    io.to(`order:${orderId}`).emit('orden:tracking_stopped', { orderId, repartidorId: user.id });
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected', user.id);
  });
});

// --- Minimal REST to assign repartidor to an order (cocinero) ---
app.put('/ordenes/:id/asignar-repartidor', async (req, res) => {
  try {
    const orden = await Orden.findByPk(req.params.id);
    if (!orden) return res.status(404).json({ error: 'Orden no encontrada' });

    const { repartidor_id } = req.body;
    const repartidor = await Usuario.findByPk(repartidor_id);
    if (!repartidor || repartidor.tipo !== 'repartidor') return res.status(400).json({ error: 'Repartidor inválido' });

    // update order
    await orden.update({ repartidor_id, estado: 'asignada' });

    // emit event: order assigned (to order room and to the repartidor personal room)
    io.to(`order:${orden.id}`).emit('orden:asignada', { orderId: orden.id, repartidorId: repartidor_id });
    io.to(`user:${repartidor_id}`).emit('orden:asignada:personal', { orderId: orden.id });

    return res.json({ message: 'Repartidor asignado', orden });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// --- Example REST: client create order (simplified) ---
app.post('/ordenes', async (req, res) => {
  try {
    const { usuario_id, restaurante_id, items } = req.body;
    const orden = await Orden.create({ usuario_id, restaurante_id, estado: 'pendiente', total: 0 });

    // create ordenDetalle records (assume OrdenDetalle model exists)
    const detalles = items.map(it => ({ orden_id: orden.id, platillo_id: it.platillo_id, cantidad: it.cantidad }));
    const { OrdenDetalle } = require('./models');
    await OrdenDetalle.bulkCreate(detalles);

    // notify cooks maybe: join a restaurant room e.g. restaurant:<id>
    io.to(`restaurant:${restaurante_id}`).emit('orden:creada', { orderId: orden.id });

    return res.status(201).json({ ordenId: orden.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Optional: let cocinero join restaurant room when connecting ---
/* On socket connection:
   if user.tipo === 'cocinero' and user.restaurante_id:
      socket.join(`restaurant:${user.restaurante_id}`)
*/

server.listen(3000, () => {
  console.log('Server listening on :3000');
});
