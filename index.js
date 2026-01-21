require('dotenv').config();

const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const UserRouter = require("./router/UserRouting.js")
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("MongoDB Connected...")
    })

app.use('/library/user', UserRouter);

app.listen(PORT, () => {
    console.log(`app is listing on port ${PORT}`);
})