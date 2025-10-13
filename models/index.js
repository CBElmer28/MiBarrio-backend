const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Platillo = require('./Platillo');
const Categoria = require('./Categoria');
const PlatilloCategoria = require('./PlatilloCategoria')

// Relaciones

Platillo.belongsToMany(Categoria, {
  through: PlatilloCategoria,
  foreignKey: 'platillo_id'
});

Categoria.belongsToMany(Platillo, {
  through: PlatilloCategoria,
  foreignKey: 'categoria_id'
});



module.exports = {
  sequelize,
  Usuario,
  Platillo,
  Categoria,
  PlatilloCategoria
};
