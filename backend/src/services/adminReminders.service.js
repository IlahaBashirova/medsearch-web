const Reminder = require("../models/Reminder");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");

exports.list = async ({ userId, enabled, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (userId) {
    query.userId = userId;
  }

  if (enabled !== undefined) {
    query.isEnabled = enabled === "true";
  }

  const [data, total] = await Promise.all([
    Reminder.find(query)
      .sort({ scheduledAt: 1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("userId", "name email")
      .populate("medicineId", "name"),
    Reminder.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.create = async (payload) => Reminder.create(payload);

exports.update = async (reminderId, payload) => {
  const reminder = await Reminder.findById(reminderId);

  if (!reminder) {
    throw new AppError("Reminder not found", 404);
  }

  Object.assign(reminder, payload);
  await reminder.save();

  return reminder;
};
