const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    otp: Number,
    otpExpiry: Date,
    isOtpVerified: {
        type: Boolean,
        default: false
    }

    // image: String,
    // startingDate: String,
    // personalLocker: String,
    // planType: String,
    // duration: String,
    // monthlyCost: String,
    // seat: String,
    // location: String,
    // active: String,

});

const User = mongoose.model("User", userSchema);

module.exports = User;