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
    image: String,
    Plan_Type: String,
    Duration: String,
    Monthly_cost: String,
    Seat_Number: String,
    Location: Boolean,
    Active: Boolean,
    Starting_Date: String,
    Day_Remining: Number,
    Locker: Boolean,
    Floor: String,
    Totalamount: Number
});

const User = mongoose.model("User", userSchema);

module.exports = User;