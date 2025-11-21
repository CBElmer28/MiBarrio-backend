const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Platillo = sequelize.define('Platillo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: true
    },
    imagen: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    restaurante_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'Platillos',
    timestamps: false
});

module.exports = Platillo;
