// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');
const produktRoutes = require('./routes/produktRoutes');
const hidriveRoutes = require('./routes/hidriveRoutes'); // new route

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Existing routes
app.use('/api/produkte', produktRoutes);

// New route for HiDrive OAuth
app.use('/api/hidrive', hidriveRoutes);

// Serve static files if needed
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
