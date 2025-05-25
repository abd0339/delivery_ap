const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM drivers WHERE driver_id = ?', [id]);
    if (!rows.length) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 
