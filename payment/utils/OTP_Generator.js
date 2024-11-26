const crypto = require('crypto');

function generateOTP(len = 6) {
    // Generate a random byte array
    const buffer = crypto.randomBytes(len);
    
    // Convert the buffer to a string in base 36 (0-9 and a-z)
    const otp = buffer.toString('hex').slice(0, len);
    
    // Ensure the OTP is numeric, convert to a number and return it
    return parseInt(otp, 16).toString().slice(0, len);
}

// Function to generate a fixed-length unique ID
function generateFixedLengthId(length) {
  const byteLength = Math.ceil(length / 2); // Calculate the required byte length
  const randomBytes = crypto.randomBytes(byteLength); // Generate random bytes
  return randomBytes.toString('hex').slice(0, length); // Convert to hex and truncate
}

module.exports ={ generateOTP, generateFixedLengthId};

