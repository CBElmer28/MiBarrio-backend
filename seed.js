const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
const Platillo = require('./models/Platillo');
const bcrypt = require('bcrypt');

async function seed() {
  try {
    await sequelize.sync(); // Limpia y recrea las tablas

    /* Crear usuarios
    const cliente = await Usuario.create({
      nombre: 'Juan Cliente',
      email: 'cliente@example.com',
      contraseña: await bcrypt.hash('cliente123', 10),
      tipo: 'cliente'
    });

    const cocinero = await Usuario.create({
      nombre: 'Ana Cocinera',
      email: 'cocinero@example.com',
      contraseña: await bcrypt.hash('cocinero123', 10),
      tipo: 'cocinero'
    });

    // Crear platillos
    const platillos = [
      { nombre: 'Pizza Europea', rating: 4.5, tipo: 'Comida', imagen: 'pizzaeuropea.jpg', precio: 40 },
      { nombre: 'Hamburguesa Clásica', rating: 4.7, tipo: 'Comida', imagen: 'hamburguesa.jpg', precio: 25 },
      { nombre: 'Pollo a la Brasa', rating: 4.8, tipo: 'Comida', imagen: 'pollo.jpg', precio: 35 },
      { nombre: 'Tacos Mexicanos', rating: 4.6, tipo: 'Comida', imagen: 'tacos.jpg', precio: 30 },
      { nombre: 'Sushi Variado', rating: 4.9, tipo: 'Comida', imagen: 'sushi.jpg', precio: 50 }
    ];

    await Platillo.bulkCreate(platillos);*/

    console.log('Datos de prueba insertados correctamente.');
    process.exit();
  } catch (error) {
    console.error('Error al insertar datos de prueba:', error);
    process.exit(1);
  }
}

seed();