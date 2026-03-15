const mongoose = require("mongoose");

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === "string" && value.trim() === "");

const isEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isMongoId = (value) => mongoose.Types.ObjectId.isValid(value);

const oneOf = (value, allowedValues) => allowedValues.includes(value);
const isBooleanString = (value) => value === "true" || value === "false";

module.exports = {
  isBlank,
  isEmail,
  isMongoId,
  oneOf,
  isBooleanString
};
