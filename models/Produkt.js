// backend/models/Produkt.js
const mongoose = require('mongoose');

const produktSchema = new mongoose.Schema({
  artikelnummer: {
    type: String,
    required: true,
    unique: true
  },
  beschreibung: {
    type: String
  },
  pdfPfad: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now // Folosit pentru chart / sortare
  }
});

module.exports = mongoose.model('Produkt', produktSchema);
