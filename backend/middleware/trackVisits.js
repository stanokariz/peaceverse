import redis from "../utils/redisClient.js";

export const trackVisit = async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const rawPage = req.originalUrl || "unknown";

    // Sanitize page path for Redis key (replace slashes and question marks)
    const page = rawPage.replace(/[\/?&=]/g, "_");

    // Increment total site visits
    await redis.incr("site:visits:total");

    // Increment today's visits
    await redis.incr(`site:visits:${today}`);

    // Increment page-specific visits
    await redis.incr(`site:page:${page}:visits`);

    // Increment page-specific visits today
    await redis.incr(`site:page:${page}:visits:${today}`);

    next();
  } catch (err) {
    console.error("❌ Failed to track visit:", err);
    next(); // Don't block request if Redis fails
  }
};
