const cron = require("node-cron");
const User = require("../models/userSchema");
const GroundSeatBooking = require("../models/Groundflor");
const topSeetBooking = require("../models/Topflor")// adjust path

function startDailyUserUpdate() {
    cron.schedule("* * * * *", async () => { // runs daily at midnight
        try {
            console.log("⏳ Running daily user plan update...");

            // Decrement remaining days for active users
            await User.updateMany(
                { Active: true, Day_Remining: { $gt: 0 } },
                { $inc: { Day_Remining: -1 } }
            );

            // Find users who should now become inactive
            const usersToDeactivate = await User.find({
                Active: true,
                Day_Remining: { $lte: 0 }
            });

            // Mark them inactive and set remaining days to 0
            await User.updateMany(
                { _id: { $in: usersToDeactivate.map(u => u._id) } },
                { $set: { Active: false, Day_Remining: 0 } }
            );

            // Delete seat bookings for these users
            for (const user of usersToDeactivate) {
                if (user.Location) {
                    await topSeetBooking.deleteMany({ email: user.email });
                } else {
                    await GroundSeatBooking.deleteMany({ email: user.email });
                }
            }

            console.log("✅ Daily user update and seat cleanup completed");
        } catch (error) {
            console.error(error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}

module.exports = startDailyUserUpdate;

