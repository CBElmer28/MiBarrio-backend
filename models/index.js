const sequelize = require('../config/database');

// Importación de modelos existentes
const Usuario = require('./Usuario');
const MetodoPago = require('./MetodoPago');
const MetodoPagoUsuario = require('./MetodoPagoUsuario');
const Platillo = require('./Platillo');
const Categoria = require('./Categoria');
const PlatilloCategoria = require('./PlatilloCategoria');
const Restaurante = require('./Restaurante');
const RestauranteCategoria = require('./RestauranteCategoria');
const Favorito = require('./Favorito');

// Nuevos modelos necesarios
const Orden = require('./Orden');
const OrdenDetalle = require('./OrdenDetalle');


/* ===========================================================
 *  Relaciones: Restaurante → Usuarios (cocineros y repartidores)
 * =========================================================== */
Restaurante.hasMany(Usuario, {
  foreignKey: 'restaurante_id',
  as: 'usuarios'
});

Usuario.belongsTo(Restaurante, {
  foreignKey: 'restaurante_id',
  as: 'restaurante'
});


/* ===========================================================
 *  Relaciones: Restaurante ↔ Categoría
 * =========================================================== */
Restaurante.belongsToMany(Categoria, {
  through: RestauranteCategoria,
  foreignKey: 'restaurante_id',
  as: 'categorias'
});

Categoria.belongsToMany(Restaurante, {
  through: RestauranteCategoria,
  foreignKey: 'categoria_id',
  as: 'restaurantes'
});


/* ===========================================================
 *  Relaciones: Platillo ↔ Categoría
 * =========================================================== */
Platillo.belongsToMany(Categoria, {
  through: PlatilloCategoria,
  foreignKey: 'platillo_id',
  as: 'categorias'
});

Categoria.belongsToMany(Platillo, {
  through: PlatilloCategoria,
  foreignKey: 'categoria_id',
  as: 'platillos'
});


/* ===========================================================
 *  Relaciones: Restaurante → Platillos
 * =========================================================== */
Restaurante.hasMany(Platillo, { 
  foreignKey: 'restaurante_id', 
  as: 'platillos' 
});

Platillo.belongsTo(Restaurante, { 
  foreignKey: 'restaurante_id', 
  as: 'restaurante' 
});


/* ===========================================================
 *  Relaciones: Usuario → Favoritos
 * =========================================================== */
Usuario.hasMany(Favorito, {
  foreignKey: 'cliente_id',
  as: 'favoritos'
});

Favorito.belongsTo(Usuario, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});


/* ===========================================================
 *  Relaciones: Platillo → Favoritos
 * =========================================================== */
Platillo.hasMany(Favorito, {
  foreignKey: 'platillo_id',
  as: 'favoritos'
});

Favorito.belongsTo(Platillo, {
  foreignKey: 'platillo_id',
  as: 'platillo'
});


/* ===========================================================
 *  Relaciones: Usuario ↔ Métodos de Pago
 * =========================================================== */
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


/* ===========================================================
 *  ORDENES Y DETALLES
 * =========================================================== */

// Cliente → Ordenes
Usuario.hasMany(Orden, {
  foreignKey: 'cliente_id',
  as: 'ordenes_cliente'
});
Orden.belongsTo(Usuario, {
  foreignKey: 'cliente_id',
  as: 'cliente'
});

// Restaurante → Ordenes
Restaurante.hasMany(Orden, {
  foreignKey: 'restaurante_id',
  as: 'ordenes'
});
Orden.belongsTo(Restaurante, {
  foreignKey: 'restaurante_id',
  as: 'restaurante'
});

// Repartidor → Ordenes
Usuario.hasMany(Orden, {
  foreignKey: 'repartidor_id',
  as: 'ordenes_repartidor'
});
Orden.belongsTo(Usuario, {
  foreignKey: 'repartidor_id',
  as: 'repartidor'
});

// Orden → OrdenDetalle
Orden.hasMany(OrdenDetalle, {
  foreignKey: 'orden_id',
  as: 'detalles'
});
OrdenDetalle.belongsTo(Orden, {
  foreignKey: 'orden_id',
  as: 'orden'
});

// Platillo → OrdenDetalle
Platillo.hasMany(OrdenDetalle, {
  foreignKey: 'platillo_id',
  as: 'ordenes_detalle'
});
OrdenDetalle.belongsTo(Platillo, {
  foreignKey: 'platillo_id',
  as: 'platillo'
});



/* ===========================================================
 *  Exportar modelos
 * =========================================================== */
module.exports = {
  sequelize,

  Usuario,
  MetodoPago,
  MetodoPagoUsuario,

  Platillo,
  Categoria,
  PlatilloCategoria,

  Restaurante,
  RestauranteCategoria,

  Favorito,

  Orden,
  OrdenDetalle
};
