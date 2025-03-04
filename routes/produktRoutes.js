// backend/routes/produktRoutes.js
const express = require('express');
const router = express.Router();
const Produkt = require('../models/Produkt');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary: if CLOUDINARY_URL is set, it will be used automatically;
// otherwise, use individual variables.
if (process.env.CLOUDINARY_URL) {
  cloudinary.config({ secure: true });
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

// Configure multer to temporarily store files in the "uploads" folder
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// @desc    Create or update product and upload file to Cloudinary
// @route   POST /api/produkte
router.post('/', upload.single('pdfDatei'), async (req, res) => {
  try {
    const { artikelnummer, beschreibung } = req.body;
    let fileUrl = '';

    if (req.file) {
      // Upload file to Cloudinary in the "Produktsuche" folder
      // Using resource_type: 'auto' to allow automatic detection of the file type.
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Produktsuche',
        resource_type: 'auto'
      });
      fileUrl = result.secure_url;
    }

    // Check if the product already exists
    let produkt = await Produkt.findOne({ artikelnummer });

    if (produkt) {
      // Update existing product
      produkt.beschreibung = beschreibung || produkt.beschreibung;
      if (fileUrl) produkt.pdfPfad = fileUrl;
      await produkt.save();
      return res.json({ success: true, message: 'Produkt aktualisiert', produkt });
    } else {
      // Create a new product
      produkt = new Produkt({
        artikelnummer,
        beschreibung,
        pdfPfad: fileUrl
      });
      await produkt.save();
      return res.json({ success: true, message: 'Neues Produkt erstellt', produkt });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Fehler beim Erstellen/Aktualisieren des Produkts' });
  }
});

// @desc    Retrieve all products
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

// @desc    Retrieve product by artikelnummer
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

// @desc    Delete product by artikelnummer
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
