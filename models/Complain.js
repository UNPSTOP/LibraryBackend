const mongoose = require('mongoose');
const Complain1 = new mongoose.Schema({
    name: String,
    email: String,
    image: String,
    Usercomplain: String,
    complete: Boolean
});

const Complain = mongoose.model("Complain", Complain1);

module.exports = Complain;