const jwt = require('jsonwebtoken')
const User = require("../models/userSchema");

// add  user  plan detials
const Adddata = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const plandata = JSON.parse(req.body.PlaneData);
        const user2 = await User.findById(_id);
        if (user2.Active) return res.status(404).json({ massage: "You  can not book becouse you allready  booked  you cand  changa  nad  extend  youre  subcription" })
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

// user data
const SendData = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const userdata = await User.findById(_id);
        if (userdata.Active == false) return res.status(404).json({ massage: "No have  any  subscription" })
        res.status(200).json({ massage: "data sendes", user: userdata })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: 'somthing went  wrong' })
    }
}

const Seatupdate = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const userfound = await User.findById(_id);
        userfound.Seat_Number = req.body.seat;
        await userfound.save()
        res.status(200).json({ massage: "seat   update conform" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Somthing  went  wrong" })
    }
}

// cancil  subscription just  add  active  false
const CancilSubscription = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const userfound = await User.findById(_id);
        userfound.Active = false;
        await userfound.save()
        res.status(200).json({ massage: "Subcription cancile" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "somthin went  wrong" })
    }
}

function updateRemainingDays(user) {
    if (!user.Active) return user;

    const today = new Date();
    const startDate = new Date(user.Starting_Date);

    const diffTime = today - startDate;
    const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const remaining = user.Day_Remining - passedDays;

    user.Day_Remining = remaining > 0 ? remaining : 0;

    if (user.Day_Remining === 0) {
        user.Active = false;
    }

    return user;
}

const descrase = async(req, res) => {
    try {
        const token = req.cookies.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const user = await User.findById(_id);
        updateRemainingDays(user);
        await user.save()
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "somthing  went  wrong" })
    }

}

module.exports = { Adddata, SendData, Seatupdate, CancilSubscription, descrase }