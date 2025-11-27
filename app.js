const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Inicializar App
const app = express();

// Middlewares Globales
app.use(cors());
app.use(express.json());

// --- RUTAS ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platillos', require('./routes/Platillos'));
app.use('/api/restaurantes', require('./routes/Restaurantes'));
app.use('/api/favoritos', require('./routes/Favoritos'));
app.use('/api/metodos-pago', require('./routes/MetodosPagos'));
app.use('/api/orden', require('./routes/Orden'));
app.use('/api/usuarios', require('./routes/Usuarios'));
app.use('/api/direcciones', require('./routes/Direcciones'));

module.exports = app;