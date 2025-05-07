const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust path if your DB connection is elsewhere

// GET profile by userType and userId
router.get('/:userType/:userId', async (req, res) => {
  const { userType, userId } = req.params;

  try {
    let query;
    if (userType === 'customer') {
      query = 'SELECT email, phone_number, shop_name, shop_address FROM customers WHERE customer_id = ?';
    } else if (userType === 'driver') {
      query = 'SELECT email, phone_number, vehicle_type FROM drivers WHERE driver_id = ?';
    } else if (userType === 'admin') {
      query = 'SELECT email FROM admin WHERE userId = ?';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    db.query(query, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json(results[0]);
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PUT update profile
router.put('/:userType/:userId', async (req, res) => {
  const { userType, userId } = req.params;
  const {
    email,
    phoneNumber,
    currentPassword,
    newPassword,
    shopName,
    shopAddress,
    vehicleType,
  } = req.body;

  try {
    let query, updateFields = [], updateValues = [];

    // Get current password for verification
    let passwordQuery, passwordField, table, idField;
    if (userType === 'customer') {
      table = 'customers';
      idField = 'customer_id';
      passwordField = 'password';
    } else if (userType === 'driver') {
      table = 'drivers';
      idField = 'driver_id';
      passwordField = 'password';
    } else if (userType === 'admin') {
      table = 'admin';
      idField = 'userId';
      passwordField = 'password';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    // Check if current password is correct
    passwordQuery = `SELECT ${passwordField} FROM ${table} WHERE ${idField} = ?`;
    db.query(passwordQuery, [userId], (err, results) => {
      if (err || results.length === 0) {
        return res.status(500).json({ success: false, message: 'User not found or error' });
      }

      const actualPassword = results[0][passwordField];
      if (actualPassword !== currentPassword) {
        return res.status(401).json({ success: false, message: 'Incorrect current password' });
      }

      // Build dynamic update query
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (phoneNumber) {
        updateFields.push('phone_number = ?');
        updateValues.push(phoneNumber);
      }
      if (newPassword) {
        updateFields.push(`${passwordField} = ?`);
        updateValues.push(newPassword);
      }
      if (userType === 'customer') {
        if (shopName) {
          updateFields.push('shopName = ?');
          updateValues.push(shopName);
        }
        if (shopAddress) {
          updateFields.push('shopAddress = ?');
          updateValues.push(shopAddress);
        }
      }
      if (userType === 'driver' && vehicleType) {
        updateFields.push('vehicleType = ?');
        updateValues.push(vehicleType);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update' });
      }

      const updateQuery = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${idField} = ?`;
      updateValues.push(userId);

      db.query(updateQuery, updateValues, (err) => {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).json({ success: false, message: 'Failed to update profile' });
        }

        res.json({ success: true, message: 'Profile updated successfully' });
      });
    });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
