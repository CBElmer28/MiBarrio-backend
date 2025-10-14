const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RestauranteCategoria = sequelize.define('Restaurante_Categoria', {
  restaurante_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'Restaurante_Categoria',
  timestamps: false
});

module.exports = RestauranteCategoria;