const jwt = require('jsonwebtoken')
const User = require("../models/userSchema");
const GroundSeatBooking = require("../models/Groundflor");
const topSeetBooking = require("../models/Topflor")
const Complain = require("../models/Complain");

// add  user  plan detials
const Adddata = async(req, res) => {
    try {
        console.log("REQ.BODY:", req.body);

        // --- Verify Token ---
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ massage: "No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const _id = decoded.id;

        // --- Parse PlaneData safely ---
        const plandata =
            typeof req.body.PlaneData === "string" ?
            JSON.parse(req.body.PlaneData) :
            req.body.PlaneData;

        // --- Find User ---
        const user2 = await User.findById(_id);
        if (!user2)
            return res.status(404).json({ massage: "User not found" });

        if (user2.Active) {
            return res.status(400).json({
                massage: "You cannot book because you already booked. You can't change or extend your subscription.",
            });
        }

        // --- Dates ---
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Number(req.body.Day_Remining || 0));
        const formattedEndDate = endDate.toISOString().split("T")[0];

        // --- Seat Booking ---
        const seatNumber = String(req.body.Seatnumber || "0");

        if (plandata.premium && seatNumber !== "0") {
            const created = await topSeetBooking.create({
                seatNumber,
                email: user2.email,
            });
            if (!created)
                return res.status(400).json({ massage: "Seat is not available" });
        } else if (seatNumber !== "0") {
            const created = await GroundSeatBooking.create({
                seatNumber,
                email: user2.email,
            });
            if (!created)
                return res.status(400).json({ massage: "Seat is not available" });
        }

        // --- Prepare User Update Object safely ---
        const updateData = {
            Plan_Type: plandata.title,
            Duration: plandata.duration,
            Monthly_cost: plandata.price,
            Seat_Number: seatNumber,
            Location: plandata.premium,
            Active: true,
            Starting_Date: req.body.startDate,
            Day_Remining: Number(req.body.Day_Remining || 0),
            Locker: req.body.locker === "true",
            Floor: plandata.floors,
            Totalamount: Number(req.body.Totalamount || 0),
            Enddate: formattedEndDate,
        };

        // Only include image if file exists
        if (req.file && req.file.filename) {
            updateData.image = req.file.filename;
        }

        // --- Update User ---
        await User.findByIdAndUpdate(_id, { $set: updateData }, { new: true });

        // --- Success Response ---
        res.status(200).json({ massage: "Your plan is successfully booked" });
    } catch (error) {
        console.error("Adddata ERROR:", error);
        res.status(500).json({ massage: "Internal server error" });
    }
};

// const Adddata = async(req, res) => {
//     try {
//         console.log(req.body)
//         const token = req.cookies.token;
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const _id = decoded.id;

//         const plandata = JSON.parse(req.body.PlaneData);
//         const user2 = await User.findById(_id);
//         console.log(user2)
//         if (user2.Active) return res.status(404).json({ massage: "You  can not book becouse you allready  booked  you cand  changa  nad  extend  youre  subcription" })
//         const startDate = new Date(req.body.startDate);
//         const endDate = new Date(startDate);
//         endDate.setDate(endDate.getDate() + Number(req.body.Day_Remining || 0));
//         const formattedEndDate = endDate.toISOString().split("T")[0];
//         if (plandata.premium && req.body.Seatnumber != "0") {
//             const creted = await topSeetBooking.create({ seatNumber: req.body.Seatnumber, email: user2.email });
//             if (!creted) return res.status(404).json({ massage: "set is  not avalibel" })
//         } else {
//             if (req.body.Seatnumber != "0") {
//                 const creted = await GroundSeatBooking.create({ seatNumber: req.body.Seatnumber, email: user2.email });
//                 if (!creted) return res.status(404).json({ massage: "set is  not avalibel" })

//             }

//         }
//         await User.findByIdAndUpdate(
//             _id, {
//                 $set: {
//                     image: req.file ? req.file.filename : undefined,
//                     Plan_Type: plandata.title,
//                     Duration: plandata.duration,
//                     Monthly_cost: plandata.price,
//                     Seat_Number: req.body.Seatnumber,
//                     Location: plandata.premium,
//                     Active: true,
//                     Starting_Date: req.body.startDate,
//                     Day_Remining: req.body.Day_Remining,
//                     Locker: req.body.locker,
//                     Floor: plandata.floors,
//                     Totalamount: req.body.Totalamount,
//                     Enddate: formattedEndDate
//                 }
//             }, { new: true }
//         );

