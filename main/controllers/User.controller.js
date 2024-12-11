const bcrypt = require('bcryptjs');
const db = require('../db/index');
const jsonwebtoken = require('jsonwebtoken');
const generateOTP = require('../utils/OTP_Generator');
const { redisClient } = require('../config/redisConfig');
const SALT = parseInt(process.env.SALT) || 10;


const OTP_TTL = process.env.OTP_TTL || 300;

exports.createUser = async (req, res) => {
    try {
        const { name, phone, pin, IP } = req.body;

        const existingUser = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [phone]);
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists', success: false });
        }

        const salt = await bcrypt.genSalt(parseInt(SALT));
        const hashedPIN = await bcrypt.hash(pin, salt);
        const nameForPayID = name.replace(/ /g, ''); // Remove spaces from name
        const payID = `${nameForPayID.toLowerCase()}@${phone}.pk`;

        const newUser = await db.one(
            'INSERT INTO "User" (name, number, pin, IP, balance, payID, verification, lastLogin) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
            [name, phone, hashedPIN, IP, 150.00, payID, false, new Date()]
        );

        // Check if OTP exists in Redis cache
        const cachedOtp = await redisClient.get(`OTP:${newUser.id}`);
        let otp;

        if (cachedOtp) {
            otp = cachedOtp; // Use OTP from Redis
        } else {
            otp = generateOTP(6); // Generate a new OTP
            await db.none('INSERT INTO "OTP" (userID, otp) VALUES ($1, $2)', [newUser.id, otp]); // Save in DB
            await redisClient.set(`OTP:${newUser.id}`, parseInt(otp), 'EX', OTP_TTL); // Save OTP in Redis with 5-minute TTL
        }

        res.status(200).json({ user: newUser, otp, message: 'User created successfully', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};


exports.loginUser = async (req, res) => {
    try {
        const { number, pin } = req.body;
        if(!pin || !number) {
            return res.status(400).json({ message: 'Missing required fields', success: false });
        }
        
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        

        const validPIN = await bcrypt.compare(pin, user.pin);
        if (!validPIN) {
            return res.status(401).json({ message: 'Invalid PIN', success: false });
        }

        if (!user.verification) {
            // Check Redis for existing OTP
            let otp = await redisClient.get(`OTP:${user.id}`);

            if (!otp) {
                // Generate new OTP and set it in both Redis and database with TTL
                otp = generateOTP(6);
                await db.none('INSERT INTO "OTP" (userID, otp) VALUES ($1, $2)', [user.id, otp]);
                redisClient.set(`OTP:${user.id}`, parseInt(otp), 'EX', OTP_TTL);
            }

            return res.status(307).json({
                message: 'Redirecting to verification page',
                redirectUrl: `/verification?id=${user.id}&otp=${otp}`,
                success: false
            });
        }

        const token = jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        res.status(200).json({ message: 'User verified successfully', success: true, token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};




exports.verifyUser = async (req, res) => {
    try {
        const { userID, OTP } = req.body;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [userID]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        if(user.verification){
            return res.status(409).json({ message: 'User already verified', success: false });
        }
        
        const cachedOtp = await redisClient.get(`OTP:${user.id}`);
        let otp
        if (cachedOtp) {

            otp = {
                otp: cachedOtp
            };
        } else {
            otp = await db.oneOrNone('SELECT * FROM "OTP" WHERE userID = $1 ORDER BY created_at DESC LIMIT 1', [userID]);
            if(!otp){
                otp = generateOTP(6);
                await db.none('INSERT INTO "OTP" (userID, otp) VALUES ($1, $2)', [userID, otp]);
                redisClient.set(`OTP:${user.id}`, parseInt(otp), 'EX', OTP_TTL);
                return res.status(307).json({ message: 'Redirecting to verification page', redirectUrl: `/verification?id=${userID}&otp=${parseInt(otp)}`, success: false });
            }
        }
        if (parseInt(otp.otp) !== parseInt(OTP)) {
            return res.status(401).json({ message: 'Invalid OTP', success: false });
        }
        await db.none('UPDATE "User" SET verification = true WHERE id = $1', [userID]);

        await db.none('DELETE FROM "OTP" WHERE userID = $1', [userID]);
        await redisClient.del(`OTP:${user.id}`);
        const token = jsonwebtoken.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '10d' });
        res.status(200).json({ message: 'User verified successfully', success: true, user, token });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}

exports.fetchUser = async (req, res) => {
    try {
        const { userID } = req.query;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE id = $1', [userID]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        res.status(200).json({ user, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.countUsers = async (req, res) => {
    try {
        const count = await db.one('SELECT COUNT(*) FROM "User"');
        res.status(200).json({ count, message: 'User count fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.requestPinChange = async (req, res) => {
    try {
        const { number } = req.body;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        let otp = generateOTP(6);
        await db.none('INSERT INTO "OTP" (userID, otp) VALUES ($1, $2)', [user.id, otp]);
        redisClient.set(`OTP:${user.id}`, parseInt(otp), 'EX', OTP_TTL);
        res.status(200).json({ message: 'OTP sent successfully', success: true, otp });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.forgotPIN = async (req, res) => {
    try {
        const { PIN } = req.body;
        // verifyOTP middleware already applied through the route page
        const user = req.user;
        console.log({user:user});
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        const salt = await bcrypt.genSalt(SALT);
        const hashedPIN = await bcrypt.hash(PIN, salt);
        await db.none('UPDATE "User" SET pin = $1 WHERE id = $2', [hashedPIN, user.id]);
        
        res.status(200).json({ message: 'PIN changed successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.changePIN = async (req, res) => {
    try {
        const { number, oldPIN, newPIN } = req.body;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        const validPIN = await bcrypt.compare(oldPIN, user.pin);
        if (!validPIN) {
            return res.status(401).json({ message: 'Invalid PIN', success: false });
        }
        const salt = await bcrypt.genSalt(SALT);
        const hashedPIN = await bcrypt.hash(newPIN, salt);
        await db.none('UPDATE "User" SET pin = $1 WHERE id = $2', [hashedPIN, user.id]);
        res.status(200).json({ message: 'PIN changed successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.getUserByPayID = async (req, res) => {
    try {
        const { payID } = req.query;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE payID = $1', [payID]);
        if (!user || !user.verification) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        delete user.pin;
        delete user.balance;
        delete user.verification;
        delete user.connections;
        delete user.ip;
    
        res.status(200).json({ user, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}


exports.getUserByNumber = async (req, res) => {
    try {
        const { number } = req.query;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user || !user.verification) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        delete user.pin;
        delete user.balance;
        delete user.verification;
        delete user.connections;
        delete user.ip;

        res.status(200).json({ user, message: 'User fetched successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}   


exports.changeNumber = async (req, res) => {
    try {
        const { number, newNumber, pin } = req.body;
        const user = await db.oneOrNone('SELECT * FROM "User" WHERE number = $1', [number]);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
        }
        const validPIN = await bcrypt.compare(pin, user.pin);
        if (!validPIN) {
            return res.status(401).json({ message: 'Invalid PIN', success: false });
        }
        
        if(newNumber === number) {
            return res.status(400).json({ message: 'New number cannot be same as old number', success: false });
        }

        if(number !== parseInt(user.number)){
            return res.status(400).json({ message: 'Invalid number', success: false });
        }

        const nameForPayID = user.name.replace(/ /g, '');
        const payID = `${nameForPayID.toLowerCase()}@${newNumber}.pk`;
        await db.none('UPDATE "User" SET number = $1 , payID = $2 WHERE id = $3', [newNumber, payID, user.id]);
        res.status(200).json({ message: 'Number changed successfully', success: true });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
}

exports.addConnection = async (req, res) => {
    try {
        const user = req.user; // The logged-in user
        const { connectionId } = req.body; // The ID of the user to connect with

        if (!connectionId) {
            return res.status(400).json({ message: 'Connection ID is required', success: false });
        }

        // Fetch the current user's details, including connections
        const userDetail = await db.oneOrNone('SELECT connections FROM "User" WHERE id = $1', [user.id]);

        if (!userDetail) {
            return res.status(404).json({ message: 'User not found', success: false });
        }

        // Check if the connection already exists
        const connections = userDetail.connections || [];
        if (connections.includes(connectionId)) {
            return res.status(409).json({ message: 'Connection already exists', success: false });
        }

        // Add the new connection ID to the connections array
        connections.push(parseInt(connectionId));

        // Update the user's connections in the database
        await db.none('UPDATE "User" SET connections = $1 WHERE id = $2', [connections, user.id]);

        res.status(200).json({ message: 'Connection added successfully', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error', success: false });
    }
};

