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
const { updateDriverLocation } = require('./socket/driverLocationStore');


const app = express();
const server = http.createServer(app); // ✅ Use HTTP server for socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

const port = process.env.PORT || 3001;

app.set('io', io);
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
  console.log('📡 New client connected:', socket.id);

  socket.on('driverLocation', ({ orderId, lat, lng }) => {
    const driverId = socket.handshake.query.driverId;
    if (driverId) {
      updateDriverLocation(driverId, { lat, lng });
      io.to(orderId).emit(`orderLocationUpdate:${orderId}`, { lat, lng });
      console.log(`📍 Emitted location to room ${orderId}:`, { lat, lng });
    }
  });

  socket.on('registerDriver', (driverId) => {
    socket.join(`driver:${driverId}`);
    console.log(`Driver ${driverId} joined room`);
  });

  // --- 1. JOIN ROOM BASED ON ORDER ID ---
  socket.on('joinRoom', ({ orderId }) => {
    socket.join(orderId);
    console.log(`🟢 Socket ${socket.id} joined room: ${orderId}`);

  });

  // --- 2. HANDLE INCOMING CHAT MESSAGE ---
  socket.on('chatMessage', ({ orderId, sender, message }) => {
    console.log(`💬 Message for Order ${orderId} from ${sender}: ${message}`);
    // Broadcast message to all clients in the same order chat room
    io.to(orderId).emit('chatMessage', {
      sender,
      message,
      timestamp: new Date().toISOString()
    });
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
const driverInfoRoutes = require('./routes/driver');



app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/orders', ordersRoutes(io));
app.use('/wallet', walletRoutes);
app.use('/register-driver', driverRoutes);
app.use('/drivers', driverInfoRoutes);
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
