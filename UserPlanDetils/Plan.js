const jwt = require('jsonwebtoken')
const User = require("../models/userSchema");
const GroundSeatBooking = require("../models/Groundflor");
const topSeetBooking = require("../models/Topflor")

// add  user  plan detials
const Adddata = async(req, res) => {
    try {
        const token = req.cookies.token;
        console.log(req.body)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;
        const plandata = JSON.parse(req.body.PlaneData);
        const user2 = await User.findById(_id);
        if (user2.Active) return res.status(404).json({ massage: "You  can not book becouse you allready  booked  you cand  changa  nad  extend  youre  subcription" })
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Number(req.body.Day_Remining || 0));
        const formattedEndDate = endDate.toISOString().split("T")[0];
        if (req.body.Location && req.body.Seat_Number != "0") {
            const creted = await topSeetBooking.create({ seatNumber: req.body.Seatnumber, email: user2.email });
            if (!creted) return res.status(404).json({ massage: "set is  not avalibel" })
        } else {
            if (req.body.Seatnumber != "0") {
                const creted = await GroundSeatBooking.create({ seatNumber: req.body.Seatnumber, email: user2.email });
                if (!creted) return res.status(404).json({ massage: "set is  not avalibel" })

            }

        }
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
                    Day_Remining: req.body.Day_Remining,
                    Locker: req.body.locker,
                    Floor: plandata.floors,
                    Totalamount: req.body.Totalamount,
                    Enddate: formattedEndDate
                }
            }, { new: true }
        );

        res.status(200).json({ massage: "bookend" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: error })
    }

}
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
        if (userfound.Location) {
            await topSeetBooking.findOneAndUpdate({ email: userfound.email }, { seatNumber: req.body.seat });
        } else {
            await GroundSeatBooking.findOneAndUpdate({ email: userfound.email }, { seatNumber: req.body.seat });

        }
        await userfound.save()
        res.status(200).json({ massage: "seat   update conform" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "Somthing  went  wrong" })
    }
}

const gaetSeat = async(req, res) => {
    try {
        const booked = await GroundSeatBooking.find({}, "seatNumber");

        const bookedSeats = booked.map(b => b.seatNumber);
        res.status(200).json({ data: bookedSeats })
    } catch (error) {
        console.log(error);
        res.status(500).json({ massage: "somthing  went  wronge" })

    }
}
const topflor = async(req, res) => {
        try {
            const booked = await topSeetBooking.find({}, "seatNumber");

            const bookedSeats = booked.map(b => b.seatNumber);
            res.status(200).json({ data: bookedSeats })
        } catch (error) {
            console.log(error);
            res.status(500).json({ massage: "somthing  went  wronge" })

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
        console.log("loction ", userfound.Location);

        if (userfound.Location) {
            await topSeetBooking.deleteOne({ email: userfound.email })
        } else {
            await GroundSeatBooking.deleteOne({ email: userfound.email });
        }

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



module.exports = { Adddata, SendData, Seatupdate, CancilSubscription, descrase, gaetSeat, topflor }