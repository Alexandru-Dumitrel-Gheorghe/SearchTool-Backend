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

// Exportă modelul Produkt
module.exports = mongoose.model('Produkt', produktSchema);
