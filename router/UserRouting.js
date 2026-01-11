const { signup, login, forgetPassword } = require("../controller/UserController");



const router = require("express").Router();

router.post('/signup', signup);
router.post('/login', login);
router.get("/forgetPassword", forgetPassword)

module.exports = router;