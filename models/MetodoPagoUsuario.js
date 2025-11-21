const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const MetodoPago = require('./MetodoPago');

const MetodoPagoUsuario = sequelize.define('MetodoPagoUsuario', {
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
    metodo_pago_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'metodos_pago',
            key: 'id'
        }
    },
    detalles: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    principal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    fecha_asignacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'metodos_pago_usuario',
    timestamps: false
});

MetodoPagoUsuario.belongsTo(MetodoPago, {
    foreignKey: 'metodo_pago_id',
    as: 'metodoPago'
});

module.exports = MetodoPagoUsuario;
