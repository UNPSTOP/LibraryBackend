// const jwt = require('jsonwebtoken')

// async function isLoging(req, res, next) {
//     const token = req.cookies.token;
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) return res.status(400).json({ massage: "is not valid token" });
//     next();
//     // return res.status(200).json({ massage: "is valid token" })
// }
// module.exports = isLoging