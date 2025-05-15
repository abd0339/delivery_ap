require('dotenv').config();
const express = require('express');
const http = require('http'); // ✅ NEW
const { Server } = require('socket.io'); // ✅ NEW
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const app = express();
const server = http.createServer(app); // ✅ Use HTTP server for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3001;

app.set('trust proxy', 1);
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(session({
  secret: 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: true, maxAge: 60 * 60 * 1000 }
}));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// 🔥 Real-time driver tracking socket logic
io.on('connection', (socket) => {
  console.log('🚗 Client connected:', socket.id);

  socket.on('driverLocation', (data) => {
    // data = { orderId, lat, lng }
    console.log(`📍 Driver location update for Order #${data.orderId}:`, data);
    io.emit(`orderLocationUpdate:${data.orderId}`, data); // 🔄 Broadcast location to clients
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ordersRoutes = require('./routes/orders');
const walletRoutes = require('./routes/wallet');
const registerCustomerRoutes = require('./routes/register-customer');
const driverRoutes = require('./routes/register-driver');
const profileRoutes = require('./routes/profile');
const verificationRoutes = require('./routes/verfi');
const customerRoutes = require('./routes/customer');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', ordersRoutes);
app.use('/wallet', walletRoutes);
app.use('/register-driver', driverRoutes);
app.use('/register-customer', registerCustomerRoutes);
app.use('/customers', customerRoutes);
app.use('/verification', verificationRoutes);
app.use('/profile', profileRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ✅ Start server using HTTP server (with Socket.io)
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
