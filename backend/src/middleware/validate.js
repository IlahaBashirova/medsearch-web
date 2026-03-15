const AppError = require("../utils/AppError");

module.exports = (validator) => (req, res, next) => {
  const payload = {
    body: req.body || {},
    params: req.params || {},
    query: req.query || {},
    user: req.user || null
  };

  const errors = validator(payload);

  if (errors.length > 0) {
    return next(new AppError(errors[0], 400));
  }

  return next();
};
