const { signup, login, forgetPassword, Verifyemail, OTPverify, verfyOTP, Logout, isLoging } = require("../controller/UserController");
const upload = require('../Middlerwere/Multler')
const Autho = require('../Middlerwere/Autho')
const { Adddata, SendData, Seatupdate, CancilSubscription, descrase, gaetSeat, topflor, cheqActive } = require('../UserPlanDetils/Plan')
const router = require("express").Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/verfyemail', Verifyemail)
router.post('/otpverify', OTPverify);
router.post('/verfyOTP', verfyOTP);
router.post('/Logout', Logout);
router.post('/isLoging', isLoging);
router.post('/changepassword', forgetPassword)

//  User  plan detials 
router.post('/Adduserplanedata', Autho, upload.single('UserImg'), Adddata)
router.post('/SendData', Autho, SendData);
router.put("/Seatupdate", Autho, Seatupdate);
router.put("/CancilSubscription", Autho, CancilSubscription);
router.get('/descrase', Autho, descrase)
router.get('/gaetSeat', Autho, gaetSeat)
router.get('/topflor', Autho, topflor)
router.post('/cheqActive', Autho, cheqActive)
module.exports = router;