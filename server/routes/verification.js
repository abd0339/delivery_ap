const express = require('express');
const pool = require('../db');
const router = express.Router();

// Verify or reject a driver
router.post('/driver/:id/verify', async (req, res) => {
  const driverId = req.params.id;
  const { status } = req.body;

  // Validate the status input to ensure only valid options are accepted
  if (!['verified', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    // Update the driver's verification status in the database
    await pool.query(
      'UPDATE drivers SET verification_status = ? WHERE driver_id = ?',  // Use 'driver_id' column for the driver identifier
      [status, driverId]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating verification status:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// Fetch verification status for a driver
router.get('/:driverId', async (req, res) => {
  const { driverId } = req.params;
  console.log('Checking verification for driverId:', driverId);
  try {
    // Fetch the driver's verification status from the database
    const [rows] = await pool.query(
      'SELECT verification_status FROM drivers WHERE driver_id = ?',  // Ensure we are using the correct 'driver_id' column
      [driverId]
    );

    // Check if the driver exists and if their verification status is 'verified'
    const isVerified = rows.length > 0 && rows[0].verification_status === 'verified';
    res.json({ isVerified });
  } catch (error) {
    console.error('Fetch verification status error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch verification status' });
  }
});

module.exports = router;
