const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Platillo = require('./Platillo');
const Categoria = require('./Categoria');
const PlatilloCategoria = require('./PlatilloCategoria');
const Restaurante = require('./Restaurante');
const RestauranteCategoria = require('./RestauranteCategoria');
const Favorito = require('./Favorito');

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

Restaurante.hasMany(Platillo, { 
  foreignKey: 'restaurante_id', 
  as: 'platillos' 
});

Platillo.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});

Usuario.hasMany(Favorito, {
    foreignKey: 'cliente_id',
    as: 'favoritos'
});

Favorito.belongsTo(Usuario, {
    foreignKey: 'cliente_id',
    as: 'cliente'
});

Platillo.hasMany(Favorito, {
    foreignKey: 'platillo_id',
    as: 'favoritos'
});

Favorito.belongsTo(Platillo, {
    foreignKey: 'platillo_id',
    as: 'platillo'
});


module.exports = {
  sequelize,
  Usuario,
  Platillo,
  Categoria,
  PlatilloCategoria,
  Restaurante,
  RestauranteCategoria,
  Favorito
};
