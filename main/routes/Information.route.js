const { fetchLoggedInUser, fetchBalance, getConnections, getPaymentHistory, getRecentPaidUsers } = require('../controllers/Information.controller');
const { isAuthenticatedUser } = require('../middleware/UserVerify');


const Router = require('express').Router();


// Get Requests
Router.route('/information/logged_in_user').get(isAuthenticatedUser, fetchLoggedInUser);
Router.route('/get/balance').get(isAuthenticatedUser, fetchBalance);
Router.route('/get/connections').get(isAuthenticatedUser, getConnections);
Router.route('/get/payment_history').get(isAuthenticatedUser, getPaymentHistory);
Router.route('/get/last_payments').get(isAuthenticatedUser, getRecentPaidUsers);
module.exports = Router;