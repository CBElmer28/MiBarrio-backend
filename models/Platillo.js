const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Platillo = sequelize.define('Platillo', {
  nombre: DataTypes.STRING,
  rating: DataTypes.DECIMAL(2,1),
  imagen: DataTypes.STRING,
  precio: DataTypes.DECIMAL(10,2)
}, {
  timestamps: false // 👈 Esto evita que Sequelize use createdAt y updatedAt
});

module.exports = Platillo;