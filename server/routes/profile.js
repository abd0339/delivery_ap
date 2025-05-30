const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db'); // adjust path if your DB connection is elsewhere

// GET profile by userType and userId
router.get('/:userType/:userId', async (req, res) => {
  const { userType, userId } = req.params;

  try {
    let query;
    if (userType === 'customers') {
      query = 'SELECT email, phone_number, shop_name, shop_address FROM customers WHERE customer_id = ?';
    } else if (userType === 'drivers') {
      query = 'SELECT email, phone_number, vehicle_type FROM drivers WHERE driver_id = ?';
    } else if (userType === 'admins') {
      query = 'SELECT email FROM admins WHERE admin_id  = ?';
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
    shop_name,
    shop_address,
    vehicle_type,
  } = req.body;

  try {
    let table, idField, passwordField;
    if (userType === 'customer') {
      table = 'customers';
      idField = 'customer_id';
      passwordField = 'password';
    } else if (userType === 'driver') {
      table = 'drivers';
      idField = 'driver_id';
      passwordField = 'password';
    } else if (userType === 'admin') {
      table = 'admins';
      idField = 'admin_id';
      passwordField = 'password_hash';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid user type' });
    }

    const [rows] = await db.query(`SELECT ${passwordField} FROM ${table} WHERE ${idField} = ?`, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const storedHash = rows[0][passwordField];
    const match = await bcrypt.compare(currentPassword, storedHash);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Incorrect current password' });
    }

    const updateFields = [];
    const updateValues = [];

    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (phoneNumber) {
      updateFields.push('phone_number = ?');
      updateValues.push(phoneNumber);
    }

    if (newPassword) {
      const hashedNew = await bcrypt.hash(newPassword, 10);
      updateFields.push(`${passwordField} = ?`);
      updateValues.push(hashedNew);
    }

    if (userType === 'customer') {
      if (shopName) {
        updateFields.push('shop_name = ?');
        updateValues.push(shopName);
      }
      if (shopAddress) {
        updateFields.push('shop_address = ?');
        updateValues.push(shopAddress);
      }
    }

    if (userType === 'driver' && vehicleType) {
      updateFields.push('vehicle_type = ?');
      updateValues.push(vehicleType);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const updateQuery = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${idField} = ?`;
    updateValues.push(userId);

    await db.query(updateQuery, updateValues);
    res.json({ success: true, message: 'Profile updated successfully' });

  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


module.exports = router;
