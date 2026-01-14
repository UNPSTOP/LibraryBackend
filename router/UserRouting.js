const { signup, login, forgetPassword, Verifyemail, OTPverify , resetPassword, otpResetPassword} = require("../controller/UserController");


const router = require("express").Router();

router.post('/signup', signup);
router.post('/login', login);
// router.post('/emailverify', Verifyemail);
router.post('/otpverify', OTPverify);
router.get("/forgetPassword", forgetPassword);
router.post("/otpResetPassword", otpResetPassword )
router.post("/resetpassword", resetPassword);


module.exports = router;