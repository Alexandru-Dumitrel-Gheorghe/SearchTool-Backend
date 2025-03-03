// backend/routes/produktRoutes.js
const express = require('express');
const router = express.Router();
const Produkt = require('../models/Produkt');
const multer = require('multer');
const path = require('path');

// Configurare multer pentru salvarea PDF-urilor
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // unde se vor salva fișierele
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @desc    Creare sau actualizare produs + încărcare PDF
// @route   POST /api/produkte
router.post('/', upload.single('pdfDatei'), async (req, res) => {
  try {
    const { artikelnummer, beschreibung } = req.body;

    // Verificăm dacă s-a încărcat un fișier
    let pdfPfad = '';
    if (req.file) {
      pdfPfad = req.file.path; // calea fișierului în folderul 'uploads'
    }

    // Verificăm dacă există deja produsul
    let produkt = await Produkt.findOne({ artikelnummer });

    if (produkt) {
      // Actualizează produsul existent
      produkt.beschreibung = beschreibung || produkt.beschreibung;
      if (pdfPfad) produkt.pdfPfad = pdfPfad;
      await produkt.save();
      return res.json({ success: true, message: 'Produkt aktualisiert', produkt });
    } else {
      // Creează un nou produs
      produkt = new Produkt({
        artikelnummer,
        beschreibung,
        pdfPfad
      });
      await produkt.save();
      return res.json({ success: true, message: 'Neues Produkt erstellt', produkt });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Fehler beim Erstellen/Aktualisieren des Produkts' });
  }
});

// @desc    Obține toate produsele
// @route   GET /api/produkte
router.get('/', async (req, res) => {
  try {
    const produkte = await Produkt.find({});
    res.json(produkte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Produkte' });
  }
});

// @desc    Obține un produs după Artikelnummer
// @route   GET /api/produkte/:artikelnummer
router.get('/:artikelnummer', async (req, res) => {
  try {
    const produkt = await Produkt.findOne({ artikelnummer: req.params.artikelnummer });
    if (!produkt) {
      return res.status(404).json({ message: 'Produkt nicht gefunden' });
    }
    res.json(produkt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Abrufen des Produkts' });
  }
});

// @desc    Șterge un produs după Artikelnummer
// @route   DELETE /api/produkte/:artikelnummer
router.delete('/:artikelnummer', async (req, res) => {
  try {
    const produkt = await Produkt.findOneAndDelete({ artikelnummer: req.params.artikelnummer });
    if (!produkt) {
      return res.status(404).json({ message: 'Produkt nicht gefunden' });
    }
    res.json({ success: true, message: 'Produkt gelöscht' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Löschen des Produkts' });
  }
});

module.exports = router;
