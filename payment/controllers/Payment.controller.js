const bcrypt = require('bcryptjs');
const db = require('../db/index');
const { redisClient } = require('../config/redisConfig');
const { v4: uuidV4 } = require('uuid');
const AuditLog = require('../utils/audit_log');

const SALT = parseInt(process.env.SALT) || 10;

/**
 * @deprecated During development, I G1 JO-SHE found some security issues with this API call, so I deprecated it.
 * @param {*} sID - Sender ID
 * @param {*} rID - Receiver ID
 * @param {*} amount - Amount to be sent
 */
exports.sendPayment = async (req, res) => {
    const { sId, rId, amount } = req.body;

    // Generate transaction ID
    const uid = uuidV4();
    const txnid = `${sId}-${rId}-${uid}`;

    try {
        // Use database transaction for ACID compliance
        await db.tx(async (t) => {
            // Validate sender's existence and balance
            const sender = await t.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [sId]);
            if (!sender) {
                throw { message: 'Sender not found. Please log in to make a payment.', status: 401 };
            }

            if (sender.balance < amount) {
                throw { message: 'Insufficient balance.', status: 400 };
            }

            // Validate receiver's existence
            const receiver = await t.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [rId]);
            if (!receiver) {
                throw { message: 'Receiver not found.', status: 404 };
            }

            // Update balances atomically
            await t.none(`UPDATE "User" SET balance = balance - $1 WHERE id = $2`, [amount, sId]);
            await t.none(`UPDATE "User" SET balance = balance + $1 WHERE id = $2`, [amount, rId]);

            // Log the transaction in Payment_History
            const paymentID = await t.one(
                `INSERT INTO "Payment_History" (sId, rId, txnid, amount, success) VALUES ($1, $2, $3, $4, true) RETURNING id`,
                [sId, rId, txnid, amount]
            );

            // Add audit log entry
            await AuditLog(
                sId,
                'Payment',
                `Payment of ${amount} has been made to user ID ${rId} with txnid ${txnid} and payment ID ${paymentID.id}.`
            );
        });

        res.status(201).json({ success: true, message: 'Payment successful' });
    } catch (error) {
        console.error('Payment transaction failed:', error);

        // Rollback in case of error and log failure in audit log
        await AuditLog(
            sId,
            'Payment',
            `Payment of ${amount} failed to user ID ${rId} with txnid ${txnid}. Reason: ${error.message}`
        );

        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }

        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};



