const { createUser, loginUser, fetchUser, verifyUser, countUsers, requestPinChange, forgotPIN, changePIN, getUserByPayID, changeNumber, addConnection, getUserByNumber } = require('../controllers/User.controller');
const { verifyOTP, isAuthenticatedUser } = require('../middleware/UserVerify');

const Router = require('express').Router();


Router.route('/create_user').post(createUser);
Router.route('/login_user').post(loginUser);
Router.route('/verify_user').post(verifyUser);
Router.route('/forgot_pin').post(verifyOTP, forgotPIN);
Router.route('/change_pin').post(changePIN);
Router.route('/add_user').post(isAuthenticatedUser, addConnection);

Router.route('/request_pinchange').put(requestPinChange);

Router.route('/change_number').patch(changeNumber);

Router.route('/fetch_user').get(fetchUser);
Router.route('/count_user').get(countUsers);
Router.route('/find_payid').get(getUserByPayID);
Router.route('/find_number').get(getUserByNumber);
module.exports = Router;