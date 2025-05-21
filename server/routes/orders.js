const express = require('express');
const pool = require('../db');
const predictPrice = require('../ml/predictPrice');
const getDistance = require('../utils/getDistance');
const router = express.Router();

// Create a new order
module.exports = (io) => {

  router.post('/', async (req, res) => {
    const {
      customerId,
      orderType,
      serialNumber,
      originAddress,
      deliveryInfo,
      paymentMethod,
      packagePrice,
      length,
      weight
    } = req.body;
  
    try {
      // Validate required fields
      if (!customerId || !originAddress || !deliveryInfo || !packagePrice) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
      }
  
      // Calculate distance for package orders
      let distance = 0;
      if (orderType === 'package') {
        try {
          distance = await getDistance(originAddress,
            typeof deliveryInfo === 'string' ? deliveryInfo : `${deliveryInfo.lat},${deliveryInfo.lng}`
          ) || 0;
        } catch (distanceError) {
          console.error('Distance calculation failed:', distanceError);
          return res.status(400).json({ success: false, message: 'Invalid delivery location' });
        }
      }
  
      // Predict delivery fee
      let predictedPrice = 0;
      try {
        predictedPrice = await predictPrice({
          type: orderType === 'package' ? 1 : 0,
          length: parseFloat(length) || 0,
          weight: parseFloat(weight) || 0,
          distance
        });
      } catch (predictionError) {
        console.error('Price prediction failed:', predictionError);
        return res.status(500).json({ success: false, message: 'Price calculation failed' });
      }
  
      // Calculate totals
      const totalAmount = parseFloat(packagePrice) + predictedPrice;
  
      // Wallet balance check
      if (paymentMethod === 'wallet') {
        const [wallet] = await pool.query(
          'SELECT balance FROM wallets WHERE user_id = ? AND user_type = "customer"',
          [customerId]
        );
  
        if (!wallet.length || wallet[0].balance < totalAmount) {
          return res.status(400).json({
            success: false,
            message: 'Insufficient wallet balance'
          });
        }
      }
  
      // Create order transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();
  
      try {
        // Insert main order
        const [orderResult] = await connection.query(`
          INSERT INTO orders (
            customer_id,
            order_type,
            origin_address,
            delivery_address,
            payment_method,
            total_amount,
            predicted_price,
            serial_number,
            length,
            weight,
            price
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            customerId,
            orderType,
            originAddress,
            JSON.stringify(deliveryInfo),
            paymentMethod,
            totalAmount,
            predictedPrice,
            serialNumber || null,
            orderType === 'package' ? length : null,
            orderType === 'package' ? weight : null,
            packagePrice
          ]);
  
        // Update wallet if using wallet payment
        if (paymentMethod === 'wallet') {
          await connection.query(`
            UPDATE wallets 
            SET balance = balance - ?
            WHERE user_id = ? AND user_type = 'customer'
          `, [totalAmount, customerId]);
  
          await connection.query(`
            INSERT INTO transactions (
              wallet_id_out,
              amount,
              type,
              description,
              user_id
            ) VALUES (
              (SELECT wallet_id FROM wallets WHERE user_id = ? AND user_type = 'customer'),
              ?,
              'withdrawal',
              'Order payment',
              ?
            )
          `, [customerId, totalAmount, customerId]);
        }
  
        await connection.commit();
  
        let assignedDriver = {};
  
        // Auto-assign if it's a package and deliveryInfo is location
        if (orderType === 'package' && typeof deliveryInfo !== 'string') {
          const autoAssignDriver = require('../utils/autoAssignDriver');
          assignedDriver = await autoAssignDriver({
            originAddress,
            length,
            weight,
            orderType
          });
  
          // If a driver is found, update the order in DB
          if (assignedDriver.driverId) {
            await pool.query(
              'UPDATE orders SET driver_id = ?, status = "accepted" WHERE order_id = ?',
              [assignedDriver.driverId, orderResult.insertId]
            );
            const io = req.app.get('io');
            io.to(`driver:${assignedDriver.driverId}`).emit('newAssignedOrder', {
              orderId: orderResult.insertId,
              origin: originAddress,
              destination: deliveryInfo,
              total: totalAmount
            });
          }
        }
  
        res.json({
          success: true,
          orderId: orderResult.insertId,
          totalAmount,
          predictedPrice,
          autoAssignedTo: assignedDriver.driverId || null
        });
  
  
  
      } catch (transactionError) {
        await connection.rollback();
        throw transactionError;
      } finally {
        connection.release();
      }
  
    } catch (error) {
      console.error('Order creation failed:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create order'
      });
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
  
  // Accept an order by driver
  router.post('/accept', async (req, res) => {
    const { orderId, driverId } = req.body;
    if (!orderId || !driverId) {
      return res.status(400).json({ success: false, message: 'Missing orderId or driverId' });
    }
  
    try {
      const [result] = await pool.query(
        'UPDATE orders SET driver_id = ?, status = "accepted" WHERE order_id = ? AND status = "pending"',
        [driverId, orderId]
      );
  
      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, message: 'Order not found or already accepted' });
      }
      io.to(`order-${orderId}`).emit('orderAccepted', { orderId });
      res.json({ success: true, message: 'Order accepted successfully' });
  
    } catch (error) {
      console.error('Accept order error:', error);
      res.status(500).json({ success: false, message: 'Server error while accepting order' });
    }
  });
  
  // Get single order by ID
  router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await pool.query('SELECT * FROM orders WHERE order_id = ?', [id]);
      if (!rows.length) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.json(rows[0]);
    } catch (error) {
      console.error('Fetch order error:', error);
      res.status(500).json({ message: 'Error fetching order' });
    }
  });
  
  router.put('/mark-delivered/:orderId', async (req, res) => {
    const { orderId } = req.params;
    try {
      const [update] = await pool.query(
        'UPDATE orders SET status = ? WHERE order_id = ?',
        ['delivered', orderId]
      );
      res.json({ success: true, message: 'Order marked as delivered' });
    } catch (err) {
      console.error('Delivery update failed:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  });
  
  return router;
};
  