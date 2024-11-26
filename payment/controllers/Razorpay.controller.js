const { paymentGateway, X_Auth_HEADER, AccountNumber, RechargeGateway } = require('../config/paymentGateway');
const db = require('../db');
const HttpRequest = require('../modules/HttpRequest');
const { generateFixedLengthId } = require('../utils/OTP_Generator');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const AuditLog = require('../utils/audit_log');
const crypto = require('crypto');

const dotenv = require('dotenv').config(
    {
        path: './.env'
    }
);


class ExternalPaymentController {

    httpRequest = new HttpRequest();

    // Method for initiating UPI payment
    async upiPaymentInitiate(req, res) {
        const { upiId = "", amount } = req.body;
        try {
            if (!upiId || !amount) return res.status(400).json({ message: 'Missing required parameters' });
            if (!upiId.match(/^\w+@\w+$/)) {
                return res.status(400).json({ message: 'Invalid UPI ID format' });
            }
            if (amount < 1.00) {
                return res.status(400).json({ message: 'Amount must be greater than equal to 1.00' });
            }

            const txnid = generateFixedLengthId(22);
            const details = {
                "address": upiId
            }

            const contact = await this.#filterVPA(upiId);
            if (contact.success && contact.id) {
                const user = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [req.user.id]);
                if (user.balance < transaction.amount) {
                    return res.status(400).json({ message: 'Insufficient balance' });
                }
                await db.none(`INSERT INTO "External_Transaction" (sId,rId,beforeAmount,amount,method, details,txnid) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, contact.id, req.user.balance, amount, "vpa", JSON.stringify(details), txnid]);
                return res.status(200).json({ success: true, txnid });
            } else {
                const data = {
                    name: "User",
                    type: "customer",
                    upiId: upiId
                }

                const newContact = await this.#addContact(data);
                const UPIdata = {
                    contact_id: newContact.id,
                    account_type: "vpa",
                    vpa: {
                        address: upiId
                    }
                }

                const user = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [req.user.id]);
                const account = await this.#addUPIAccount(UPIdata.contact_id, UPIdata);
                if (user.balance < amount) {
                    return res.status(400).json({ message: 'Insufficient balance' });
                }
                await db.none(`INSERT INTO "External_Transaction" (sId,rId,beforeAmount,amount,method, details,txnid) VALUES ($1, $2, $3, $4, $5, $6, $7)`, [req.user.id, account.id, user.amount, amount, "vpa", JSON.stringify(details), txnid]);

                return res.status(200).json({ success: true, txnid });
            }
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }


    async VerifyPin(req, res) {
        try {
            const { txnid, pin } = req.body;
            const transaction = await db.oneOrNone(`SELECT * FROM "External_Transaction" WHERE txnid = $1`, [txnid]);
            const uid = parseInt(transaction.sid);
            const user = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [uid]);
            if (!user) return res.status(404).json({ message: 'User not found' });
            const verify = await bcrypt.compare(pin, user.pin);
            if (!verify) return res.status(401).json({ message: 'Invalid PIN' });
            if (transaction.success) return res.status(403).json({ message: 'This transaction has already been processed.' });
            await db.oneOrNone(`UPDATE "External_Transaction" SET verified = true WHERE txnid = $1`, [txnid]);
            res.status(200).json({ success: true, message: 'PIN verified. Proceeding to payment.', txnid });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    async completeUPIPayment(req, res) {
        try {
            const { txnid } = req.body;
            const transaction = await db.oneOrNone(`SELECT * FROM "External_Transaction" WHERE txnid = $1`, [txnid]);
            if (!transaction.verified) return res.status(403).json({ message: 'You are not allowed to do this transaction.' });
            if (transaction.success) return res.status(403).json({ message: 'This transaction has already been processed.' });
            const user = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [parseInt(transaction.sid)]);
            if (user.balance < transaction.amount) {
                return res.status(400).json({ message: 'Insufficient balance' });
            }
            await db.tx(async (t) => {
                const transaction = await db.oneOrNone(`SELECT * FROM "External_Transaction" WHERE txnid = $1`, [txnid]);
                const status = await this.payout(parseFloat(transaction.amount), transaction.rid, "INR", "UPI", "payout", txnid);
                if (status === "failed" || status == "reversed" || status == "cancelled" || status == "rejected") throw new Error("Payment failed. Please try again.");
                // Update balances atomically
                const amount = await t.one(`UPDATE "User" SET balance = balance - $1 WHERE id = $2 RETURNING balance`, [transaction.amount, parseInt(transaction.sid)]);
                // Log the transaction in Payment_History
                const time = new Date();
                await t.none(
                    `UPDATE "External_Transaction" SET  success=$1, timestamp=$2, afteramount=$3 WHERE txnid=$4`,
                    [true, time, amount, txnid]
                );

                // Add audit log entry
                await AuditLog(
                    transaction.sid,
                    'UPI Payment',
                    `Payment of ${transaction.amount} has been made via UPI with txnid ${txnid} by user ID ${transaction.sid}.`
                );
            });
            res.status(200).json({ success: true, message: 'Payment completed successfully.', txnid });
        } catch (error) {
            console.error('Unexpected error:', error);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    }

    async payout(amount, fa_id, currency, mode, purpose, txnid) {
        try {
            const dynamicRequestConfig = {
                method: 'POST',
                url: 'https://api.razorpay.com/v1/payouts',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${X_Auth_HEADER()}`,
                    'X-Payout-Idempotency': uuidv4(),
                },
                body: {
                    account_number: AccountNumber,
                    fund_account_id: fa_id,
                    amount: amount * 100,
                    currency: currency || "INR",
                    mode: mode || "UPI",
                    purpose: "payout",
                    reference_id: txnid,
                },
            }
            const response = await this.httpRequest.makeRequest({
                ...dynamicRequestConfig
            })
            return response.status;
        } catch (error) {
            console.error('Error adding payout:', error);
            throw error;
        }
    }

    // Method for adding a contact to Razorpay
    async addContactToRazorpay(req, res) {
        try {
            const contact = await this.#addContact(req.body);
            // Proceed to add account if contact creation is successful
            const accountResponse = await this.#addUPIAccount(contact.id, req.body);
            res.status(200).json({
                message: 'Contact and account added successfully',
                contact,
                accountResponse,
            });
        } catch (error) {
            console.error('Error adding contact or account:', error);
            res.status(500).json({ error: 'Failed to add contact or account' });
        }
    }


    async addAccount(req, res) {
        try {
            const account = await this.#addUPIAccount(req.body.contact_id, req.body);
            res.status(200).json(account);
        } catch (e) {
            console.log(e);
        }
    }

    async #addContact({ name, type, upiId }) {
        try {
            const dynamicRequestConfig = {
                method: 'POST',
                url: 'https://api.razorpay.com/v1/contacts',  // Replace with your API URL
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${X_Auth_HEADER()}`,  // Add Razorpay API Key or any other needed
                },
                body: {
                    name: name,
                    type: type,
                    reference_id: `ref-${upiId}`,
                }
            };
            const contact = await this.httpRequest.makeRequest({
                ...dynamicRequestConfig
            });
            return contact;
        } catch (error) {
            console.error('Error adding contact:', error);
            throw error;

        }
    }

    /**
     * Fetches contacts from Razorpay 
     * @returns Array of contacts
     */
    async #fetchContacts() {
        try {
            const dynamicRequestConfig = {
                method: 'GET',
                url: 'https://api.razorpay.com/v1/fund_accounts',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${X_Auth_HEADER()}`,
                },
            };
            const contact = await this.httpRequest.makeRequest({
                ...dynamicRequestConfig
            });
            const contacts = contact.items || [];
            return contacts;
        } catch (error) {
            throw error;
        }
    }

    async #filterVPA(upiId = "") {
        const contacts = await this.#fetchContacts();
        if (contacts) {
            const vpa = contacts.filter((obj) => obj.vpa.address === upiId);
            if (vpa && vpa.length > 0) {
                return { success: true, vpa: vpa[0] };
            } else {
                return { success: false };
            }
        } else {
            return { success: false };
        }
    }

    // Method for adding a bank account to a contact
    async #addUPIAccount(contact_id, { account_type = "vpa", vpa }) {
        try {
            const fundAccount = paymentGateway.fundAccount.create({
                contact_id,
                account_type,
                vpa
            });
            return fundAccount;
        } catch (error) {
            console.error('Error adding account:', error);
            throw error; // Propagate error for handling in the calling method
        }
    }

    async createOrder(req, res) {
        const { amount } = req.body;
        try {
            const receipt = 'receipt_' + Math.random().toString(36).substring(7);

            const options = {
                amount: amount,
                currency: 'INR',
                receipt: receipt
            };
            const user = await db.oneOrNone(`SELECT * FROM "User" WHERE id = $1`, [req.user.id]);
            const order = await RechargeGateway.orders.create(options);
            const balance = parseFloat(parseInt(amount) / 100).toFixed(2);
            await db.none(`INSERT INTO "Wallet_Recharge" ("uId", beforeamount, amount, details, receipt) 
                VALUES ($1, $2, $3, $4, $5)`,
                [req.user.id, user.balance, balance, "razorpay", order.id]
            );
            return res.status(200).json(order);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: err.message });
        }
    }

    async verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            const sign = razorpay_order_id + '|' + razorpay_payment_id;
            const expectedSign = crypto.createHmac('sha256', process.env.RAZORPAY_GATEWAY_KEY_SECRET)
                .update(sign.toString())
                .digest('hex');

            if (razorpay_signature === expectedSign) {
                db.tx(async (t) => {
                    const result = await t.oneOrNone(`UPDATE "Wallet_Recharge" SET verified = true WHERE receipt = $1 RETURNING amount`, [razorpay_order_id]);
                    console.log(result);
                    await t.none(`UPDATE "User" SET balance = balance + $1 WHERE id = $2`, [result.amount, req.user.id]);
                })
                res.status(200).json({ success: true, message: 'Payment verified successfully' });
            } else {
                console.log("Invalid payment signature")
                res.status(400).json({ success: false, error: 'Invalid payment signature' });
            }
        } catch (err) {
            console.log(err);
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

// Export the class instance to be used in routes or elsewhere
module.exports = new ExternalPaymentController();
