const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    default: function() {
      return 'user_' + Math.random().toString(36).substr(2, 9);
    }
  },
  email: {
    type: String,
    unique: true,
    default: function() {
      // Generate a default email using phone number
      return `user_${Math.random().toString(36).substr(2, 9)}@1to9games.com`;
    }
  },
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    default: 0
  },
  coins: {
    type: Number,
    default: 0
  },
  totalWins: {
    type: Number,
    default: 0
  },
  totalBets: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
module.exports = User;


