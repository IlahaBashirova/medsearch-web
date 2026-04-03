const { isBlank } = require("../utils/validation");

exports.validateUserReminderCreate = ({ body }) => {
  const errors = [];

  if (isBlank(body.name)) errors.push("Reminder name is required");
  if (isBlank(body.dose)) errors.push("Reminder dose is required");

  if (!Number.isFinite(Number(body.timesPerDay)) || Number(body.timesPerDay) < 1) {
    errors.push("timesPerDay is required");
  }

  if (!Array.isArray(body.hours) || body.hours.length === 0) {
    errors.push("At least one hour is required");
  }

  return errors;
};

exports.validateUserReminderIdParam = ({ params }) => {
  const errors = [];

  if (isBlank(params.reminderId)) errors.push("Valid reminderId is required");

  return errors;
};
