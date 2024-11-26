const Razorpay = require('razorpay');

// Instantiate Razorpay
const paymentGateway = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const RechargeGateway = new Razorpay({
  key_id: process.env.RAZORPAY_GATEWAY_KEY_ID,
  key_secret: process.env.RAZORPAY_GATEWAY_KEY_SECRET
})

/**
 *  Generates RAZORPAY Authorization-HEADER 
 * @returns X_Auth_HEADER 
 */
const X_Auth_HEADER = () => {
  const keyId = process.env.RAZORPAY_KEY_ID; // Your Key ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET; // Your Key Secret
  // Combine the key and secret with a colon
  const authString = `${keyId}:${keySecret}`;
  
  // Encode the string in Base64
  const base64Token = Buffer.from(authString).toString('base64');
  
  // Return the Authorization header value
  return base64Token;
};

const AccountNumber = process.env.RAZORPAY_ACCOUNT_NUMBER;

module.exports = {paymentGateway, X_Auth_HEADER, AccountNumber, RechargeGateway};