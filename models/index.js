const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const MetodoPago = require('./MetodoPago');
const MetodoPagoUsuario = require('./MetodoPagoUsuario');
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

Usuario.belongsToMany(MetodoPago, {
    through: MetodoPagoUsuario,
    foreignKey: 'usuario_id',
    as: 'metodos_pago'
});

MetodoPago.belongsToMany(Usuario, {
    through: MetodoPagoUsuario,
    foreignKey: 'metodo_pago_id',
    as: 'usuarios'
});

MetodoPagoUsuario.belongsTo(MetodoPago, {
    foreignKey: 'metodo_pago_id',
    as: 'metodo_pago'
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
  Favorito,
  MetodoPago,
  MetodoPagoUsuario
};
