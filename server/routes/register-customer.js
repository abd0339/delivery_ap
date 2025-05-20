const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const router = express.Router();


// REGISTER CUSTOMER
router.post('/', async (req, res) => {
  try {
    console.log("Received registration data:", req.body);
    const { email, password, phoneNumber, shopName, shopAddress, username } = req.body;

    // Validate required fields
    if (!email || !password || !phoneNumber || !shopName || !shopAddress || !username) {
      console.log("Missing fields");
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Check if email or username already exists
    console.log("Checking if email or username exists:", email, username);
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE email = ? OR username = ?',
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

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO customers (email, password, phone_number, shop_name, shop_address, username) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, hashedPassword, phoneNumber, shopName, shopAddress, username]
    );
    const coords = JSON.parse(shopAddress); 
    console.log("Registration successful");
    res.json({ success: true });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({
      success: false,
      message: error.code === 'ER_DUP_ENTRY' ? 'Email or username already exists' : 'Registration failed'
    });
  }
});

module.exports = router;
