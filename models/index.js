const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Platillo = require('./Platillo');
const Categoria = require('./Categoria');
const PlatilloCategoria = require('./PlatilloCategoria');
const Restaurante = require('./Restaurante');
const RestauranteCategoria = require('./RestauranteCategoria');

// Relaciones

Platillo.belongsToMany(Categoria, {
  through: PlatilloCategoria,
  foreignKey: 'platillo_id'
});

Categoria.belongsToMany(Platillo, {
  through: PlatilloCategoria,
  foreignKey: 'categoria_id'
});

Restaurante.belongsToMany(Categoria, {
  through: RestauranteCategoria,
  foreignKey: 'restaurante_id'
});

Categoria.belongsToMany(Restaurante, {
  through: RestauranteCategoria,
  foreignKey: 'categoria_id'
});


module.exports = {
  sequelize,
  Usuario,
  Platillo,
  Categoria,
  PlatilloCategoria,
  Restaurante,
  RestauranteCategoria
};
