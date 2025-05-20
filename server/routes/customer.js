const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /customers/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE customer_id = ?',
      [id]
    );
    if (!rows.length) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// server/routes/customer.js
router.put('/update-address/:customerId', async (req, res) => {
  const { lat, lng } = req.body;
  const { customerId } = req.params;

  try {
    const location = `${lat},${lng}`;
    await pool.query('UPDATE customers SET shop_address = ? WHERE customer_id = ?', [location, customerId]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update address' });
  }
});


module.exports = router;
