const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');

const app = express();
app.use(cors());
app.use(express.json());

// Rutas existentes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/platillos', require('./routes/Platillos'));
app.use('/api/restaurantes', require('./routes/Restaurantes'));
app.use('/api/favoritos', require('./routes/favoritos'));
app.use('/api/metodos-pago', require('./routes/MetodosPagos'));
app.use('/api/orden', require('./routes/Orden'));
app.use('/api/usuarios', require('./routes/Usuarios'));
app.use('/api/direcciones', require('./routes/Direcciones'));

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos conectada y sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});