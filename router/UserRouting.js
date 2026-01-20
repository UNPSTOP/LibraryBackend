const { signup, login, forgetPassword, Verifyemail, OTPverify, verfyOTP } = require("../controller/UserController");


const router = require("express").Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verfyemail', Verifyemail)
router.post('/otpverify', OTPverify);
router.post('/verfyOTP', verfyOTP);

router.post('/changepassword', forgetPassword)

module.exports = router;