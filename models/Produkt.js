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
  }
});

// AICI, la final:
module.exports = mongoose.model('Produkt', produktSchema);
