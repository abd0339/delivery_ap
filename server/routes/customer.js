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

module.exports = router;
