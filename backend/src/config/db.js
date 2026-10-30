const mongoose = require('mongoose');

// Función para conectar con MongoDB Atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB conectado correctamente: ${conn.connection.host}`);

  } catch (error) {
    console.error(`Error al conectar con MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
