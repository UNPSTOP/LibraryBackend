require('dotenv').config();
const User = require("../models/userSchema");
const UserOtp = require("../models/Otpstore");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
// const generateToken = require("../utiliy.js");
const jwt = require('jsonwebtoken')


// let code = 0;
// let email = "";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const sendVerificationEmail = async(email) => {
   const code = generateCode();

    await transporter.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Your Verification Code",
        html: `
      <h2>Email Verification</h2>
      <p>Your verification code is:</p>
      <h1>${code}</h1>
      <p>This code expires in 5 minutes.</p>
    `,
    });

    return code; // save this in DB
};


const signup = async(req, res) => {

    try {
        const { name, email, password, conformPasswoed } = req.body;
        // console.log(req.body)
        if (!name || !email || !password || !conformPasswoed) {
            return res.status(400)
                .json({
                    message: "All fild's are required",
                    success: false
                })
        }

        if (password !== conformPasswoed || password.length < 6) {
            return res.status(400)
                .json({
                    massage: "Password invalid",
                    success: false
                });
        }

        const exist = await User.findOne({ email: email });
        if (exist) return res.status(409)
            .json({
                message: "User already exists",
                success: false
            });
        await UserOtp.findOneAndDelete({ email });

       let otp;
    try {
      otp = await sendVerificationEmail(email);
    } catch (err) {
      return res.status(500).json({ message: "Email failed" });
    }

    await UserOtp.create({ email, OTP: otp });

    res.status(201).json({ message: "OTP sent", success: true });

    } catch (err) {
        res.status(500)
            .json({
                message: "Server error",
                success: false
            });
    }
};

const OTPverify = async(req, res) => {
    try {
        const { name, email, password, otp } = req.body;
        const finde = await UserOtp.findOne({ email });
        if (!finde) {
            return res.status(404).json({ massage: "otp is  not  valid find" })
        }
        if (finde.OTP != otp) {
            return res.status(404).json({ massage: "otp is  not  valid otp" })
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const data = await User.create({
            name: name,
            email: email,
            password: hashPassword
        });
        await UserOtp.findByIdAndDelete({ _id: finde._id });
        const token = jwt.sign({ id: data._id, email: data.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );
        //  = generateToken(finde._id, finde.email);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200)
            .json({
                message: "Signup successful",
                success: true,
                data: data
            });

    } catch (error) {
        res.status(500)
            .json({
                message: error.message,
                success: false
            });
    }
}



const login = async(req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(409)
                .json({
                    message: "Auth failed email or password is wrong",
                    success: false
                })
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if (!isPassEqual) {
            return res.status(400)
                .json({
                    message: "Auth failed email or password is wrong",
                    success: false
                })
        }

        const token = jwt.sign({ id: user._id, email: user.email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200)
            .json({
                message: "Login Successfully",
                success: true
            })

    } catch (err) {
        res.status(500)
            .json({
                message: "Somting wrong in intervel Server",
                success: false
            })
    }

};
const Logout = async(req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: true, // true in production (HTTPS)
        sameSite: "none"
    });

    res.json({ massage: "Logged out successfully" });
}

async function Verifyemail(req, res) {
    try {
        const { email } = req.body;
        const found = await User.findOne({ email });
        if (!found) {
            return res.status(404).json({ massage: "inValidd Email" });

        }
        await UserOtp.findOneAndDelete({ email });
        const otp = await sendVerificationEmail(email);
        await UserOtp.create({
            email: email,
            OTP: otp
        });

        res.status(201)
            .json({
                message: "OTP sent",
                success: true,
            });

    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: error })
    }
}

async function verfyOTP(req, res) {
    try {
        const { email, otp } = req.body;
        const found = await UserOtp.findOne({ email });
        if (!found) {
            return res.status(404).json({ massage: "inValidd Email" });
        }
        if (found.OTP != otp) {
            return res.status(404).json({ massage: "otp is  not  valid otp" })
        }
        await UserOtp.findOneAndDelete({ email });
        const userfounded = await User.findOne({ email });
        const token = jwt.sign({ id: userfounded._id, email: email },
            process.env.JWT_SECRET, { expiresIn: "7d" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200).json({ massage: "sucessfuly", })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: error })
    }
}



const forgetPassword = async(req, res) => {
    try {
        const { password, conformPasswoed } = req.body;
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const Found = await User.findById(decoded.id);
        if (conformPasswoed != password) {
            return res.status(400).json({ massage: "Password not match" })
        }
        if (!Found) {
            return res.status(404).json({ massage: " user  not exist  try aging " })
        }
        const hashPassword = await bcrypt.hash(password, 10);
        Found.password = hashPassword
        await Found.save();
        res.status(200).json({ massage: "Fassword changed suceess fuly" })


    } catch (err) {
        console.log(err)
        res.status(500)
            .json({
                message: "Somthing worng in interval server",
                success: false
            })
    }
}

const isLoging = async(req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ massage: "token is empty", success: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(404).json({ massage: "not valid  user", success: false });
    return res.status(200).json({ massage: "suceess fully", success: true })
}
module.exports = {
    signup,
    OTPverify,
    login,
    forgetPassword,
    Verifyemail,
    verfyOTP,
    Logout,
    isLoging
}
