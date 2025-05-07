require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3001;

// Enable 'trust proxy' for correct handling of X-Forwarded-For header
app.set('trust proxy', 1);

app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ 
  limit: '50mb', 
  parameterLimit: 100000,
  extended: true 
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '50mb',
  parameterLimit: 100000 
}));

app.use(helmet({
  frameguard: { action: 'deny' }
}));

app.use(rateLimit({ 
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}));

app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // true if using HTTPS
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');
const walletRoutes = require('./routes/wallet');
const customerRoutes = require('./routes/register-customer');
const driverRoutes = require('./routes/register-driver');
const verificationRoutes = require('./routes/verification');
const profileRoutes = require('./routes/profile');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', ordersRoutes);
app.use('/wallet', walletRoutes);
app.use('/register-driver', driverRoutes);
app.use('/register-customer', customerRoutes);
app.use('/verification', verificationRoutes);
app.use('/profile', profileRoutes);

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
