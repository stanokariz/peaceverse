import jwt from "jsonwebtoken";
import WebUser from "../models/WebUser.js";


export const requireAuth = async (req, res, next) => {
  const token = req.cookies?.accessToken;
  if (!token) return res.status(401).json({ message: "No access token" });

  try {
    const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await WebUser.findById(payload.sub).select("-passwordHash");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (!user.isActive) return res.status(403).json({ message: "User not allowed" });

    req.user = user;
    next();
  } catch (err) {
    // differentiate expired token from invalid
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }
    res.status(401).json({ message: "Invalid token", error: err.message });
  }
};



export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
};


// Role-based middleware
export const requireRole = (roles = []) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!roles.includes(req.user.role) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  next();
};
