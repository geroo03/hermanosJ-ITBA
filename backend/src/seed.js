
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');
const products = require('./data/products');

// Convertir los productos al nuevo formato de MongoDB
const seedProducts = products.map((product) => ({
  nombre: product.name,
  descripcion: product.description,
  precio: product.price,
  stock: 0,
  imagenUrl: product.image,
}));

// Cargar los productos iniciales
const seedDatabase = async () => {
  try {
    await connectDB();

    // Limpiar los productos existentes antes de cargar los iniciales
    await Product.deleteMany({});

    // Insertar los 11 productos
    const insertedProducts = await Product.insertMany(seedProducts);

    console.log(`${insertedProducts.length} productos cargados correctamente en MongoDB.`);
  } catch (error) {
    console.error('Error al cargar los productos:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log('Conexión con MongoDB cerrada.');
  }
};

seedDatabase();
