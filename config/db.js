const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Setează strictQuery pentru a elimina avertismentul de deprecation
    mongoose.set('strictQuery', false);

    // Conectare la MongoDB
    await mongoose.connect(process.env.MONGO_URI); // asigură-te că ai un MONGO_URI valid în .env
    console.log('Mit MongoDB verbunden!');
  } catch (error) {
    console.error('Fehler bei der MongoDB-Verbindung:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
