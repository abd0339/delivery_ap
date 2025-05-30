const express = require('express');
const pool = require('../db');
const db = require('../db');

const router = express.Router();

const {
    fetchAllUsers,
    fetchAllOrders,
    fetchVerificationRequests,
    fetchAnalytics,
    verifyDriver 
  } = require('../controllers/adminDashboard');

  const { toggleUserPause } = require('../controllers/adminDashboard');
  
  // Existing route
  router.get('/users', fetchAllUsers);
  
  // New routes to fix the errors
  router.get('/orders', fetchAllOrders);
  router.get('/verification-requests', fetchVerificationRequests);
  router.get('/analytics', fetchAnalytics);
  router.post('/users/pause', toggleUserPause);
  router.post('/verify', verifyDriver);

  router.delete('/users/:type/:id', async (req, res) => {
    const { type, id } = req.params;
  
    try {
      let table;
      if (type === 'customer') table = 'customers';
      else if (type === 'driver') table = 'drivers';
      else if (type === 'admin') table = 'admins';
      else return res.status(400).json({ success: false, message: 'Invalid user type' });
  
      const column = type === 'customer' ? 'customer_id' : type === 'driver' ? 'driver_id' : 'admin_id';
  
      const [result] = await pool.query(`DELETE FROM ${table} WHERE ${column} = ?`, [id]);
  
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.json({ success: true });
    } catch (err) {
      console.error('Delete user error:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
module.exports = router;
