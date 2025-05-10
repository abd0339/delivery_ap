// server/controllers/verificationController.js
const pool = require('../db');

exports.verifyDriver = async (req, res) => {
  const { driverId, status } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  try {
    await pool.query('BEGIN');

    await pool.query(
      'UPDATE driver_verification SET status = ? WHERE driver_id = ?',
      [status, driverId]
    );

    const driverStatus = status === 'approved' ? 1 : 0;
    await pool.query(
      'UPDATE drivers SET is_verified = ? WHERE driver_id = ?',
      [driverStatus, driverId]
    );

    await pool.query('COMMIT');
    res.json({ success: true, message: `Verification ${status}` });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Verification update error:', error);
    res.status(500).json({ success: false, message: 'Verification update failed' });
  }
};