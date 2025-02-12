// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// const userRoutes = require('./routes/userRoutes');
// const betRoutes = require('./routes/betRoutes')
// const adminRoutes = require('./routes/adminRoutes')
// const gameRoutes = require('./routes/gameRoutes')
// const { Server } = require('socket.io')
// const { createServer } = require('node:http');

// const PORT = process.env.PORT || 5000;
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const app = express();

// app.use(bodyParser.json());
// app.use(cors());
// const server = createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//   },
// });

// mongoose.connect(process.env.MONGO_URI, {})
//   .then(() => console.log('MongoDB Connected'))
//   .catch((err) => console.log(err));

// app.use('/api/auth', userRoutes);
// app.use('/api/auth', betRoutes);
// app.use('/api/auth', adminRoutes);
// app.use('/api/auth', gameRoutes);

// // Store active viewers count in memory
// let activeViewers = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

// io.on('connection', (socket) => {
//   console.log('a user connected', socket.id);
  
//   // Emit current active viewers count to newly connected clients
//   socket.emit('active-users-updated', activeViewers);
  
//   socket.on('QR-Img', (data) => {
//     io.emit('qrData', {
//       qr: data.qr,
//       ifscCode: data.ifscCode,
//       accountNumber: data.accountNumber,
//       selectedAccount: data.selectedAccount
//     });
//   });
//   socket.on('QR-only', (data) => {
//     io.emit('qrData-only', {
//       qr: data.qr,
//       selectedAccount: data.selectedAccount
//     });
//   });

//   socket.on('update-active-users', (viewers) => {
//     activeViewers = viewers;
//     io.emit('active-users-updated', activeViewers);
//   });

//   socket.on('WinNumber', (winN, slotN) => {
//     io.emit('NumWon', winN, slotN)
//   });

//   socket.on('disconnect', () => {
//     console.log('user disconnected');
//   });
// });

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const userRoutes = require('./routes/userRoutes');
const betRoutes = require('./routes/betRoutes');
const adminRoutes = require('./routes/adminRoutes');
const gameRoutes = require('./routes/gameRoutes');
const { Server } = require('socket.io');
const { createServer } = require('node:http');
const crypto = require('crypto');
const Razorpay = require('razorpay');

// Environment Configuration
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 5000;
const ALLOWED_ORIGINS = [
  'https://1to9game.com',
  'https://www.1to9game.com',
  'http://localhost:5173/',
  // Add other allowed domains if needed
];

const app = express();
const server = createServer(app);

// Middleware Configuration
app.use(helmet());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
  origin: NODE_ENV === 'production' ? ALLOWED_ORIGINS : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Socket.IO Configuration
const io = new Server(server, {
  cors: {
    origin: NODE_ENV === 'production' ? ALLOWED_ORIGINS : '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
});

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => console.log('MongoDB Connected'))
.catch((err) => {
  console.error('MongoDB Connection Error:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/auth', betRoutes);
app.use('/api/auth', adminRoutes);
app.use('/api/auth', gameRoutes);

// Production Specific Middleware
if (NODE_ENV === 'production') {
  // Force HTTPS
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    next();
  });
}

// Store active viewers count in memory
let activeViewers = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

// Socket.IO Event Handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Handle socket errors
  socket.on('error', (error) => {
    console.error('Socket.IO Error:', error);
  });

  // Emit current active viewers count to newly connected clients
  socket.emit('active-users-updated', activeViewers);
  
  socket.on('QR-Img', (data) => {
    io.emit('qrData', {
      qr: data.qr,
      ifscCode: data.ifscCode,
      accountNumber: data.accountNumber,
      selectedAccount: data.selectedAccount
    });
  });

  socket.on('QR-only', (data) => {
    io.emit('qrData-only', {
      qr: data.qr,
      selectedAccount: data.selectedAccount
    });
  });

  socket.on('update-active-users', (viewers) => {
    activeViewers = viewers;
    io.emit('active-users-updated', activeViewers);
  });

  socket.on('WinNumber', (winN, slotN) => {
    io.emit('NumWon', winN, slotN);
  });

  socket.on('disconnect', (reason) => {
    console.log('Client disconnected:', socket.id, 'Reason:', reason);
  });
});

// Error Handlers
app.use((req, res) => {
  res.status(404).send('Not Found');
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Process Error Handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

// Server Listen
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${NODE_ENV} mode on port ${PORT}`);
});

// Disable console.log in production
if (NODE_ENV === 'production') {
  console.log = function() {};
}