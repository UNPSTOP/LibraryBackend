const mongoose = require('mongoose');
const Feedback1 = new mongoose.Schema({
   name:String,
   message:String,
   rating:Number
                
});

const Feedback = mongoose.model("Feedback", Feedback1);

module.exports = Feedback;