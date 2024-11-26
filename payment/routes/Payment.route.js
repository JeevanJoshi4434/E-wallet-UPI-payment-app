const { sendPayment, requestGlobalPayment, initiatePayment, verifyPin, completePayment } = require('../controllers/Payment.controller');
const { isAuthenticatedUser } = require('../middleware/UserVerify');
const Router = require('express').Router();

/**
 * @route POST /payment/pay
 * @description Initiates a payment transaction between users.
 * @access Authenticated users only
 * @deprecated Due to security issues, this API call is deprecated and should not be used in production. (Bug Hunter - G1 JO-SHE)
 */
Router.route('/pay').post( isAuthenticatedUser, sendPayment);

Router.route('/payment/request_global').post( isAuthenticatedUser, requestGlobalPayment);

// Payment Process
Router.route('/payment/initiate').post(isAuthenticatedUser, initiatePayment);
Router.route('/Payment/verify').post(isAuthenticatedUser, verifyPin);
Router.route('/payment/pay').post(isAuthenticatedUser, completePayment);

module.exports = Router