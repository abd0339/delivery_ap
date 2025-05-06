const express = require('express');
const pool = require('../db');
const router = express.Router();

// Add funds to user's wallet and insert into transaction history
router.post('/add-funds', async (req, res) => {
  const { userId, amount } = req.body;

  if (!userId || !amount) {
    return res.status(400).json({ success: false, message: 'Missing userId or amount' });
  }

  try {
    await pool.query(
      'UPDATE wallets SET balance = balance + ? WHERE user_id = ?',
      [amount, userId]
    );

    await pool.query(
      'INSERT INTO transactions (user_id, type, amount, description) VALUES (?, "deposit", ?, "Funds added")',
      [userId, amount]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Add funds error:', error);
    res.status(500).json({ success: false, message: 'Failed to add funds' });
  }
});

// Fetch wallet balance by user ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const [wallets] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [id]
    );
    res.json(wallets[0] || { balance: 0 });
  } catch (error) {
    console.error('Fetch wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
  }
});

// Fetch transaction history by user ID
router.get('/transactions/:id', async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ success: false, message: 'User ID is required' });
  }

  try {
    const [transactions] = await pool.query(
      'SELECT * FROM transactions WHERE user_id = ?',
      [id]
    );
    res.json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
  }
});

// Fetch wallet balance for shop owner by their user ID
router.get('/shop/:shopOwnerId', async (req, res) => {
  const { shopOwnerId } = req.params;

  if (!shopOwnerId) {
    return res.status(400).json({ success: false, message: 'Shop owner ID is required' });
  }

  try {
    const [wallets] = await pool.query(
      'SELECT * FROM wallets WHERE user_id = ?',
      [shopOwnerId]
    );
    res.json(wallets[0] || { balance: 0 });
  } catch (error) {
    console.error('Fetch shop wallet error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
  }
});

module.exports = router;
