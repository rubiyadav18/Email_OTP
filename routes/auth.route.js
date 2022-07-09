const router = require('express').Router();
const authController = require('../controllers/auth.controller');

//signUpUser

router.post('/', authController.signUpUser);

//verify--
router.post('/verify', authController.verify_Mobile_Number);

//resetpassword
router.post('/resetpassword', authController.RestPassword);

//otpcheck
router.post('/otpcheck', authController.RestPasswordOtp);

//RestPasswordLink
router.post('/reset', authController.RestPasswordLink);

//login
router.post('/login', authController.login);

//SMS--
router.get('/sms', authController.sendsms);

module.exports = router;



