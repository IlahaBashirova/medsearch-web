const AppError = require("../utils/AppError");

const buckets = new Map();

module.exports = ({ windowMs, maxRequests, keyPrefix = "global" }) => (req, res, next) => {
  const now = Date.now();
  const key = `${keyPrefix}:${req.ip}`;
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (entry.count >= maxRequests) {
    return next(new AppError("Too many requests, please try again later", 429));
  }

  entry.count += 1;
  return next();
};
