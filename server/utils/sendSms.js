const twilio = require('twilio');
const crypto = require('crypto');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const phone = process.env.TWILIO_PHONE_NUMBER;

console.log(accountSid);
console.log(authToken);
console.log(phone);

const client = new twilio(accountSid, authToken);

// Function to generate a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Function to send OTP via SMS
const sendOtpSms = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP code is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    console.log('OTP sent successfully:', message.sid);  // Log success
  } catch (error) {
    console.error('Error sending OTP:', error.message);  // Log the error
    throw error;  // Re-throw the error to handle it later
  }
};


module.exports = { generateOtp, sendOtpSms };
