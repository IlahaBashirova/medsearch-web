const AppError = require("../utils/AppError");

module.exports = (selector) => (req, res, next) => {
  const targetUserId = selector(req);

  if (!req.user) {
    return next(new AppError("Unauthorized", 401));
  }

  if (req.user.role === "ADMIN" || String(req.user.id) === String(targetUserId)) {
    return next();
  }

  return next(new AppError("Forbidden", 403));
};
