
const User = require("../models/userSchema");
const bcrypt = require('bcrypt');

const signup = async (req, res) => {

    try {
        const { name, email, password } = req.body;
        if(!name || !password || !email){
            return res.status(500)
            .json({
                message:"All field's are require",
                success:false
            })
        }
        const user = await User.findOne({ email: email });
        if (user) {
            return res.status(409)
                .json({
                    message: "User is already exist, you can login",
                    success: false
                })
        }
        const newUser = new User({ name, email, password });
        newUser.password = await bcrypt.hash(password, 10);
        await newUser.save();
        res.status(200)
            .json({
                message: "Signup successfully",
                success: true
            })

    } catch (err) {
        console.log(err);
        res.status(500)
            .json({
                message: "Somthig wrong in internal server ",
                success: false
            })
    }
};

const login = async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(409)
            .json({
                message: "Auth failed email or password is wrong",
                success: false
            })
        }
        const isPassEqual = await bcrypt.compare(password, user.password);
        if(!isPassEqual){
            return res.status(400)
            .json({
                message: "Auth failed email or password is wrong",
                success: false
            })
        }
        res.status(200)
        .json({
            message: "Login Successfully",
            success: true
        })

    }catch(err){
        console.log(err);
        res.status(500)
        .json({
            message:"Somting wrong in intervel Server",
            success: false
        })
    }
};

const forgetPassword = async (req, res) => {
    try{
        const {email} = req.body;
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(400)
            .json({
                message: "Wrong email",
                success: false
            })
        }

        res.status(200)
        .json({
            message: "Email Varify Successfully",
            success: true
        })


    }catch(err){
        res.status(500)
        .json({
            message: "Somthing woeng in interval server",
            success: false
        })
    }
}

module.exports ={
    signup,
    login,
    forgetPassword
}