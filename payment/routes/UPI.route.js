const { isAuthenticatedUser } = require('../middleware/UserVerify');
const ExternalPaymentController = require('../controllers/Razorpay.controller');
const Router = require('express').Router();


Router.route('/pay/initiate_upi').post( isAuthenticatedUser, (req, res) => ExternalPaymentController.upiPaymentInitiate(req, res));
Router.route('/pay/verify_pin').post( isAuthenticatedUser, (req, res) => ExternalPaymentController.VerifyPin(req, res));
Router.route('/upi/pay').post( isAuthenticatedUser, (req, res) => ExternalPaymentController.completeUPIPayment(req, res));
Router.route('/account/add-contact').post((req, res) => ExternalPaymentController.addContactToRazorpay(req, res));
Router.route('/account/add').post((req, res) => ExternalPaymentController.addAccount(req, res));
Router.route('/create-order').post(isAuthenticatedUser, (req, res) => ExternalPaymentController.createOrder(req, res));
Router.route('/verify-payment').post(isAuthenticatedUser, (req, res) => ExternalPaymentController.verifyPayment(req, res));
Router.route('/payout').post(isAuthenticatedUser, (req, res) => ExternalPaymentController.makePayout(req, res));
module.exports = Router