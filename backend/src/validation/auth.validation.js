const { isBlank, isEmail } = require("../utils/validation");

exports.validateRegister = ({ body }) => {
  const errors = [];

  if (isBlank(body.name)) errors.push("Name is required");
  if (isBlank(body.email) || !isEmail(body.email)) errors.push("Valid email is required");
  if (isBlank(body.password) || String(body.password).length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  return errors;
};

exports.validateLogin = ({ body }) => {
  const errors = [];

  if (isBlank(body.email) || !isEmail(body.email)) errors.push("Valid email is required");
  if (isBlank(body.password)) errors.push("Password is required");

  return errors;
};
