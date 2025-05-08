const express = require('express');
const pool = require('../db');
const router = express.Router();

// All valid user types
const validUserTypes = ['driver', 'shopowner', 'customer'];

// Fetch or create wallet (safely, one per user)
router.get('/:userType/:id', async (req, res) => {
  const { userType, id } = req.params;

  if (!userType || !id || !validUserTypes.includes(userType)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid user type or ID' });
  }

  try {
    // Try selecting existing wallet
    const [walletRows] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ? AND user_type = ? LIMIT 1',
      [id, userType]
    );

    if (walletRows.length > 0) {
      return res.json(walletRows[0]);
    }

    // Insert only if not exists (thanks to UNIQUE KEY constraint)
    await pool.query(
      'INSERT IGNORE INTO wallets (user_id, user_type, balance) VALUES (?, ?, 0.00)',
      [id, userType]
    );

    // Fetch again
    const [newWallet] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ? AND user_type = ? LIMIT 1',
      [id, userType]
    );

    return res.json(newWallet[0]);
  } catch (error) {
    console.error('Fetch or create wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch or create wallet' });
  }
});

// Add funds
router.post('/add-funds', async (req, res) => {
  const { userId, userType, amount } = req.body;

  if (!userId || !userType || amount === undefined || !validUserTypes.includes(userType)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid userId, userType, or amount' });
  }

  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  try {
    // Ensure wallet exists using safe insert
    await pool.query(
      'INSERT IGNORE INTO wallets (user_id, user_type, balance) VALUES (?, ?, 0.00)',
      [userId, userType]
    );

    // Update wallet
    await pool.query(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ? AND user_type = ?',
      [parsedAmount, userId, userType]
    );

    // Record transaction
    await pool.query(
      'INSERT INTO transactions (user_id, user_type, type, amount, description) VALUES (?, ?, "deposit", ?, "Funds added")',
      [userId, userType, parsedAmount]
    );

    // Return new balance
    const [updatedWallet] = await pool.query(
      'SELECT balance FROM wallets WHERE user_id = ? AND user_type = ? LIMIT 1',
      [userId, userType]
    );

    res.json({ success: true, balance: updatedWallet[0].balance });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ success: false, message: 'Failed to add funds' });
  }
});

// Get transaction history
router.get('/transactions/:userType/:id', async (req, res) => {
  const { userType, id } = req.params;

  if (!userType || !id || !validUserTypes.includes(userType)) {
    return res.status(400).json({ success: false, message: 'Missing or invalid user type or ID' });
  }

  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ? AND user_type = ?',
      [id, userType]
    );

    res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

module.exports = router;
