const mongoose = require('mongoose');

const betSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  idOfGame: {
    type:  { type: mongoose.Schema.Types.ObjectId, ref: 'Game' },
  },
  gameId:{
    type: String,
    required: true
  },
  slotNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  selectedNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  betAmount: {
    type: Number,
    required: true,
    min: 20,
    max: 100000
  },
  slotTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'won', 'lost'],
    default: 'pending'
  },
  winningNumber: {
    type: Number,
    min: 1,
    max: 10
  },
  winAmount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Bet = mongoose.model('Bet', betSchema);
module.exports = Bet;