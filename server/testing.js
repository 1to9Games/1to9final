require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log(process.env.TWILIO_ACCOUNT_SID);
console.log(process.env.TWILIO_AUTH_TOKEN);
console.log(process.env.TWILIO_PHONE_NUMBER);


if (!accountSid || !authToken) {
    console.error("Twilio credentials are missing!");
} else {
    const client = new twilio(accountSid, authToken);
    console.log('Twilio Client initialized successfully.');
}
