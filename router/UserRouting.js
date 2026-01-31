const { signup, login, forgetPassword, Verifyemail, Logout, isLoging, Feedback1 } = require("../controller/UserController");
const upload = require('../controller/Middlerwere/Multler')
const Autho = require('../controller/Middlerwere/Autho')
const { Adddata, SendData, Seatupdate, CancilSubscription, gaetSeat, topflor, cheqActive, complainpush, getComplain, markCompletcomplain } = require('../UserPlanDetils/Plan')
const { deaskbordData, Deleteuser } = require('../AminAccess/Addmin')
const router = require("express").Router();
const multer = require("multer");
const path = require("path");
function fileValidator(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const file = req.file;
    const ext = path.extname(file.originalname).toLowerCase();
    const imageTypes = [".jpg", ".jpeg", ".png"];
    const videoTypes = [".mp4", ".mov", ".avi", ".mkv"];

    if (videoTypes.includes(ext)) {
        return res.status(400).json({ massage: "Videos are not allowed" });
    }

    if (imageTypes.includes(ext)) {
        const sizeMB = file.size / (1024 * 1024);
        if (sizeMB > 5) {
            return res.status(400).json({ massage: "Image size exceeds 5MB" });
        }
        return res.status(200).json({massage:"Valid"})
    }

    return res.status(400).json({ massage: "Invalid file type" });
}
router.post('/signup', signup);
router.post('/login', login);
router.post('/feedback', Feedback1)
router.post('/verfyemail', Verifyemail)
    // router.post('/otpverify', OTPverify);
    // router.post('/verfyOTP', verfyOTP);
router.post('/Logout', Logout);
router.post('/isLoging', isLoging);
router.post('/changepassword', forgetPassword)

//  User  plan detials 
router.post("/fileValidator", Autho,fileValidator );
router.post('/Adduserplanedata', Autho, upload.single('UserImg'), Adddata)
router.post('/SendData', Autho, SendData);
router.put("/Seatupdate", Autho, Seatupdate);
router.put("/CancilSubscription", Autho, CancilSubscription);

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