// for Global user (any/*)
exports.requestGlobalPayment = async (req, res) => {
    try {
        const { rId, amount, quick = 'false' } = req.body;

        // Validate receiver
        const receiver = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [rId]);
        if (!receiver) {
            throw { message: 'Receiver not found. Please log in to make a payment request.', status: 401 };
        }

        delete receiver.verification;
        delete receiver.balance;
        delete receiver.pin;


        // Determine TTL based on request type
        const TTL = quick === 'true'
            ? parseInt(process.env.QUICK_TTL, 10)
            : parseInt(process.env.PAYMENT_REQUEST_TTL, 10);

        // Check TTL value validity
        if (isNaN(TTL)) {
            return res.status(500).json({ success: false, message: 'Invalid TTL configuration.' });
        }

        // Set timestamp and insert request
        const request = await db.one(
            `INSERT INTO "Requested_Payment" (rId, amount, TTL) 
             VALUES ($1, $2, $3) RETURNING id, initiated_at`,
            [rId, amount, TTL]
        );

        // Response includes more details
        res.status(201).json({
            success: true,
            initializedAt: request.initiated_at,
            TTL: TTL,
            receiver: receiver,
            requestId: request.id,
            message: 'Payment request initialized successfully'
        });
    } catch (error) {
        console.error('Error initializing payment request:', error);

        if (error.status) {
            return res.status(error.status).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};




exports.initiatePayment = async (req, res) => {
    const { sId, rId, amount,note="" } = req.body;
    // Generate a unique transaction ID
    const uid = uuidV4().replace(/-/g, '');
    const txnid = `${sId}-${rId}-${uid}`;

    try {
        // Validate sender’s existence and balance
        const sender = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [sId]);
        if (!sender) {
            return res.status(401).json({ message: 'Sender not found. Please log in to make a payment.', success: false });
        }

        if (parseFloat(sender.balance) < parseFloat(amount)) {
            return res.status(400).json({ message: 'Insufficient balance.', success: false });
        }

        // Check if the receiver exists
        const receiver = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [rId]);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found.' });
        }
        // paid_at is set as TIMESTAMP DEFAULT CURRENT_TIMESTAMP but we want to initialize it after payment done
        await db.none(`INSERT INTO "Payment_History" ("sId","rId",amount, txnid, Note, Pending, success) VALUES($1, $2, $3, $4, $5, true, false)`, [sId, rId, amount, txnid, note]);

        // Send txnid back for PIN confirmation
        res.status(200).json({ txnid, message: 'Transaction initiated. Please confirm with PIN.', success: true });
    } catch (error) {
        console.error('Error initiating payment:', error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};


exports.verifyPin = async (req, res) => {
    const { sId, txnid, pin } = req.body;

    try {
        // Verify the PIN (assuming PIN is stored securely in the database)
        const sender = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [sId]);
        if (!sender) {
            return res.status(401).json({ message: 'User not found. Please log in.', success: false });
        }

        // Assuming `sender.pin` is hashed, use a hash compare function like bcrypt.compare if necessary

        if (!await bcrypt.compare(pin, sender.pin)) {
            return res.status(401).json({ message: 'Invalid PIN', success: false });
        }

        const transaction = await db.oneOrNone(`SELECT * FROM "Payment_History" WHERE txnid = $1`, [txnid]);
        if (!transaction.pending) {
            await AuditLog(
                sId,
                'Payment-Verification-Reattempt',
                `User with ID ${sId} tried to verify again the payment of ${amount} which has already been made to user ID ${rId} with txnid ${txnid} and payment ID ${paymentID.id}`
            );
            return res.status(403).json({ success: false, message: 'This transaction has already been processed.' });
        }
        if (parseInt(transaction.sId) !== parseInt(sId)) {
            return res.status(403).json({ success: false, message: 'You are not allowed to do this transaction.' });
        }
        res.status(200).json({ success: true, message: 'PIN verified. Proceeding to payment.', txnid });
    } catch (error) {
        console.error('PIN verification failed:', error);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

exports.completePayment = async (req, res) => {
    const { sId, rId, amount, txnid } = req.body;

    try {
        
        await db.tx(async (t) => {
            const transaction = await db.oneOrNone(`SELECT * FROM "Payment_History" WHERE txnid = $1`, [txnid]);
            if (!transaction.pending) {
                await AuditLog(
                    sId,
                    'False-Payment-Reattempt',
                    `Payment of ${amount} has already been made to user ID ${rId} with txnid ${txnid} and payment ID ${paymentID.id}, but ${sId} tried to complete it again.`
                );
                return res.status(403).json({ success: false, message: 'This transaction has already been processed.' });
            }

            // Update balances atomically
            await t.none(`UPDATE "User" SET balance = balance - $1 WHERE id = $2`, [amount, sId]);
            await t.none(`UPDATE "User" SET balance = balance + $1 WHERE id = $2`, [amount, rId]);

            // Log the transaction in Payment_History
            const time = new Date();
            const paymentID = await t.one(
                `UPDATE "Payment_History" SET  success=$1, pending=$2, paid_at=$3 WHERE txnid=$4 RETURNING id`,
                [true, false, time, txnid]
            );

            // Add audit log entry
            await AuditLog(
                sId,
                'Payment',
                `Payment of ${amount} has been made to user ID ${rId} with txnid ${txnid} and payment ID ${paymentID.id}.`
            );
        });

        const transaction = await db.oneOrNone(`SELECT * FROM "Payment_History" WHERE txnid = $1`, [txnid]);

        res.status(201).json({ success: true, message: 'Payment successful', txnid, transaction });
    } catch (error) {
        console.error('Payment transaction failed:', error);

        await AuditLog(
            sId,
            'Payment',
            `Payment of ${amount} failed to user ID ${rId} with txnid ${txnid}. Reason: ${error.message}`
        );

        res.status(error.status || 500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
};



/**
 * Check for potential fraudulent transactions.
 * @param {Object} transactionDetails - The transaction details to evaluate.
 * @param {number} transactionDetails.sId - Sender ID.
 * @param {number} transactionDetails.rId - Receiver ID.
 * @param {number} transactionDetails.amount - Transaction amount.
 * @param {string} transactionDetails.txnid - Transaction ID.
 * @returns {Promise<boolean>} - Returns `true` if the transaction is safe, otherwise `false`.
 */
const checkFraud = async (transactionDetails) => {
    try {
        const response = await axios.post('http://127.0.0.1:5000/transaction_check', transactionDetails);
        if (response.status === 200 && !response.data.is_fraud) {
            return true; // Transaction is not fraudulent
        }
        console.warn('Fraud check flagged transaction:', response.data);
        return false; // Transaction flagged as potentially fraudulent
    } catch (error) {
        console.error('Error during fraud check:', error);
        throw new Error('Fraud check service unavailable.');
    }
};


const checkFraudFreq = async (transaction, sender, receiver) => {
    try {
        // Example fraud detection conditions
        const {
            sId, 
            rId, 
            amount, 
            txnid, 
            paid_at
        } = transaction;

        // Check for unusually high transaction amount
        const highAmountThreshold = parseFloat(process.env.HIGH_AMOUNT_THRESHOLD) || 10000;
        if (parseFloat(amount) > highAmountThreshold) {
            return { isFraud: true, reason: `Transaction amount exceeds threshold: ${highAmountThreshold}` };
        }

        // Check for unusually frequent transactions from the sender
        const frequentTxnThreshold = parseInt(process.env.FREQUENT_TXN_THRESHOLD) || 5;
        const timeWindowMinutes = parseInt(process.env.FREQUENT_TXN_TIME_WINDOW) || 60;

        const recentTransactions = await db.any(
            `SELECT COUNT(*) AS txnCount FROM "Payment_History" 
             WHERE "sId" = $1 AND "paid_at" >= NOW() - INTERVAL '${timeWindowMinutes} minutes'`,
            [sId]
        );

        if (parseInt(recentTransactions[0].txnCount) > frequentTxnThreshold) {
            return { isFraud: true, reason: `Too many transactions (${recentTransactions[0].txnCount}) within ${timeWindowMinutes} minutes.` };
        }

        // Check for sender and receiver being the same account
        if (sId === rId) {
            return { isFraud: true, reason: 'Sender and receiver accounts are identical.' };
        }

        // Validate receiver's account for suspicious activity (e.g., newly created)
        const accountAgeThresholdDays = parseInt(process.env.ACCOUNT_AGE_THRESHOLD_DAYS) || 30;
        const receiverCreationDate = new Date(receiver.created_at);
        const daysSinceCreation = (Date.now() - receiverCreationDate) / (1000 * 60 * 60 * 24);

        if (daysSinceCreation < accountAgeThresholdDays) {
            return { isFraud: true, reason: `Receiver account is too new: ${Math.floor(daysSinceCreation)} days old.` };
        }

        return { isFraud: false }; // No fraud detected
    } catch (error) {
        console.error('Error during fraud check:', error);
        return { isFraud: true, reason: 'Internal fraud detection error.' };
    }
};
