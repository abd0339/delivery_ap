const bcrypt = require('bcryptjs');
const pool = require('../db');

// Register Customer
exports.registerCustomer = async (req, res) => {
  try {
    const { email, password, phoneNumber, shopName, shopAddress, username } = req.body;

    if (!email || !password || !phoneNumber || !shopName || !shopAddress || !username) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const [existing] = await pool.query(
      'SELECT * FROM customers WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing.length > 0) {
      const exists = existing[0];
      if (exists.email === email) {
        return res.status(409).json({ success: false, message: 'Email already exists.' });
      }
      if (exists.username === username) {
        return res.status(409).json({ success: false, message: 'Username already exists.' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO customers (email, password, phone_number, shop_name, shop_address, username) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, phoneNumber, shopName, shopAddress, username]
    );

    res.status(201).json({ success: true, message: 'Customer registered successfully.', customer_id: result.insertId });
  } catch (error) {
    console.error('Customer registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
};

// Register Driver
exports.registerDriver = async (req, res) => {
  try {
    const { email, password, phoneNumber, vehicleType, username} = req.body;
    const idDocument = req.file.filename;

    if (!email || !password || !phoneNumber || !vehicleType || !idDocument || !username) {
      return res.status(400).json({ success: false, message: 'Missing required fields.' });
    }

    const [existing] = await pool.query('SELECT * FROM drivers WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO drivers (email, password, phone_number, vehicle_type, id_document, username) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, phoneNumber, vehicleType, idDocument, username]
    );

    res.status(201).json({ success: true, message: 'Driver registered successfully.', driver_id: result.insertId });
  } catch (error) {
    console.error('Driver registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
};

// Register Admin
exports.registerAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Missing email or password.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO admins (email, password_hash) VALUES (?, ?)',
      [email, hashedPassword]
    );

    res.status(201).json({ success: true, message: 'Admin registered successfully.', admin_id: result.insertId });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again later.' });
  }
};

// Login User
exports.loginUser = async (email, password, userType) => {
  try {
    if (!email || !password || !userType) {
      throw new Error('Missing login credentials.');
    }

    let table, passwordField;

    switch (userType) {
      case 'customer':
        table = 'customers';
        passwordField = 'password';
        break;
      case 'driver':
        table = 'drivers';
        passwordField = 'password';
        break;
      case 'admin':
        table = 'admins';
        passwordField = 'password_hash';
        break;
      default:
        throw new Error('Invalid user type.');
    }
    const [users] = await pool.query(`SELECT * FROM ${table} WHERE email = ?`, [email]);

    if (users.length === 0) return null;

    const user = users[0];
    if (user.is_paused) {
      return res.status(403).json({ success: false, message: "Account is paused. Please contact support." });
    }    
    const isMatch = await bcrypt.compare(password, user[passwordField]);

    if (!isMatch) return null;

    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};
