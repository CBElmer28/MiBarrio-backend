const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const OrdenDetalle = sequelize.define("OrdenDetalle", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  orden_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  platillo_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  subtotal: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'orden_detalle',
  freezeTableName: true
});

module.exports = OrdenDetalle;
