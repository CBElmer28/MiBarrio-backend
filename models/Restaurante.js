const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurante = sequelize.define('Restaurante', {
  nombre: DataTypes.STRING,
  rating: DataTypes.DECIMAL(2,1),
  imagen: DataTypes.STRING,
  delivery_cost: DataTypes.DECIMAL(10,2),
  tiempo_entrega: DataTypes.DECIMAL(10,2), 
  usuario_id: DataTypes.INTEGER,
  tipo: DataTypes.STRING
}, {
  timestamps: false // 👈 Esto evita que Sequelize use createdAt y updatedAt
});

module.exports = Restaurante;