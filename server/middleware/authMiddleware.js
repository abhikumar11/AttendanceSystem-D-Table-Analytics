const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

const protect = async (req, res, next) => {
     let token;
     if (
          req.headers.authorization &&
          req.headers.authorization.startsWith("Bearer")
     ) {
          token = req.headers.authorization.split(" ")[1];
     }
     if (!token) {
          return res.status(401).json({ message: "Not authorized, no token" });
     }
     try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          req.user = await User.findById(decoded.id).select("-password");
          if (!req.user) {
               return res.status(401).json({ message: "User no longer exists" });
          }
          next();
     } catch (error) {
          logger.error(`Auth error: ${error.message}`);
          return res
               .status(401)
               .json({ message: "Not authorized, token failed" });
     }
};

const authorize = (...roles) => (req, res, next) => {
     if (!roles.includes(req.user.role)) {
          return res.status(403).json({ message: "Forbidden for this role" });
     }
     next();
};

module.exports = { protect, authorize };
