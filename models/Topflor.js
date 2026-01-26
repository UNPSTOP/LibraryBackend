const mongoose = require('mongoose');
const topSeatBookingSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

const topSeetBooking = mongoose.model("topSeetBooking", topSeatBookingSchema);

module.exports = topSeetBooking;