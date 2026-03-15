const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Server Error";

  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier";
  }

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)[0]?.message || "Validation error";
  }

  if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate value";
  }

  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Unauthorized";
  }

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;
