const { createUser, loginUser, fetchUser, verifyUser, countUsers, requestPinChange, forgotPIN, changePIN, getUserByPayID, changeNumber } = require('../controllers/User.controller');
const { verifyOTP } = require('../middleware/UserVerify');

const Router = require('express').Router();


Router.route('/create_user').post(createUser);
Router.route('/login_user').post(loginUser);
Router.route('/verify_user').post(verifyUser);
Router.route('/forgot_pin').post(verifyOTP, forgotPIN);
Router.route('/change_pin').post(changePIN);

Router.route('/request_pinchange').put(requestPinChange);

Router.route('/change_number').patch(changeNumber);

Router.route('/fetch_user').get(fetchUser);
Router.route('/count_user').get(countUsers);
Router.route('/find_payid').get(getUserByPayID);
Router.route('/find_number').get(getUserByPayID);
module.exports = Router;