const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const multer = require('multer');
const path = require('path');
const router = express.Router();

// Setup multer with size limits
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    fieldSize: 10 * 1024 * 1024 // 10MB limit for text fields
  }
});

// REGISTER DRIVER
router.post('/', upload.single('idDocument'), async (req, res) => {
  try {
    console.log("Received driver registration data:", req.body);
    const { email, password, phoneNumber, vehicleType, username } = req.body;

    // Validate required fields
    if (!email || !password || !phoneNumber || !vehicleType || !username) {
      console.log("Missing fields");
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Validate uploaded file
    if (!req.file) {
      console.log("Missing ID document");
      return res.status(400).json({ success: false, message: 'ID document is required' });
    }

    const idDocumentPath = req.file.path;

    // Check if email or username already exists
    console.log("Checking if email or username exists:", email, username);
    const [rows] = await pool.query(
      'SELECT * FROM drivers WHERE email = ? OR username = ?',
      [email, username]
    );

    console.log("Query result:", rows);

    if (rows.length > 0) {
      const existing = rows[0];
      if (existing.email === email) {
        return res.status(409).json({ success: false, message: 'Email already exists' });
      } else if (existing.username === username) {
        return res.status(409).json({ success: false, message: 'Username already exists' });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB - using parameterized query for security
    await pool.query(
      `INSERT INTO drivers (email, password, phone_number, vehicle_type, id_document, username) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, phoneNumber, vehicleType, idDocumentPath, username]
    );

    console.log("Driver registration successful");
    res.json({ success: true });
  } catch (error) {
    console.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Email or username already exists' : 'Registration failed'
    });
  }
});

module.exports = router;
