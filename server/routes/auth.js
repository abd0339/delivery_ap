const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const {
  registerCustomer,
  registerAdmin,
  registerDriver,
  loginUser,
} = require('../controllers/authController');

const router = express.Router();

// Multer setup for driver ID upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage });

// Register routes
router.post('/register-customer', registerCustomer);
router.post('/register-driver', upload.single('idDocument'), registerDriver);
router.post('/register-admin', registerAdmin);

// Login route
router.post('/login', async (req, res) => {
  const { email, password, userType } = req.body;

  if (!email || !password || !userType) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email, password, and user type.',
    });
  }

  try {
    const user = await loginUser(email, password, userType);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Setup session based on user type
    const sessionUser = {
      email: user.email,
      userType,
    };

    if (userType === 'customer') {
      sessionUser.customer_id = user.customer_id;
    } else if (userType === 'driver') {
      sessionUser.driver_id = user.driver_id;
    } else if (userType === 'admin') {
      sessionUser.admin_id = user.admin_id;
    }

    req.session.user = sessionUser;

    // Return appropriate ID based on userType
    const response = {
      success: true,
      message: 'Login successful',
      userType,
    };

    if (userType === 'customer') {
      response.customer_id = user.customer_id;
    } else if (userType === 'driver') {
      response.driverId = user.driver_id;
    } else if (userType === 'admin') {
      response.adminId = user.admin_id;
    }

    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.',
    });
  }
});

// Logout route
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

module.exports = router;
