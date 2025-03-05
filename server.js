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

// Routes
app.use('/api/produkte', produktRoutes);

// Serve static files from 'uploads' if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * @desc   Return mock memory info for demonstration
 * @route  GET /api/system/memory
 */
app.get('/api/system/memory', (req, res) => {
  // In a real scenario, you'd fetch actual memory data or from your system.
  // For now, we just return mock data: total=16, used=8
  const total = 16;
  const used = 8;
  return res.json({ total, used });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
