
const jwt = require("jsonwebtoken");
const SuperAdmin = require("../models/SuperAdmin");
const Admin = require("../models/Admin");

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

const superadminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin")
    return res.status(403).json({ message: "Access denied" });
  next();
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin" && req.user.role !== "superadmin")
    return res.status(403).json({ message: "Access denied" });
  next();
};

const ownerOnly = (req, res, next) => {
  if (req.user.role !== "owner") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
module.exports = { protect, superadminOnly, adminOnly,ownerOnly };
