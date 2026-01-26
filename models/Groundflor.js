const mongoose = require('mongoose');
const GroundSeatBookingSchema = new mongoose.Schema({
    seatNumber: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true
    }
});

const GroundSeetBooking = mongoose.model("GroundSeetBooking", GroundSeatBookingSchema);

module.exports = GroundSeetBooking;