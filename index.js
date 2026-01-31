require('dotenv').config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const startDailyUserUpdate = require("./cron/dailyUserUpdate");
const path = require("path");
const UserRouter = require("./router/UserRouting.js")
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: ["https://library-three-mocha.vercel.app", "http://localhost:5173"],
    credentials: true
}));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected...")
        startDailyUserUpdate();
    })


app.use(
    "/upload",
    express.static(path.join(__dirname, "upload"), {
        setHeaders: (res, filePath) => {
            if (filePath.endsWith(".jpg") || filePath.endsWith(".jpeg")) {
                res.setHeader("Content-Type", "image/jpeg");
            }
            if (filePath.endsWith(".png")) {
                res.setHeader("Content-Type", "image/png");
            }
        }
    })
);
app.use('/library/user', UserRouter);

app.listen(PORT, () => {
    console.log(`app is listing on port ${PORT}`);
})