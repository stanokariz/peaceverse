// middleware/auth.js
import WebUser from "../models/WebUser.js";
import { verifyAccessToken } from "../utils/jwtManager.js";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Missing access token" });
    const payload = verifyAccessToken(token);
    if (payload.type !== "access") return res.status(401).json({ message: "Invalid token type" });

    const user = await WebUser.findById(payload.sub).select("-passwordHash");
    if (!user || !user.isActive) return res.status(403).json({ message: "User not allowed" });

    req.user = user;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token", error: err.message });
  }
}

export function requireRole(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthenticated" });
    if (roles.includes(req.user.role) || req.user.role === "admin") return next();
    return res.status(403).json({ message: "Insufficient role" });
  };
}
