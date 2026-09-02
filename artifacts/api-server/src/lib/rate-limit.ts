import type { RequestHandler } from "express";

const buckets = new Map<string, { count: number; reset: number }>();
export function rateLimit(limit: number, windowMs: number): RequestHandler {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.reset <= now) buckets.set(key, { count: 1, reset: now + windowMs });
    else if (++bucket.count > limit) {
      res.status(429).json({ error: "Too many requests", retryAfter: Math.ceil((bucket.reset - now) / 1000) });
      return;
    }
    next();
  };
}