//         res.status(200).json({ massage: "Youre  Plane is successfuly  Booked" })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ massage: "inter nal selver error" })
//     }

// }


const cheqActive = async(req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Login first" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Login first" });
        const _id = decoded.id;
        const user2 = await User.findById(_id);
        if (user2.Active) return res.status(404).json({ message: "You  can not book becouse you allready  booked  you cand  changa  nad  extend  youre  subcription", success: false })
        return res.status(200).json({ success: true })
    } catch (error) {
        res.status(500).json({ message: "Somthing  went wrong" })
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
        if (req.body.seat == "0") return res.status(404).json({ massage: "seat is no  seleccted" })
        const userfound = await User.findById(_id);


        if (userfound.Location == true) {
            isvalid = await topSeetBooking.findOne({ email: userfound.email })
            if (isvalid && isvalid.email != userfound.email) {
                return res.status(404).json({ massage: "Allready  Booked You can not change chosee deffrent seat" })
            }
            await topSeetBooking.findOneAndUpdate({ email: userfound.email }, { seatNumber: req.body.seat });
        } else {
            isvalid = await GroundSeatBooking.findOne({ email: userfound.email })
            if (isvalid && isvalid.email != userfound.email) {
                return res.status(404).json({ massage: "Allready  Booked You can not change chosee deffrent seat" })
            }
            await GroundSeatBooking.findOneAndUpdate({ email: userfound.email }, { seatNumber: req.body.seat });

        }
        userfound.Seat_Number = req.body.seat;
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
        res.status(500).json({ massage: "somthing  went  wronge" })

    }
}
const topflor = async(req, res) => {
        try {
            const booked = await topSeetBooking.find({}, "seatNumber");

            const bookedSeats = booked.map(b => b.seatNumber);
            res.status(200).json({ data: bookedSeats })
        } catch (error) {
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

        if (userfound.Location) {
            await topSeetBooking.deleteOne({ email: userfound.email })
        } else {
            await GroundSeatBooking.deleteOne({ email: userfound.email });
        }

        await userfound.save()
        res.status(200).json({ massage: "Subcription cancile" })
    } catch (error) {
        res.status(500).json({ massage: "somthin went  wrong" })
    }
}

// function updateRemainingDays(user) {
//     if (!user.Active) return user;

//     const today = new Date();
//     const startDate = new Date(user.Starting_Date);

//     const diffTime = today - startDate;
//     const passedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

//     const remaining = user.Day_Remining - passedDays;

//     user.Day_Remining = remaining > 0 ? remaining : 0;

//     if (user.Day_Remining === 0) {
//         user.Active = false;
//     }

//     return user;
// }

// const descrase = async(req, res) => {
//     try {
//         const token = req.cookies.token;
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         const _id = decoded.id;
//         const user = await User.findById(_id);
//         updateRemainingDays(user);
//         await user.save()
//     } catch (error) {
//         res.status(500).json({ massage: "somthing  went  wrong" })
//     }

// }


const complainpush = async(req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) return res.status(401).json({ message: "Login first" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) return res.status(401).json({ message: "Login first" });
        const _id = decoded.id;
        const user2 = await User.findById(_id);
        await Complain.create({
            name: user2.name,
            email: user2.email,
            image: user2.image,
            Usercomplain: req.body.Usermassage,
            complete: false
        })
        res.status(201).json({ message: "Complaint submitted successfully" });
    } catch (error) {

        res.status(500).json({ massage: "internal error" })
    }
}

const getComplain = async(req, res) => {
    try {
        const data = await Complain.find()
        res.status(200).json({ Data: data })
    } catch (error) {

        res.status(500).json({ massage: "internal error" })
    }
}
const markCompletcomplain = async(req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await Complain.findById(id);

        deletedUser.complete = true
        await deletedUser.save()
        res.status(200).json({ massage: "Complain complete" })
    } catch (error) {
        console.log(error)
        res.status(500).json({ massage: "internal error" })
    }
}

module.exports = { Adddata, SendData, Seatupdate, CancilSubscription, gaetSeat, topflor, cheqActive, complainpush, getComplain, markCompletcomplain }
