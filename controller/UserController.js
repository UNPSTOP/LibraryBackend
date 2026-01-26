require("dotenv").config();

const User = require("../models/userSchema");
const UserOtp = require("../models/Otpstore");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

/* =======================
   SIGNUP
======================= */
const signup = async(req, res) => {
    try {
        const { name, email, password, conformPasswoed } = req.body;

        if (!name || !email || !password || !conformPasswoed) {
            return res.status(400).json({
                message: "All fields are required",
                success: false,
            });
        }

        if (password !== conformPasswoed || password.length < 6) {
            return res.status(400).json({
                message: "Password invalid",
                success: false,
            });
        }

        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(409).json({
                message: "User already exists",
                success: false,
            });
        }

   
       const hashPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashPassword,
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Signup successful",
            success: true,
            data: user,
        });

         
    } catch (err) {
        res.status(500).json({
            message: err.message,
            success: false,
        });
    }
};



/* =======================
   LOGIN
======================= */
const login = async(req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Email or password wrong",
                success: false,
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Email or password wrong",
                success: false,
            });
        }

        const token = jwt.sign({ id: user._id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login successful",
            success: true,
        });
    } catch (err) {
        res.status(500).json({
            message: err.message,
            success: false,
        });
    }
};

/* =======================
   VERIFY EMAIL (RESEND OTP)
======================= */
const Verifyemail = async(req, res) => {
    try {
        const { email } = req.body;

        const found = await User.findOne({ email });
        if (!found) {
            return res.status(404).json({
                message: "Invalid email",
            });
        }

        const token = jwt.sign({ id: found._id, email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: "Email verifyed" });
     
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

/* =======================
   LOGOUT
======================= */
const Logout = async(req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true,
        sameSite: "none",
    });

    res.json({ message: "Logged out successfully" });
};

/* =======================
   CHECK LOGIN
======================= */
const isLoging = async(req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.json({ success: false });
        }

        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ success: true });
    } catch {
        return res.json({ success: false });
    }
};

const forgetPassword = async(req, res) => {
    try {
        const { password, conformPasswoed } = req.body;
        const token = req.cookies.token;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password !== conformPasswoed) {
            return res.status(400).json({ message: "Password mismatch" });
        }

        user.password = await bcrypt.hash(password, 10);
        await user.save();

        res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};



/* =======================
   EXPORTS
======================= */
module.exports = {
    signup,
    login,
    Verifyemail,
    Logout,
    isLoging,
    forgetPassword
};
