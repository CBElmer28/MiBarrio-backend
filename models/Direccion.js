const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Direccion = sequelize.define('Direccion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Usuarios',
      key: 'id'
    }
  },
  direccion: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: "Texto completo de la dirección"
  },
  etiqueta: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: "Ej: Casa, Trabajo, Oficina"
  },
  principal: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: "1 si es la dirección por defecto, 0 si no"
  }
}, {
  tableName: 'Direcciones',
  timestamps: false
});

module.exports = Direccion;