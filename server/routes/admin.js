const express = require('express');
const router = express.Router();

const {
    fetchAllUsers,
    fetchAllOrders,
    fetchVerificationRequests,
    fetchAnalytics,
    verifyDriver 
  } = require('../controllers/adminDashboard');
  
  // Existing route
  router.get('/users', fetchAllUsers);
  
  // New routes to fix the errors
  router.get('/orders', fetchAllOrders);
  router.get('/verification-requests', fetchVerificationRequests);
  router.get('/analytics', fetchAnalytics);
  

  router.post('/verify', verifyDriver);

module.exports = router;
