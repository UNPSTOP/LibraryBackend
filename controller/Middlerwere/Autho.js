const jwt = require("jsonwebtoken");

async function isLoging(req, res, next) {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: "Login first" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.status(401).json({ message: "Invalid token" });
        }
        next();
    } catch (error) {
        return res.status(401).json({ message: "Session expired, please login again" });
    }
}

module.exports = isLoging;