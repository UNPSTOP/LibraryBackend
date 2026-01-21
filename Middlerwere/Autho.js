const jwt = require('jsonwebtoken')

async function isLoging(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.status(400).json({ massage: "is not valid token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) return res.status(400).json({ massage: "is not valid token" });
    next();
}
module.exports = isLoging