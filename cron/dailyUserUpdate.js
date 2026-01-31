const cron = require("node-cron");
const User = require("../models/userSchema"); // adjust path

// Wrap your cron job in a function
function startDailyUserUpdate() {
    cron.schedule("0 0 * * *", async() => { // every second for testing
        try {
            console.log("⏳ Running daily user plan update...");

            await User.updateMany({ Active: true, Day_Remining: { $gt: 0 } }, { $inc: { Day_Remining: -1 } });

            await User.updateMany({ Active: true, Day_Remining: { $lte: 0 } }, { $set: { Active: false, Day_Remining: 0 } });

            console.log("✅ Daily user update completed");
        } catch (error) {
            console.error(error);
        }
    }, {
        scheduled: true,
        timezone: "Asia/Kolkata"
    });
}

// Export the function
module.exports = startDailyUserUpdate;