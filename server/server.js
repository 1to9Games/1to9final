require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const betRoutes = require('./routes/betRoutes')
const adminRoutes = require('./routes/adminRoutes')
const gameRoutes = require('./routes/gameRoutes')
const { Server } = require('socket.io')
const { createServer } = require('node:http');

const PORT = process.env.PORT || 5000;
const Razorpay = require('razorpay');
const crypto = require('crypto');
const app = express();

app.use(bodyParser.json());
app.use(cors());
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.log(err));

app.use('/api/auth', userRoutes);
app.use('/api/auth', betRoutes);
app.use('/api/auth', adminRoutes);
app.use('/api/auth', gameRoutes);


// Serve static files from the React/Vite app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Handle client-side routing - this should come after API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});



// Store active viewers count in memory
let activeViewers = Math.floor(Math.random() * (10000 - 1000 + 1)) + 1000;

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  
  // Emit current active viewers count to newly connected clients
  socket.emit('active-users-updated', activeViewers);
  
  socket.on('QR-Img', (data) => {
    io.emit('qrData', {
      qr: data.qr,
      ifscCode: data.ifscCode,
      accountNumber: data.accountNumber
    });
  });

  socket.on('update-active-users', (viewers) => {
    activeViewers = viewers;
    io.emit('active-users-updated', activeViewers);
  });

  socket.on('WinNumber', (winN, slotN) => {
    io.emit('NumWon', winN, slotN)
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));