const { signup, login, forgetPassword, Verifyemail, OTPverify, verfyOTP, Logout, isLoging } = require("../controller/UserController");


const router = require("express").Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verfyemail', Verifyemail)
router.post('/otpverify', OTPverify);
router.post('/verfyOTP', verfyOTP);
router.post('/Logout', Logout);
router.get('/isLoging', isLoging);

router.post('/changepassword', forgetPassword)

module.exports = router;