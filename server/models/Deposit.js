const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  depositAmount: {
    type: Number,
    required: true,
    min: 20,
  },
  name: {
    type: String,
    required: true
  },
  proofImgUrl: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = Deposit;