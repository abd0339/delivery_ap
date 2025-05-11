const express = require('express');
const pool = require('../db');
const predictPrice = require('../utils/predictPrice');
const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
  const {
    customerId,
    items,
    deliveryAddress,
    paymentMethod,
    type, // "simple" or "package"
    length,
    weight,
  } = req.body;

  try {
    const totalAmount = predictPrice({ type, length, weight });

    const insertQuery = `
      INSERT INTO orders (
        customer_id,
        delivery_address,
        payment_method,
        total_amount,
        type,
        length,
        weight
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      customerId,
      deliveryAddress,
      paymentMethod,
      totalAmount,
      type,
      type === 'package' ? length : null,
      type === 'package' ? weight : null,
    ];

    const [orderResult] = await pool.query(insertQuery, values);

    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)',
        [orderResult.insertId, item.name, item.quantity, item.price]
      );
    }

    res.json({ success: true, orderId: orderResult.insertId, totalAmount });
  } catch (error) {
    console.error('Order creation failed:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get orders by customer ID (shop owner)
router.get('/shop/:customerId', async (req, res) => {
  const { customerId } = req.params;

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE customer_id = ?',
      [customerId]
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch shop orders' });
  }
});

// Get available (pending) orders
router.get('/available', async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE status = "pending"'
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch available orders' });
  }
});

// Get current orders for a driver
router.get('/current/:driverId', async (req, res) => {
  const { driverId } = req.params;

  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE driver_id = ? AND status IN ("accepted", "in_progress")',
      [driverId]
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch current orders' });
  }
});

module.exports = router;
