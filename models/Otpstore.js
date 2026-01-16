const mongoose = require('mongoose');

const StorOtp = mongoose.Schema({
    email: { type: String, required: true },
    OTP: { type: Number, required: true },
  
})

const UserOtp = mongoose.model("UserOtp", StorOtp);

module.exports = UserOtp;