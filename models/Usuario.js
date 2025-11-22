const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contraseña: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.ENUM('cliente', 'cocinero','repartidor'),
    defaultValue: 'cliente',
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  imagen_perfil: {
    type: DataTypes.STRING,
    allowNull: true
  },
  restaurante_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
},{
  tableName: 'Usuarios',
  timestamps: false
}
);

module.exports = Usuario;