const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  withdrawalAmount: {
    type: Number,
    required: true,
    min: [1, 'Withdrawal amount must be greater than 0']
  },
  paymentMode: {
    type: String,
    required: true,
    enum: ['upiTransaction', 'bankTransfer']
  },
  // UPI Transaction Fields
  upiId: {
    type: String,
    required: function() {
      return this.paymentMode === 'upiTransaction';
    },
    validate: {
      validator: function(v) {
        if (this.paymentMode === 'upiTransaction') {
          // Basic UPI ID validation regex
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
        return this.paymentMode === 'bankTransfer';
      }
    },
    bankName: {
      type: String,
      required: function() {
        return this.paymentMode === 'bankTransfer';
      }
    },
    accountNumber: {
      type: String,
      required: function() {
        return this.paymentMode === 'bankTransfer';
      },
      validate: {
        validator: function(v) {
          if (this.paymentMode === 'bankTransfer') {
            // Basic account number validation (allows only digits)
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
        return this.paymentMode === 'bankTransfer';
      },
      validate: {
        validator: function(v) {
          if (this.paymentMode === 'bankTransfer') {
            // IFSC code validation regex
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

// // Add index for faster queries
// withdrawalRequestSchema.index({ userId: 1, status: 1 });
// withdrawalRequestSchema.index({ createdAt: -1 });

// Pre-save middleware to ensure bank details are not provided for UPI transactions and vice versa
withdrawalSchema.pre('save', function(next) {
  if (this.paymentMode === 'upiTransaction') {
    this.bankDetails = undefined;
  } else if (this.paymentMode === 'bankTransfer') {
    this.upiId = undefined;
  }
  next();
});

const Withdrawal = mongoose.model('WithdrawalRequest', withdrawalSchema);

module.exports = Withdrawal;