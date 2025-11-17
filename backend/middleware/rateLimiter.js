// middleware/rateLimiter.js
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export const rateLimiter = async (req, res, next) => {
  const ip = req.ip;
  const key = `auth_rate_${ip}`;
  const count = await redis.incr(key);

  if (count === 1) await redis.expire(key, 60); // 1 minute window
  if (count > 5)
    return res
      .status(429)
      .json({ message: "Too many requests, please try again later." });

  next();
};
