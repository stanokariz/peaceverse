import Redis from "ioredis";
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import dotenv from "dotenv";
dotenv.config();

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

/**
 * Use this limiter on auth routes to limit abuse.
 * configure windowMs and max as needed.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }),
  message: "Too many requests from this IP, please try again later.",
});
