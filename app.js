
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/platillos', require('./routes/Platillos'));
app.use('/api/restaurantes', require('./routes/Restaurantes'));
app.use('/api/favoritos', require('./routes/favoritos'));

const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos conectada');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
