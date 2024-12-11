const { fetchLoggedInUser, fetchBalance, getConnections, getPaymentHistory, getRecentPaidUsers, getSinglePaymentHistory, fetchUser, getBankDetails } = require('../controllers/Information.controller');
const { isAuthenticatedUser } = require('../middleware/UserVerify');


const Router = require('express').Router();


// Get Requests
Router.route('/information/logged_in_user').get(isAuthenticatedUser, fetchLoggedInUser);
Router.route('/get/balance').get(isAuthenticatedUser, fetchBalance);
Router.route('/get/connections').get(isAuthenticatedUser, getConnections);
Router.route('/user').get(isAuthenticatedUser, fetchUser);
Router.route('/get/payment_history').get(isAuthenticatedUser, getPaymentHistory);
Router.route('/get/payment_history/user').get(isAuthenticatedUser, getSinglePaymentHistory);
Router.route('/get/last_payments').get(isAuthenticatedUser, getRecentPaidUsers);
Router.route('/bank').get(isAuthenticatedUser, getBankDetails);
module.exports = Router;