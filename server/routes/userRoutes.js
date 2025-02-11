const express = require('express');
const User = require('../models/User');
const Deposit = require('../models/Deposit')
const Withdrawal = require('../models/Withdraw');
const Bet = require('../models/Bet');
const { generateOtp, sendOtpSms } = require('../utils/sendSms');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const otpStore = new Map();


router.post('/register', async (req, res) => {
  try {
    const { name, phone, password } = req.body;

    // Validate input
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Generate OTP
    const otp = generateOtp();
    
    // console.log('Generated OTP:', otp); // Debugging log
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(phone, {
      otp: otp.toString(), // Convert to string to ensure consistent comparison
      expiry: Date.now() + 5 * 60 * 1000,
      userData: { name, phone, password }
    });

    // console.log('Stored OTP data:', otpStore.get(phone)); // Debugging log

    // Send OTP
    await sendOtpSms(phone, otp);

    res.status(200).json({ 
      message: 'OTP sent successfully' 
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error during registration' 
    });
  }
});

// OTP Verification API
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    console.log('Received OTP verification request:', { phone, otp }); // Debugging log

    // Get stored OTP data
    const otpData = otpStore.get(phone);
    console.log('Retrieved OTP data:', otpData); // Debugging log

    if (!otpData) {
      return res.status(400).json({ 
        message: 'No OTP found. Please request a new one' 
      });
    }

    // Check OTP expiration
    if (Date.now() > otpData.expiry) {
      otpStore.delete(phone);
      return res.status(400).json({ 
        message: 'OTP has expired' 
      });
    }

    // Convert both OTPs to strings and trim any whitespace
    const receivedOtp = otp.toString().trim();
    const storedOtp = otpData.otp.toString().trim();

    console.log('Comparing OTPs:', { 
      receivedOtp, 
      storedOtp, 
      match: receivedOtp === storedOtp 
    }); // Debugging log

    // Verify OTP
    if (receivedOtp !== storedOtp) {
      return res.status(400).json({ 
        message: 'Invalid OTP' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(otpData.userData.password, 10);

    // Create new user
    const newUser = new User({
      name: otpData.userData.name,
      phone: otpData.userData.phone,
      password: hashedPassword,
      balance: 0,
      coins: 0,
      totalBets: 0
    });

    await newUser.save();
    // console.log('New user created:', newUser); // Debugging log

    // Clear OTP data
    otpStore.delete(phone);

    res.status(201).json({ 
      message: 'Registration successful' 
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      message: 'Error during verification' 
    });
  }
});

router.post('/login', async (req, res) => {
  const { phone, password } = req.body;

  try {
    // Format phone number
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    // Compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid phone number or password' });
    }

    // Send user data (excluding sensitive information)
    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      balance: user.balance,
      coins: user.coins
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send OTP for password reset
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    // Check if user exists
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Generate OTP
    const otp = generateOtp();
    // console.log('Generated OTP:', otp); // For debugging

    // Store OTP with expiration
    otpStore.set(formattedPhone, {
      otp: otp.toString(),
      expiry: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // console.log('Stored OTP data:', otpStore.get(formattedPhone)); // For debugging

    // Send OTP via SMS
    await sendOtpSms(formattedPhone, otp);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;

    console.log('Reset attempt for phone:', formattedPhone); // For debugging
    console.log('Received OTP:', otp); // For debugging
    console.log('Stored OTP data:', otpStore.get(formattedPhone)); // For debugging

    // Get stored OTP data
    const otpData = otpStore.get(formattedPhone);
    
    if (!otpData) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one' });
    }

    // Check OTP expiration
    if (Date.now() > otpData.expiry) {
      otpStore.delete(formattedPhone);
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Compare OTPs
    if (otp.toString() !== otpData.otp.toString()) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find and update user
    const user = await User.findOne({ phone: formattedPhone });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Clear OTP data
    otpStore.delete(formattedPhone);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

router.get('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error('Server error:', error);
  }
})


router.post('/deposit', async (req, res) => {
  try {
    const {
      userId,
      name,
      depositAmount,
      transactionId,
      proofImgUrl,
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate minimum deposit amount
    if (depositAmount < 20) {
      return res.status(400).json({ message: 'Minimum deposit amount is ₹20' });
    }

    // Validate required fields
    if (!depositAmount || !transactionId || !proofImgUrl) {
      return res.status(400).json({ message: 'Please fill all required fields including screenshot' });
    }

    // Create deposit request
    const deposit = new Deposit({
      userId,
      name,
      depositAmount,
      transactionId,
      proofImgUrl,
    });

    await deposit.save();

    // Send response
    res.status(201).json({
      message: 'Deposit request created successfully',
      deposit
    });

  } catch (error) {
    console.error('Deposit Error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({ 
      message: 'Error creating deposit request', 
      error: error.message 
    });
  }
});


router.get('/get-transactiondetails/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const withdrawals = await Withdrawal.find({ userId });
    const deposits = await Deposit.find({ userId });
    const bets = await Bet.find({ userId });

    if(!user || !withdrawals || !deposits || !bets) {
      return res.status(404).json({ message: 'Failed to fetch Transaction details Please reload pageg .' });
    }

    const transactionDetails={};
    transactionDetails.withdrawals = withdrawals;
    transactionDetails.deposits = deposits;
    transactionDetails.bets = bets;
    transactionDetails.user = user;    
  

    res.status(200).json({
      message: 'Transaction details fetched successfully',
      transactionDetails });
  } catch (error) {
    console.error('Get Deposits Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;



