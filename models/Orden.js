const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Orden = sequelize.define("Orden", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  cliente_id: DataTypes.INTEGER,
  restaurante_id: DataTypes.INTEGER,
  repartidor_id: DataTypes.INTEGER,
  estado: DataTypes.STRING,
  total: DataTypes.FLOAT
});

module.exports = Orden;

