const { signup, login, forgetPassword, Verifyemail, OTPverify, verfyOTP, Logout, isLoging } = require("../controller/UserController");
const upload = require('../Middlerwere/Multler')
const Autho = require('../Middlerwere/Autho')
const { Adddata, SendData, Seatupdate, CancilSubscription, descrase, gaetSeat, topflor, cheqActive, complainpush, getComplain, markCompletcomplain } = require('../UserPlanDetils/Plan')
const { deaskbordData, Deleteuser } = require('../AminAccess/Addmin')
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

// admin 
router.get('/deaskbordData', deaskbordData)
router.delete('/delsete/:id', Deleteuser)
router.post('/Pushcomplain', complainpush)
router.get('/getComplain', getComplain);
router.put('/markcomplete/:id', markCompletcomplain)
module.exports = router;