const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurante = sequelize.define('Restaurante', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING,
  rating: DataTypes.DECIMAL(2,1),
  imagen: DataTypes.STRING,
  delivery_cost: DataTypes.DECIMAL(10,2),
  tiempo_entrega: DataTypes.DECIMAL(10,2), 
  tipo: DataTypes.STRING
}, {
  tableName: 'Restaurantes',
  timestamps: false // 👈 Esto evita que Sequelize use createdAt y updatedAt
});

module.exports = Restaurante;