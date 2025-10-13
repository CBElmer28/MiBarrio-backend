const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlatilloCategoria = sequelize.define('Platillo_Categoria', {
  platillo_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  categoria_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'Platillo_Categoria',
  timestamps: false // 👈 Esto evita que Sequelize intente crear created_at y updated_at
});

module.exports = PlatilloCategoria;