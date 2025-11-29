const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  // 1. Lee el dialecto del .env (Si no existe, asume 'mysql')
  dialect: process.env.DB_DIALECT || 'mysql', 
  port: process.env.DB_PORT || 3306,
  
  // 2. Lógica Híbrida: Solo activa SSL si estamos usando Postgres (Nube)
  // Si estamos en MySQL (Local/XAMPP), deja esto vacío para que no falle.
  dialectOptions: process.env.DB_DIALECT === 'postgres' ? {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  } : {}, 

  logging: false,
  define: {
    underscored: true
  }
});

module.exports = sequelize;