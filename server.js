// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const produktRoutes = require('./routes/produktRoutes');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rute
app.use('/api/produkte', produktRoutes);

// Servire fișiere statice (PDF etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pornire server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
