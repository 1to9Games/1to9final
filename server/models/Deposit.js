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
  proofImgUrl: {
    type: String,
    required: true
  },
  transactionId: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
    enum: ['QR/UPI', 'Bank Transfer']
  },
  // UPI Fields
  upiId: {
    type: String,
    required: function() {
      return this.method === 'QR/UPI';
    },
    validate: {
      validator: function(v) {
        if (this.method === 'QR/UPI') {
          return /^[\w\.\-_]+@[\w\-]+$/i.test(v);
        }
        return true;
      },
      message: 'Please enter a valid UPI ID'
    }
  },
  // Bank Transfer Fields
  bankDetails: {
    accountHolderName: {
      type: String,
      required: function() {
        return this.method === 'Bank Transfer';
      }
    },
    bankName: {
      type: String,
      required: function() {
        return this.method === 'Bank Transfer';
      }
    },
    senderAccountNumber: {
      type: String,
      required: function() {
        return this.method === 'Bank Transfer';
      },
      validate: {
        validator: function(v) {
          if (this.method === 'Bank Transfer') {
            return /^\d{9,18}$/.test(v);
          }
          return true;
        },
        message: 'Please enter a valid account number'
      }
    },
    accountNumber: {
      type: String,
      required: function() {
        return this.method === 'Bank Transfer';
      },
      validate: {
        validator: function(v) {
          if (this.method === 'Bank Transfer') {
            return /^\d{9,18}$/.test(v);
          }
          return true;
        },
        message: 'Please enter a valid account number'
      }
    },
    ifscCode: {
      type: String,
      required: function() {
        return this.method === 'Bank Transfer';
      },
      validate: {
        validator: function(v) {
          if (this.method === 'Bank Transfer') {
            return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v);
          }
          return true;
        },
        message: 'Please enter a valid IFSC code'
      }
    }
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

// Pre-save middleware to ensure bank details are not provided for UPI transactions and vice versa
depositSchema.pre('save', function(next) {
  if (this.method === 'QR/UPI') {
    this.bankDetails = undefined;
  } else if (this.method === 'Bank Transfer') {
    this.upiId = undefined;
  }
  next();
});

const Deposit = mongoose.model('Deposit', depositSchema);
module.exports = Deposit;