const User = require("../models/User");
const AppError = require("../utils/AppError");
const { getPagination, formatPaginatedResult } = require("../utils/pagination");
const { escapeRegex } = require("../utils/query");

exports.list = async ({ role, status, search, page, limit }) => {
  const query = {};
  const pagination = getPagination({ page, limit });

  if (role) {
    query.role = role;
  }

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: escapeRegex(search), $options: "i" } },
      { email: { $regex: escapeRegex(search), $options: "i" } }
    ];
  }

  const [data, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .select("-passwordHash"),
    User.countDocuments(query)
  ]);

  return formatPaginatedResult({ data, total, page: pagination.page, limit: pagination.limit });
};

exports.getById = async (userId) => {
  const user = await User.findById(userId).select("-passwordHash");

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

exports.update = async (userId, payload) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (payload.name !== undefined) user.name = payload.name;
  if (payload.phone !== undefined) user.phone = payload.phone;
  if (payload.role !== undefined) user.role = payload.role;
  if (payload.status !== undefined) user.status = payload.status;

  await user.save();

  return User.findById(userId).select("-passwordHash");
};
