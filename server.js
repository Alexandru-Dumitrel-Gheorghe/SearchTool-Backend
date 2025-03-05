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

// Routes for products
app.use('/api/produkte', produktRoutes);

// Serve static files from 'uploads' if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Memory endpoint: Returns mock memory info for demonstration
app.get('/api/system/memory', (req, res) => {
  // In a real scenario, replace this with actual memory usage data
  const total = 16; // e.g., 16GB total
  const used = 8;   // e.g., 8GB used
  return res.json({ total, used });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
