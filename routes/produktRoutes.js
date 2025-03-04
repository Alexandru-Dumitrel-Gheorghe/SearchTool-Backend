// backend/routes/produktRoutes.js
const express = require('express');
const router = express.Router();
const Produkt = require('../models/Produkt');
const multer = require('multer');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');

dotenv.config();

// Configure Cloudinary
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

// Configure multer pentru a stoca temporar fișierele
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

/**
 * @desc  Create or update product and upload file to Cloudinary
 * @route POST /api/produkte
 */
router.post('/', upload.single('pdfDatei'), async (req, res) => {
  try {
    const { artikelnummer, beschreibung } = req.body;
    let fileUrl = '';

    if (req.file) {
      // resource_type: 'auto' pentru a încărca orice tip de fișier
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'Produktsuche',
        resource_type: 'auto'
      });
      fileUrl = result.secure_url;
    }

    // Verifică dacă produsul există deja
    let produkt = await Produkt.findOne({ artikelnummer });

    if (produkt) {
      // Actualizează produsul existent
      produkt.beschreibung = beschreibung || produkt.beschreibung;
      if (fileUrl) produkt.pdfPfad = fileUrl;
      await produkt.save();
      return res.json({ success: true, message: 'Produkt aktualisiert', produkt });
    } else {
      // Creează un nou produs
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

/**
 * @desc    Retrieve products with optional filtering, sorting, pagination
 * @route   GET /api/produkte
 * @query   searchTerm, hasPDF, sort, order, page, limit
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 999999,       // poți seta alt default
      sort = 'createdAt',   // criteriu default
      order = 'desc',       // ordinea default
      searchTerm = '',      // filtrare text
      hasPDF = ''           // 'true' / 'false' / ''
    } = req.query;

    const query = {};

    // Filtru searchTerm -> caută în artikelnummer sau beschreibung
    if (searchTerm) {
      query.$or = [
        { artikelnummer: { $regex: searchTerm, $options: 'i' } },
        { beschreibung: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    // Filtru hasPDF
    if (hasPDF === 'true') {
      query.pdfPfad = { $exists: true, $ne: '' };
    } else if (hasPDF === 'false') {
      query.$or = [
        { pdfPfad: { $exists: false } },
        { pdfPfad: '' }
      ];
    }

    const skip = (page - 1) * limit;
    const sortOption = order === 'asc' ? sort : `-${sort}`;

    // Query + sort + skip + limit
    const [produkte, totalCount] = await Promise.all([
      Produkt.find(query)
        .sort(sortOption)
        .skip(parseInt(skip))
        .limit(parseInt(limit)),
      Produkt.countDocuments(query)
    ]);

    // Returnăm obiect cu produkte și totalCount
    return res.json({
      produkte,
      totalCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Produkte' });
  }
});

/**
 * @desc    Retrieve product by artikelnummer
 * @route   GET /api/produkte/:artikelnummer
 */
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

/**
 * @desc    Delete product by artikelnummer
 * @route   DELETE /api/produkte/:artikelnummer
 */
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

/**
 * @desc    Return stats about products
 * @route   GET /api/produkte/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const totalProducts = await Produkt.countDocuments({});
    const withPDF = await Produkt.countDocuments({
      pdfPfad: { $exists: true, $ne: '' }
    });

    // Ultimele 7 zile
    const last7days = new Date();
    last7days.setDate(last7days.getDate() - 6);

    // Group by zi
    const productsByDay = await Produkt.aggregate([
      { $match: { createdAt: { $gte: last7days } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Transformăm datele în array { date, count }
    const statsChart = productsByDay.map(item => ({
      date: item._id,
      count: item.count
    }));

    res.json({
      totalProducts,
      withPDF,
      statsChart
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
