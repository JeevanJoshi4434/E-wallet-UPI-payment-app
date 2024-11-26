const jsonwebtoken = require('jsonwebtoken');
const db = require('../db/index');
const { redisClient } = require('../config/redisConfig');

exports.isAuthenticatedUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = decoded; // Store the user object in the request
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error' });
    }
}

exports.verifyOTP = async (req, res, next) => {
    try {
        const { number, OTP } = req.body;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        const cachedOtp = await redisClient.get(`OTP:${user.id}`);
        let otp;
        if (cachedOtp) {
            otp = {
                otp: cachedOtp
            };
        } else {
            otp = await db.oneOrNone('SELECT * FROM "OTP" WHERE userID = $1 ORDER BY created_at DESC LIMIT 1', [user.id]);
        }
        if (parseInt(otp.otp) !== OTP) {
            return res.status(401).json({ message: 'Invalid OTP', success: false });
        }
        await db.none('DELETE FROM "OTP" WHERE userID = $1', [user.id]);
        req.user = user;
        next();
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}
