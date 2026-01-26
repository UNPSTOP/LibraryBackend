require("dotenv").config();
const User = require("../models/userSchema");
const UserOtp = require("../models/Otpstore");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

/* ================= EMAIL CONFIG ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* ================= HELPERS ================= */

const generateCode = () => Math.floor(1000 + Math.random() * 9000);

const sendVerificationEmail = async (email) => {
  const code = generateCode();

  await transporter.sendMail({
    from: `"Library App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${code}</h1>
      <p>Valid for 5 minutes</p>
    `
  });

  return code;
};

const setCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,        // REQUIRED for HTTPS
    sameSite: "none",    // REQUIRED for Vercel
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

/* ================= SIGNUP ================= */

const signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password !== confirmPassword || password.length < 6) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

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
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VERIFY OTP & CREATE USER ================= */

const OTPverify = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    const record = await UserOtp.findOne({ email });
    if (!record || record.OTP != otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hash
    });

    await UserOtp.deleteOne({ email });

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setCookie(res, token);

    res.status(200).json({
      message: "Signup successful",
      success: true,
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= LOGIN ================= */

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    setCookie(res, token);

    res.json({ message: "Login successful", success: true });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGOUT ================= */

const Logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none"
  });

  res.json({ message: "Logged out" });
};

/* ================= CHECK LOGIN ================= */

const isLoging = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json({ success: false });

    jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true });

  } catch {
    res.json({ success: false });
  }
};

/* ================= EXPORT ================= */

module.exports = {
  signup,
  OTPverify,
  login,
  Logout,
  isLoging
};
