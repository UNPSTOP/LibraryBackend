require('dotenv').config();
const User = require("../models/userSchema");
const UserOtp = require("../models/Otpstore");
const bcrypt = require('bcrypt');
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const generateToken = require("../utiliy.js");


// let code = 0;
// let email = "";


const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // app password
    },
});

const generateCode = () => {
    return Math.floor(1000 + Math.random() * 9000);
};

const sendVerificationEmail = async (email) => {
    code = generateCode();

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


const signup = async (req, res) => {

    try {
        const { name, email, password, conformPasswoed } = req.body;
        console.log(req.body)
        if (!name || !email || !password || !conformPasswoed) {
            return res.status(400)
                .json({
                    message: "All fild's are required",
                    success: false
                })
        }
        console.log("1")

        if (password !== conformPasswoed || password.length < 6) {
            return res.status(400)
                .json({
                    message: "Password invalid",
                    success: false
                });
        }
console.log("2")
        const exist = await User.findOne({ email:email });
        if (exist) return res.status(409)
            .json({
                message: "User already exists",
                success: false
            });
            console.log("3")
       const otp = await sendVerificationEmail(email);
       await UserOtp.create({
        email:email,
        OTP:otp});
       console.log("4")
        res.status(201)
        .json({ 
            message: "OTP sent", 
            success: true,
        });
    } catch (err) {
        console.log(err)
        res.status(500)
        .json({
             message: "Server error",
             success: false
             });
    }
};

const OTPverify = async (req, res) => {
    try {
        const { name,email,password, otp } = req.body;
        const  finde=await UserOtp.findOne({email});
        if(!finde){
            return res.status(404).json({massage:"otp is  not  valid"})
        }
        if(finde.OTP!=otp){
            return res.status(404).json({massage:"otp is  not  valid"})
        }
       const data= await User.create(req.body)
       await UserOtp.findByIdAndDelete({_id: finde._id});
       const token="heloo"
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        

        res.status(200)
        .json({
             message: "Signup successful",
              success: true ,
              data:data
            });

    } catch (error) {
        res.status(500)
        .json({
             message: error.message,
            success: false
        });
    }
}

const resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400)
                .json({
                    message: "All fild's are required",
                    success: false
                })
        }
        const user = await User.findOne({ _id :userId });
        if (!user) {
            return res.status(404)
                .json({
                    message: "User not found",
                    success: false
                })
        }
        const newotp = await sendVerificationEmail(user.email);

        user.otp = newotp;
        user.otpExpires = Date.now() + 5 * 60 * 1000;

        await user.save();
        res.status(200)
            .json({
                message: "OTP Resend Successfully",
                success: true,
                userId : user._id
            });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const login = async (req, res) => {
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

        const token = generateToken(user._id, user.email);

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.status(200)
            .json({
                message: "Login Successfully",
                success: true
            })

    } catch (err) {
        console.log(err);
        res.status(500)
            .json({
                message: "Somting wrong in intervel Server",
                success: false
            })
    }
};

const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if(!email){
            return res.status(400)
            .json({
                message: "Email are required",
                success: false
            })
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400)
                .json({
                    message: "Wrong email",
                    success: false
                })
        }

        const otp = await sendVerificationEmail(email);

        user.otp = otp
        user.otpExpires = Date.now() + 5 * 60 * 1000
        await user.save();

        res.status(201).
            json({
                message: "OTP sent to email",
                success: true,
                userId : user._id
            });


    } catch (err) {
        res.status(500)
            .json({
                message: "Somthing worng in interval server",
                success: false
            })
    }
}

const otpResetPassword = async (req, res) => {
    try {
        const {userId , otp } = req.body;

        if (!userId || !otp) {
            return res.status(400).json({
                message: "All fields required",
                success: false
            });
        }

        const user = await User.findOne({ _id :userId });
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            });
        }

        if (Number(otp) !== user.otp) {
            return res.status(400).json({
                message: "Invalid OTP",
                success: false
            });
        }

        if (user.otpExpires < Date.now()) {
            return res.status(400).json({
                message: "OTP expired",
                success: false
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000;
        user.otp = undefined;
        user.otpExpires = undefined;

        await user.save();

        //Note:- frontend must store temporarily resetToken

        res.status(200).json({
            message: "OTP verified",
            resetToken,
            success: true
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword, conformPasswoed } = req.body;

        if (!resetToken || !newPassword || !conformPasswoed) {
            return res.status(400).json({
                message: "All fields required",
                success: false
            });
        }

        if (newPassword !== conformPasswoed || newPassword.length < 6) {
            return res.status(400).json({
                message: "Invalid password",
                success: false
            });
        }

        const user = await User.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid or expired reset token",
                success: false
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({
            message: "Password reset successful",
            success: true
        });

    } catch (err) {
        res.status(500).json({
            message: "Server error",
            success: false
        });
    }
};

const Verifyemail = async (req, res) => {
    try {
        console.log(req.body)
        const founded = await User.findOne({ email: req.body.email })
        if (!founded) {
            return res.status(400)
                .json({
                    massage: "Invalid  email",
                    success: false
                })
        }
        code = await sendVerificationEmail(req.body.email);

        res.status(200).json({ message: "Email verified", });
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: 'somthing with  wrong' })
    }
}

module.exports = {
    //signup
    signup,
    OTPverify,
    //Login
    login,
    //I think it is userless
    Verifyemail,
    //use to forget Password
    forgetPassword,
    otpResetPassword,
    resetPassword,
    // resend otp
    resendOTP
}