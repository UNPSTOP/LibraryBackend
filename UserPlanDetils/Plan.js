const jwt = require('jsonwebtoken')
const User = require("../models/userSchema");

const Adddata = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const plandata = JSON.parse(req.body.PlaneData);
        await User.findByIdAndUpdate(
            _id, {
                $set: {
                    image: req.file ? req.file.filename : undefined,
                    Plan_Type: plandata.title,
                    Duration: plandata.duration,
                    Monthly_cost: plandata.price,
                    Seat_Number: req.body.Seatnumber,
                    Location: plandata.premium,
                    Active: true,
                    Starting_Date: req.body.startDate,
                    Day_Remining: 30,
                    Locker: req.body.locker,
                    Floor: plandata.floors,
                    Totalamount: req.body.Totalamount
                }
            }, { new: true }
        );
        res.status(200).json({ massage: "heloo" })
    } catch (error) {
        console.log(error)
    }

}


const SendData = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const userdata = await User.findById(_id);
        res.status(200).json({ massage: "data sendes", user: userdata })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: 'somthing went  wrong' })
    }
}
module.exports = { Adddata, SendData }