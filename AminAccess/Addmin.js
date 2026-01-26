const jwt = require('jsonwebtoken')
const User = require("../models/userSchema");
const GroundSeatBooking = require("../models/Groundflor");
const topSeetBooking = require("../models/Topflor")

const deaskbordData = async(req, res) => {
    try {
        const Data = await User.find();
        let totaluser = 0;
        let Oqupidseat = 0;
        let Totalrevinue = 0;
        Data.map((item) => {
            totaluser++;
            if (item.Seat_Number != '0') {
                Oqupidseat++;
            }
            if (item.Totalamount > 0) {
                Totalrevinue += item.Totalamount;
            }

        })

        res.status(200).json({ totaluser, Oqupidseat, Totalrevinue, Data })

    } catch (error) {

        res.status(500).json({ massage: "Internal  server error" })
    }
}
const Deleteuser = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        if (deletedUser.Location) {
            await topSeetBooking.deleteOne({ email: deletedUser.email })
        }
        await GroundSeatBooking.deleteOne({ email: deletedUser.email });
        res.status(200).json({ message: "User deleted successfully", });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
module.exports = { deaskbordData, Deleteuser }