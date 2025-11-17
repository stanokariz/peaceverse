import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

// Generate access + refresh tokens
export const generateTokens = (user) => {
  const jti = uuidv4(); // unique ID for refresh token

  const accessToken = jwt.sign(
    { sub: user._id, role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { sub: user._id, role: user.role, jti },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken, jti };
};

// Verify tokens
export const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
};
