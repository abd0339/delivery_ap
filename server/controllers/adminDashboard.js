const pool = require('../db');
const db = require('../db');


// Fetch all users (customers + drivers + admins)
exports.fetchAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT 'customer' AS type, customer_id AS id, email, created_at FROM customers
      UNION ALL
      SELECT 'driver' AS type, driver_id AS id, email, created_at FROM drivers
      UNION ALL
      SELECT 'admin' AS type, admin_id AS id, email, created_at FROM admins
    `);

    res.json({ success: true, users });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

// Fetch all orders
exports.fetchAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(`SELECT * FROM orders`);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
};

// Fetch verification requests
exports.fetchVerificationRequests = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id_verification_id AS id, driver_id AS driver, document_image AS document
      FROM driver_verification
      WHERE verified = 0
    `);
    res.json({ requests: rows });
  } catch (error) {
    console.error('Verification request fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
};

// Fetch analytics summary
exports.fetchAnalytics = async (req, res) => {
  try {
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const [[{ totalRevenue }]] = await pool.query(`SELECT SUM(total_amount) AS totalRevenue FROM orders`);
    const [[{ activeUsers }]] = await pool.query(`
      SELECT COUNT(*) AS activeUsers FROM (
        SELECT email FROM customers
        UNION
        SELECT email FROM drivers
      ) AS all_users
    `);

    res.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue: `$${totalRevenue || 0}`,
        activeUsers
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
};

// POST route to approve or reject driver
exports.verifyDriver = async (req, res) => {
  try {
    const { driverId, status } = req.body;

    const sql = "SELECT * FROM driver_verification WHERE driver_id = ?";
    const [existingRows] = await pool.query(sql, [driverId]);

    if (existingRows.length === 0) {
      return res.status(404).json({ message: "Driver verification record not found" });
    }

    const updateSql = "UPDATE driver_verification SET status = ? WHERE driver_id = ?";
    await pool.query(updateSql, [status, driverId]);

    const driverStatus = status === 'approved' ? 1 : 0;
    const updateDriverSql = "UPDATE drivers SET is_verified = ? WHERE driver_id = ?";
    await pool.query(updateDriverSql, [driverStatus, driverId]);

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



