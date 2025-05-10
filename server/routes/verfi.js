const express = require('express');
const router = express.Router();
const pool = require('../db');
const { isAdmin } = require('../middleware/auth'); // Adjusted path

// Get pending verification requests
router.get('/requests', isAdmin, async (req, res) => {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.id_verification_id AS verificationId,
          d.driver_id AS driverId, 
          d.username,
          d.email,
          v.document_image AS document,
          v.verified AS adminApproved
        FROM driver_verification v
        JOIN drivers d ON v.driver_id = d.driver_id
        WHERE d.verification_status = 'pending'
      `);
      res.json({ success: true, requests: rows });
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch requests' });
    }
  });

// Approve/Reject driver
router.post('/verify-driver', isAdmin, async (req, res) => {
    const { driverId, status } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
  
    try {
      await pool.query('BEGIN');
  
      // Update driver's main verification status
      await pool.query(
        'UPDATE drivers SET verification_status = ? WHERE driver_id = ?',
        [status, driverId]
      );
  
      // Update verification record
      await pool.query(
        'UPDATE driver_verification SET verified = ? WHERE driver_id = ?',
        [status === 'verified' ? 1 : 0, driverId]
      );
  
      await pool.query('COMMIT');
      res.json({ success: true, message: `Verification ${status}` });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Verification update error:', error);
      res.status(500).json({ success: false, message: 'Verification update failed' });
    }
  });

// Check verification status
router.get('/status/:driverId', async (req, res) => {
    try {
      const [result] = await pool.query(
        `SELECT 
          d.verification_status AS driverStatus,
          v.verified AS adminVerified
         FROM drivers d
         LEFT JOIN driver_verification v ON d.driver_id = v.driver_id
         WHERE d.driver_id = ?`,
        [req.params.driverId]
      );
  
      if (result.length === 0) {
        return res.status(404).json({ success: false, message: 'Driver not found' });
      }
  
      res.json({
        success: true,
        isVerified: result[0].driverStatus === 'verified',
        verificationStatus: result[0].driverStatus,
        adminApproval: Boolean(result[0].adminVerified)
      });
    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({ success: false, message: 'Failed to check status' });
    }
  });

module.exports = router;