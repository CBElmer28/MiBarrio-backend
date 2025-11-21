const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Favorito = sequelize.define('Favorito', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    cliente_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Usuarios',
            key: 'id'
        }
    },
    platillo_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Platillos',
            key: 'id'
        }
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'favoritos',
    timestamps: false
});

module.exports = Favorito;
